'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Gift, Copy, Check, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'

export function ReferralProgram() {
  const { data: session } = useSession()
  const [referrals, setReferrals] = useState<any[]>([])
  const [referralCode, setReferralCode] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchReferrals()
    fetchUserReferralCode()
  }, [session])

  const fetchReferrals = async () => {
    try {
      const response = await fetch('/api/referrals')
      const data = await response.json()
      if (response.ok) {
        setReferrals(data)
      }
    } catch (error) {
      console.error('Error fetching referrals:', error)
    }
  }

  const fetchUserReferralCode = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      if (response.ok && data.referralCode) {
        setReferralCode(data.referralCode)
      }
    } catch (error) {
      console.error('Error fetching referral code:', error)
    }
  }

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode)
      setCopied(true)
      toast.success('Referral code copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefer = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referredEmail: email }),
      })

      if (response.ok) {
        toast.success('Referral sent!')
        setEmail('')
        fetchReferrals()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send referral')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send referral')
    } finally {
      setIsLoading(false)
    }
  }

  const successfulReferrals = referrals.filter((r) => r.status !== 'PENDING').length

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-gold-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-gold-500" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">
              Share your referral code and earn rewards!
            </p>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                readOnly
                className="bg-gray-900 font-mono"
                placeholder="Your referral code"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                className="glow-gold-hover"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <p className="text-sm font-medium mb-2">Refer a Friend</p>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                className="flex-1"
              />
              <Button
                onClick={handleRefer}
                disabled={isLoading}
                className="glow-gold-hover"
              >
                Send
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-500" />
              <div>
                <p className="text-2xl font-bold text-gold-500">
                  {successfulReferrals}
                </p>
                <p className="text-xs text-gray-400">Successful Referrals</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {referrals.length > 0 && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-lg">Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{referral.referredEmail}</p>
                    <p className="text-xs text-gray-400">
                      Code: {referral.code}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      referral.status === 'COMPLETED'
                        ? 'bg-green-600 text-white'
                        : referral.status === 'SIGNED_UP'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {referral.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}






