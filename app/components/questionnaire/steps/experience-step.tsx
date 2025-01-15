"use client"

import { Button } from "@/components/ui/button"
import { useQuestionnaire } from "../questionnaire-context"

export function ExperienceStep() {
  const { updateResponses, setCurrentStep } = useQuestionnaire()

  const experiences = [
    {
      id: "beginner",
      title: "Jsem nováček, nevím kde začít",
      description: "Potřebuji pomoc s výběrem základních suplementů"
    },
    {
      id: "intermediate",
      title: "Už nějakou dobu se snažím si poradit",
      description: "Mám základní znalosti, ale chci se zlepšit"
    },
    {
      id: "advanced",
      title: "Užívám dlouhodobě, vyznám se výborně",
      description: "Hledám optimalizaci a pokročilé strategie"
    }
  ]

  const handleSelect = (experience: string) => {
    updateResponses({ experience })
    setCurrentStep(4)
  }

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">
          Tvoje zkušenosti se suplementy
        </h2>
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <Button
            key={exp.id}
            variant="outline"
            className="w-full h-auto py-4 px-6 flex flex-col items-start gap-1"
            onClick={() => handleSelect(exp.id)}
          >
            <div className="font-medium">{exp.title}</div>
            <div className="text-sm text-muted-foreground">
              {exp.description}
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}

