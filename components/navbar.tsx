'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Scissors, Menu, X, User, Calendar, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  console.log(session)
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/50 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-gold-500" />
            <span className="text-xl font-bold text-white">Razornate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/book" className="text-gray-300 hover:text-gold-500 transition-colors">
              Book
            </Link>
            <Link href="/portfolio" className="text-gray-300 hover:text-gold-500 transition-colors">
              Portfolio
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-300 hover:text-gold-500 transition-colors">
                  Dashboard
                </Link>
                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin" className="text-gray-300 hover:text-gold-500 transition-colors">
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-4">
                  <Link href="/profile">
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-800 animate-slide-down">
            <Link
              href="/book"
              className="block text-gray-300 hover:text-gold-500 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book
            </Link>
            <Link
              href="/portfolio"
              className="block text-gray-300 hover:text-gold-500 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Portfolio
            </Link>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-gray-300 hover:text-gold-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {session.user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="block text-gray-300 hover:text-gold-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-300 hover:text-gold-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block text-gray-300 hover:text-gold-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block text-gray-300 hover:text-gold-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

