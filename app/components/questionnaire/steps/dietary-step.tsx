"use client"

import { Button } from "@/components/ui/button"
import { useQuestionnaire } from "../questionnaire-context"
import { Check } from 'lucide-react'
import { useState } from "react"

export function DietaryStep() {
  const { updateResponses, setCurrentStep } = useQuestionnaire()
  const [selected, setSelected] = useState<string[]>([])

  const diets = [
    { id: "vegetarian", label: "Vegetarián" },
    { id: "vegan", label: "Vegan" },
    { id: "paleo", label: "Paleo" },
    { id: "gluten-free", label: "Gluten Free" },
    { id: "sugar-free", label: "Sugar Free" },
    { id: "keto", label: "Keto" }
  ]

  const toggleSelection = (id: string) => {
    setSelected(prev => 
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  const handleContinue = () => {
    updateResponses({ dietaryPreferences: selected })
    setCurrentStep(8)
  }

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">
          Preferovaná Strava
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {diets.map((diet) => (
          <Button
            key={diet.id}
            variant="outline"
            className={`h-16 relative ${
              selected.includes(diet.id) ? 'border-primary' : ''
            }`}
            onClick={() => toggleSelection(diet.id)}
          >
            {diet.label}
            {selected.includes(diet.id) && (
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
      >
        Pokračovat
      </Button>
    </div>
  )
}

