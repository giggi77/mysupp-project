"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useQuestionnaire } from "../questionnaire-context"
import { useState } from "react"

export function BiometricsStep() {
  const { updateResponses, setCurrentStep } = useQuestionnaire()
  const [height, setHeight] = useState(170)
  const [weight, setWeight] = useState(70)
  const [name, setName] = useState("")

  const handleContinue = () => {
    updateResponses({ height, weight, name })
    setCurrentStep(2)
  }

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">Jak ti máme říkat?</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Tvoje jméno"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Výška (cm)</label>
          <Slider
            value={[height]}
            onValueChange={(value) => setHeight(value[0])}
            min={140}
            max={220}
            step={1}
          />
          <div className="text-right text-sm text-muted-foreground">
            {height} cm
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Váha (kg)</label>
          <Slider
            value={[weight]}
            onValueChange={(value) => setWeight(value[0])}
            min={40}
            max={150}
            step={1}
          />
          <div className="text-right text-sm text-muted-foreground">
            {weight} kg
          </div>
        </div>
      </div>

      <Button
        className="w-full"
        onClick={handleContinue}
        disabled={!name}
      >
        Pokračovat
      </Button>
    </div>
  )
}

