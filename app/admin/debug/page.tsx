'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'

export default function DebugPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12">
      <Navbar />
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Session Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-white text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
            <div className="mt-4 p-4 bg-gray-900 rounded">
              <p className="text-white mb-2">
                <strong>Role:</strong> {session?.user?.role || 'NOT SET'}
              </p>
              <p className="text-white mb-2">
                <strong>Email:</strong> {session?.user?.email || 'NOT SET'}
              </p>
              <p className="text-white">
                <strong>Is Admin:</strong> {session?.user?.role === 'ADMIN' ? 'YES ✅' : 'NO ❌'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}






