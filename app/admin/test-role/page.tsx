'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { useRouter } from 'next/navigation'

export default function TestRolePage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const handleRefresh = async () => {
    await update()
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12">
      <Navbar />
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Role Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-900 rounded">
              <p className="text-white mb-2">
                <strong>Email:</strong> {session?.user?.email || 'Not signed in'}
              </p>
              <p className="text-white mb-2">
                <strong>Role in session:</strong> {session?.user?.role || 'NOT SET'}
              </p>
              <p className="text-white mb-2">
                <strong>Role type:</strong> {typeof session?.user?.role}
              </p>
              <p className="text-white mb-4">
                <strong>Is Admin:</strong> {String(session?.user?.role || '').toUpperCase() === 'ADMIN' ? '✅ YES' : '❌ NO'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={handleRefresh} className="w-full">
                Refresh Session
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin')}
                className="w-full"
              >
                Try Admin Page
              </Button>
            </div>

            <div className="mt-4 p-4 bg-gray-900 rounded">
              <p className="text-sm text-gray-400">
                If role is not ADMIN, you need to:
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-400 mt-2 space-y-1">
                <li>Sign out completely</li>
                <li>Sign back in with admin@razornate.com</li>
                <li>Click &quot;Refresh Session&quot; above</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}




