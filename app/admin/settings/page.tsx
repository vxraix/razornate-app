'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [bankSettings, setBankSettings] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    if (status === 'authenticated') {
      fetchSettings()
    }
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/bank')
      const data = await response.json()
      if (response.ok) {
        setBankSettings(data)
      }
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings/bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankSettings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success('Bank settings saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12">
      <Navbar />
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
            Settings
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Configure your barbershop settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gold-500" />
              Bank Account Details
            </CardTitle>
            <CardDescription>
              Configure bank transfer payment details for customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Bank Name
              </label>
              <Input
                placeholder="e.g., Hakrinbank, DSB Bank"
                value={bankSettings.bankName}
                onChange={(e) =>
                  setBankSettings({ ...bankSettings, bankName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Account Number
              </label>
              <Input
                placeholder="Enter your bank account number"
                value={bankSettings.accountNumber}
                onChange={(e) =>
                  setBankSettings({
                    ...bankSettings,
                    accountNumber: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Account Holder Name
              </label>
              <Input
                placeholder="Name on the bank account"
                value={bankSettings.accountHolder}
                onChange={(e) =>
                  setBankSettings({
                    ...bankSettings,
                    accountHolder: e.target.value,
                  })
                }
              />
            </div>

            <div className="pt-4 border-t border-gray-800">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

