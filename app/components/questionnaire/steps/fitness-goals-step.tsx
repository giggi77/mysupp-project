"use client"

import { Button } from "@/components/ui/button"
import { useQuestionnaire } from "../questionnaire-context"
import { Check } from 'lucide-react'
import { useState } from "react"

export function FitnessGoalsStep() {
  const { updateResponses, setCurrentStep } = useQuestionnaire()
  const [selected, setSelected] = useState<string[]>([])

  const goals = [
    { id: "muscle", label: "Nárůst svalů" },
    { id: "strength", label: "Síla" },
    { id: "endurance", label: "Energie" },
    { id: "fat-loss", label: "Spalování tuků" },
    { id: "recovery", label: "Regenerace" },
    { id: "health", label: "Zdraví" },
    { id: "immunity", label: "Imunita" },
    { id: "sleep", label: "Spánek" },
    { id: "focus", label: "Soustředění" }
  ]

  const toggleSelection = (id: string) => {
    setSelected(prev => 
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  const handleContinue = () => {
    updateResponses({ fitnessGoals: selected })
    setCurrentStep(7)
  }

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">
          Jaké jsou tvé cíle? Co zlepšit?
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {goals.map((goal) => (
          <Button
            key={goal.id}
            variant="outline"
            className={`h-20 relative ${
              selected.includes(goal.id) ? 'border-primary' : ''
            }`}
            onClick={() => toggleSelection(goal.id)}
          >
            {goal.label}
            {selected.includes(goal.id) && (
              <div className="absolute top-2 right-2">
                <Check className="h-4 w-4 text-primary" />
              </div>
            )}
          </Button>
        ))}
      </div>

      <Button
        className="w-full"
        onClick={handleContinue}
        disabled={selected.length === 0}
      >
        Pokračovat
      </Button>
    </div>
  )
}

