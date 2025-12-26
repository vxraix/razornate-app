import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          // User must sign up first before they can sign in
          return null
        }

        // Verify password if user has one stored (credentials auth)
        if (user.password) {
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          if (!isValidPassword) {
            return null
          }
        } else {
          // If no password stored (OAuth user), reject credentials login
          return null
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET ? [
      AppleProvider({
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
      })
    ] : []),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role || 'CLIENT'
        token.id = user.id
      }
      
      // Always fetch fresh role from database to ensure it's current
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email }
        })
        if (dbUser) {
          token.role = dbUser.role // Always use fresh role from DB
          token.id = dbUser.id
        }
      }
      
      // Handle OAuth providers - link accounts properly
      if (account) {
        // Check if account already exists
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          include: { user: true },
        })

        if (existingAccount) {
          // Account exists, use existing user
          token.role = existingAccount.user.role
          token.id = existingAccount.user.id
        } else if (token.email) {
          // Check if user exists with this email (link accounts)
          const existingUser = await prisma.user.findUnique({
            where: { email: token.email },
          })

          if (existingUser) {
            // Link OAuth account to existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            })
            // Update user image if from OAuth
            if (token.picture && !existingUser.image) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { image: token.picture },
              })
            }
            token.role = existingUser.role
            token.id = existingUser.id
          } else {
            // Create new user with OAuth account
            const newUser = await prisma.user.create({
              data: {
                email: token.email,
                name: token.name || token.email.split('@')[0],
                image: token.picture,
                role: 'CLIENT',
                emailVerified: new Date(),
                accounts: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    refresh_token: account.refresh_token,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    session_state: account.session_state,
                  },
                },
              },
            })
            token.role = newUser.role
            token.id = newUser.id
          }
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) || 'CLIENT'
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

