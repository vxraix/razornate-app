import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import { prisma } from './prisma'

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

        // For demo purposes - accept any password
        // In production, store hashed passwords and verify them
        // Fetch fresh user data to ensure role is current
        const freshUser = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        return {
          id: freshUser!.id,
          email: freshUser!.email,
          name: freshUser!.name,
          image: freshUser!.image,
          role: freshUser!.role, // Use fresh role from database
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
      
      // Handle OAuth providers
      if (account && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! }
        })
        
        if (dbUser) {
          token.role = dbUser.role
          token.id = dbUser.id
        } else if (token.email) {
          // Create user on first OAuth login
          const newUser = await prisma.user.create({
            data: {
              email: token.email,
              name: token.name || token.email.split('@')[0],
              image: token.picture,
              role: 'CLIENT',
            }
          })
          token.role = newUser.role
          token.id = newUser.id
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

