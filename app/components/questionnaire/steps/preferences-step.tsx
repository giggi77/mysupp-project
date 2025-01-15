"use client"

import { Button } from "@/components/ui/button"
import { useQuestionnaire } from "../questionnaire-context"
import { Check } from 'lucide-react'
import { useState } from "react"

export function PreferencesStep() {
  const { updateResponses, setCurrentStep } = useQuestionnaire()
  const [selected, setSelected] = useState<string[]>([])

  const preferences = [
    {
      id: "quality",
      title: "Nejvyšší kvalita",
      description: "Nezáleží mi na ceně, chci jen nejlepší kvalitu"
    },
    {
      id: "price",
      title: "Střední cesta",
      description: "Hledám poměr cena-výkon"
    },
    {
      id: "budget",
      title: "Cenově nejdostupnější",
      description: "Cenově nejdostupnější varianty"
    }
  ]

  const toggleSelection = (id: string) => {
    setSelected(prev => 
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  const handleContinue = () => {
    updateResponses({ selectionPreferences: selected })
    setCurrentStep(6)
  }

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">
          Co je pro tebe důležité při výběru?
        </h2>
      </div>

      <div className="space-y-4">
        {preferences.map((pref) => (
          <Button
            key={pref.id}
            variant="outline"
            className={`w-full h-auto py-4 px-6 flex justify-between items-center ${
              selected.includes(pref.id) ? 'border-primary' : ''
            }`}
            onClick={() => toggleSelection(pref.id)}
          >
            <div className="text-left">
              <div className="font-medium">{pref.title}</div>
              <div className="text-sm text-muted-foreground">
                {pref.description}
              </div>
            </div>
            {selected.includes(pref.id) && (
              <Check className="h-5 w-5 text-primary" />
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

