"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "./auth-context"
import { QuestionnaireDialog } from "../questionnaire/QuestionnaireDialog"

interface RegistrationFormProps {
  onSuccess: () => void
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowQuestionnaire(true)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Button type="submit" className="w-full">
          Začít dotazník
        </Button>
      </form>

      {showQuestionnaire && (
        <QuestionnaireDialog
          isOpen={showQuestionnaire}
          onClose={() => setShowQuestionnaire(false)}
          onComplete={(questionnaireData) => {
            // Zde budeme zpracovávat data z dotazníku a spouštět registraci
          }}
        />
      )}
    </>
  )
}

