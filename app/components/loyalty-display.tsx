'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gift, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface LoyaltyDisplayProps {
  points: number
  pointsForFreeCut?: number
}

export function LoyaltyDisplay({ points, pointsForFreeCut = 100 }: LoyaltyDisplayProps) {
  const progress = Math.min((points / pointsForFreeCut) * 100, 100)
  const cutsUntilFree = Math.ceil((pointsForFreeCut - points) / 10)

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent" />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-gold-500" />
            <h3 className="font-semibold text-white">Loyalty Points</h3>
          </div>
          <Badge variant="default" className="text-lg px-3 py-1">
            {points} pts
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Progress to free cut</span>
            <span>{pointsForFreeCut - points} pts remaining</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gold-500 to-gold-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          {cutsUntilFree > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {cutsUntilFree} more {cutsUntilFree === 1 ? 'visit' : 'visits'} for a free cut!
            </p>
          )}
          {points >= pointsForFreeCut && (
            <div className="flex items-center gap-2 mt-2 text-gold-500">
              <Star className="w-4 h-4" />
              <span className="text-sm font-semibold">You&apos;ve earned a free cut!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}




