"use client"

import { Button } from "@/components/ui/button"
import { useQuestionnaire } from "../questionnaire-context"

export function SupplementCountStep() {
  const { updateResponses, setCurrentStep } = useQuestionnaire()

  const counts = [
    { id: "0", label: "0" },
    { id: "1", label: "1" },
    { id: "2-5", label: "2-5" },
    { id: "6-10", label: "6-10" },
    { id: "11+", label: "11+" }
  ]

  const handleSelect = (count: string) => {
    updateResponses({ supplementCount: count })
    setCurrentStep(5)
  }

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">
          Jaké množství suplementů užíváš?
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {counts.map((count) => (
          <Button
            key={count.id}
            variant="outline"
            className="h-16"
            onClick={() => handleSelect(count.id)}
          >
            {count.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

