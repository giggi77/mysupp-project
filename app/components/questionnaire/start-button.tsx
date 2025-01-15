"use client"

import { Button } from "@/components/ui/button"
import { useQuestionnaire } from "./questionnaire-context"

export function StartButton() {
  const { setIsOpen } = useQuestionnaire()

  return (
    <Button size="lg" onClick={() => setIsOpen(true)}>
      Začít nyní
    </Button>
  )
}

