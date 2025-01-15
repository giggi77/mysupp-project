"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { QuestionnaireDialog } from "../questionnaire/QuestionnaireDialog"

export function RegistrationDialog() {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)

  const handleSuccess = () => {
    setShowQuestionnaire(false)
    // Zde můžete přidat kód pro přesměrování uživatele nebo další akce po úspěšné registraci
  }

  return (
    <>
      <Button
        onClick={() => setShowQuestionnaire(true)}
        className="bg-gradient-to-r from-gray-900 to-gray-600 text-white hover:from-gray-800 hover:to-gray-500 transition-colors shadow-lg opacity-80 hover:opacity-100"
      >
        Vytvořit účet
      </Button>
      {showQuestionnaire && (
        <QuestionnaireDialog
          isOpen={showQuestionnaire}
          onClose={() => setShowQuestionnaire(false)}
          onComplete={handleSuccess}
        />
      )}
    </>
  )
}

