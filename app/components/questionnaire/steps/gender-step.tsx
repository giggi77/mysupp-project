"use client"

import { Button } from "@/components/ui/button"
import { useQuestionnaire } from "../questionnaire-context"
import { UserIcon as Male, UserIcon as Female } from 'lucide-react'

export function GenderStep() {
  const { updateResponses, setCurrentStep } = useQuestionnaire()

  const handleGenderSelect = (gender: 'male' | 'female') => {
    updateResponses({ gender })
    setCurrentStep(1)
  }

  return (
    <div className="space-y-6 py-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Vyberte své pohlaví</h2>
        <p className="text-muted-foreground">
          Tato informace nám pomůže lépe přizpůsobit váš suplementační plán.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-32 space-y-2"
          onClick={() => handleGenderSelect('male')}
        >
          <Male className="h-8 w-8" />
          <span>Muž</span>
        </Button>
        <Button
          variant="outline"
          className="h-32 space-y-2"
          onClick={() => handleGenderSelect('female')}
        >
          <Female className="h-8 w-8" />
          <span>Žena</span>
        </Button>
      </div>
    </div>
  )
}

