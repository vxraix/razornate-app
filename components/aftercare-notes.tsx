'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'

interface AftercareNotesProps {
  appointmentId: string
  canEdit?: boolean
}

export function AftercareNotes({ appointmentId, canEdit = false }: AftercareNotesProps) {
  const { data: session } = useSession()
  const [instructions, setInstructions] = useState('')
  const [tips, setTips] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fetchAftercare = useCallback(async () => {
    try {
      const response = await fetch(`/api/aftercare?appointmentId=${appointmentId}`)
      const data = await response.json()
      if (response.ok && data) {
        setInstructions(data.instructions || '')
        setTips(data.tips || '')
      }
    } catch (error) {
      console.error('Error fetching aftercare:', error)
    } finally {
      setIsLoading(false)
    }
  }, [appointmentId])

  useEffect(() => {
    fetchAftercare()
  }, [appointmentId, fetchAftercare])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/aftercare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          instructions,
          tips,
        }),
      })

      if (response.ok) {
        toast.success('Aftercare notes saved!')
        setIsEditing(false)
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast.error('Failed to save aftercare notes')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-4 text-gray-400">Loading...</div>
  }

  if (!instructions && !canEdit) {
    return null
  }

  return (
    <Card className="glass-effect border-gold-500/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-500" />
          Aftercare Instructions
        </CardTitle>
        {canEdit && session?.user?.role === 'ADMIN' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && canEdit ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Instructions
              </label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter aftercare instructions..."
                className="min-h-[100px] bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Tips (optional)
              </label>
              <Textarea
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                placeholder="Enter additional tips..."
                className="min-h-[80px] bg-gray-900"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !instructions}
                className="glow-gold-hover"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  fetchAftercare()
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h4 className="font-medium mb-2">Instructions</h4>
              <p className="text-gray-300 whitespace-pre-wrap">{instructions}</p>
            </div>
            {tips && (
              <div>
                <h4 className="font-medium mb-2">Tips</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{tips}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}




