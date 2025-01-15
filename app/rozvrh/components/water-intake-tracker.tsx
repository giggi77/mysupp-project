"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Droplet, Plus, Minus, ChevronUp, ChevronDown } from 'lucide-react'
import { useAuth } from "@/app/components/auth/auth-context"
import { supabase } from "@/lib/supabase"

const GLASS_SIZE = 250 // ml

export function WaterIntakeTracker() {
  const [intake, setIntake] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(3000)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchWaterGoal()
    }
  }, [user])

  const fetchWaterGoal = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('water_goal')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Žádný záznam nebyl nalezen, použijeme výchozí hodnotu
          setDailyGoal(3000)
        } else {
          throw error
        }
      } else if (data) {
        setDailyGoal(data.water_goal || 3000)
      } else {
        setDailyGoal(3000)
      }
    } catch (error) {
      console.error('Chyba při načítání denního cíle vody:', error)
      setDailyGoal(3000)
    }
  }

  const updateWaterGoal = async (newGoal: number) => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user?.id, water_goal: newGoal })

      if (error) throw error

      setDailyGoal(newGoal)
    } catch (error) {
      console.error('Chyba při ukládání denního cíle vody:', error)
    }
  }

  const handleAddGlass = () => {
    setIntake(prev => Math.min(prev + GLASS_SIZE, dailyGoal))
  }

  const handleRemoveGlass = () => {
    setIntake(prev => Math.max(prev - GLASS_SIZE, 0))
  }

  const handleIncreaseDailyGoal = () => {
    const newGoal = dailyGoal + GLASS_SIZE
    updateWaterGoal(newGoal)
  }

  const handleDecreaseDailyGoal = () => {
    const newGoal = Math.max(dailyGoal - GLASS_SIZE, GLASS_SIZE)
    updateWaterGoal(newGoal)
  }

  const progress = (intake / dailyGoal) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-400 text-transparent bg-clip-text">
          <Droplet className="w-5 h-5 text-blue-500" />
          Příjem vody
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">
              {intake} ml / {dailyGoal} ml
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-6 h-6"
                onClick={handleDecreaseDailyGoal}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-6 h-6"
                onClick={handleIncreaseDailyGoal}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRemoveGlass}
                disabled={intake === 0 || dailyGoal === 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddGlass}
                disabled={intake === dailyGoal || dailyGoal === 0}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-300 to-blue-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.floor(intake / GLASS_SIZE)}</div>
              <div className="text-sm text-muted-foreground">Sklenic</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.floor((dailyGoal - intake) / GLASS_SIZE)}</div>
              <div className="text-sm text-muted-foreground">Zbývá</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.floor(dailyGoal / GLASS_SIZE)}</div>
              <div className="text-sm text-muted-foreground">Cíl</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

