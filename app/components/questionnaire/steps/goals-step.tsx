"use client"

import { Button } from "@/components/ui/button"
import { useQuestionnaire } from "../questionnaire-context"
import { ClipboardList, Search, Activity } from 'lucide-react'

export function GoalsStep() {
  const { updateResponses, setCurrentStep } = useQuestionnaire()

  const goals = [
    {
      id: "plan",
      title: "Sestavení plánu",
      icon: ClipboardList,
      description: "Sestavit můj plán"
    },
    {
      id: "search",
      title: "Hledání produktů",
      icon: Search,
      description: "Hledám produkty za nejlepší cenu"
    },
    {
      id: "track",
      title: "Sledování suplementace",
      icon: Activity,
      description: "Sledovat moji suplementaci"
    }
  ]

  const handleSelect = (goal: string) => {
    updateResponses({ goal })
    setCurrentStep(3)
  }

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">Co ti nejvíce pomůže</h2>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const Icon = goal.icon
          return (
            <Button
              key={goal.id}
              variant="outline"
              className="w-full h-auto py-4 px-6 flex items-center gap-4"
              onClick={() => handleSelect(goal.id)}
            >
              <Icon className="h-6 w-6 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">{goal.title}</div>
                <div className="text-sm text-muted-foreground">
                  {goal.description}
                </div>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

