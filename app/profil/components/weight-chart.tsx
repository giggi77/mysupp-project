"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Weight } from 'lucide-react'
import { format, eachDayOfInterval, parseISO, isWithinInterval } from 'date-fns'
import { cs } from 'date-fns/locale'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from "@/app/components/auth/auth-context"
import { supabase } from "@/lib/supabase"

interface WeightChartProps {
  onWeightUpdate: (weight: number) => void
}

export function WeightChart({ onWeightUpdate }: WeightChartProps) {
  const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>([])
  const [newWeight, setNewWeight] = useState("")
  const [showInput, setShowInput] = useState(false)
  const { user } = useAuth()

  const fetchWeightHistory = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('user_weight')
          .select('date, weight')
          .eq('user_id', user.id)
          .order('date', { ascending: true })

        if (error) {
          console.error('Chyba při načítání historie váhy:', error.message, error.details)
        } else if (data) {
          console.log('Historie váhy úspěšně načtena:', data)
          setWeightHistory(data)
        }
      } catch (error) {
        console.error('Neočekávaná chyba při načítání historie váhy:', error)
      }
    }
  }

  useEffect(() => {
    fetchWeightHistory()
  }, [user])

  // Vytvoření pole všech dnů v rozsahu
  const getDaysArray = () => {
    if (!weightHistory || weightHistory.length === 0) return []

    const startDate = parseISO(weightHistory[0].date)
    const endDate = new Date()

    const allDays = eachDayOfInterval({ start: startDate, end: endDate })
    
    return allDays.map((day, index) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const weightEntry = weightHistory.find(entry => entry.date === dateStr)
      return {
        date: dateStr,
        weight: weightEntry?.weight || null,
        index: index // Přidáme index pro zajištění unikátnosti
      }
    })
  }

  const handleSubmit = async () => {
    const weight = parseFloat(newWeight)
    if (!isNaN(weight) && user) {
      const newEntry = {
        user_id: user.id,
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: weight
      }

      try {
        const { data, error } = await supabase
          .from('user_weight')
          .upsert([newEntry], {
            onConflict: 'user_id,date'
          })

        if (error) {
          throw error
        }

        console.log('Váha úspěšně uložena:', data)
        setWeightHistory([...weightHistory, { date: newEntry.date, weight: newEntry.weight }])
        onWeightUpdate(weight)
        setNewWeight("")
        fetchWeightHistory() // Znovu načteme data pro případ, že by se něco změnilo na serveru
      } catch (error) {
        console.error('Chyba při ukládání váhy:', error)
        showError('Došlo k chybě při ukládání váhy. Zkuste to prosím znovu.')
      }
    }
  }

  const showError = (message: string) => {
    // Zde můžete implementovat zobrazení chybové zprávy uživateli
    // Například pomocí toast notifikace nebo alert
    console.error(message)
    // Příklad použití toast notifikace (pokud používáte knihovnu pro toast):
    // toast.error(message)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-gray-500 text-xs mb-1">
            {format(parseISO(payload[0].payload.date), 'd. MMMM yyyy', { locale: cs })}
          </p>
          <p className="text-gray-900 font-bold text-lg">
            {payload[0].value} kg
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gray-50">
      <CardHeader className="pb-2 flex justify-between items-center">
        <Weight className="h-6 w-6 text-gray-500" />
        <button
          onClick={() => setShowInput(true)}
          className="text-sm px-3 py-1 bg-gradient-to-r from-gray-800 to-gray-600 text-white rounded-full hover:from-gray-700 hover:to-gray-500 transition-colors shadow-sm flex items-center opacity-80 hover:opacity-100"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Přidat</span>
        </button>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="w-full h-[200px] sm:h-[250px] pt-2 bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg shadow-inner">
          <ResponsiveContainer>
            <AreaChart data={getDaysArray()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} animationBegin={0} animationDuration={1500} animationEasing="ease-out">
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.4} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(parseISO(date), 'd/M')}
                stroke="#6b7280"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="#6b7280"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                width={30}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip content={<CustomTooltip />} />
              {weightHistory.length > 0 && (
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  fill="url(#weightGradient)"
                  strokeWidth={2}
                  dot={(props: any) => {
                    if (!props.payload.weight) return null;
                    return (
                      <circle
                        key={`dot-${props.payload.date}-${props.index}`}
                        cx={props.cx}
                        cy={props.cy}
                        r={3}
                        fill="#3b82f6"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {showInput ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Váha v kg"
              className="flex-1 max-w-[120px]"
            />
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Uložit
            </button>
          </div>
        ) : (
          <></>
        )}
      </CardContent>
    </Card>
  )
}

