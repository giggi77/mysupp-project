"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useQuestionnaire } from "./questionnaire-context"
import { WelcomeStep } from "./steps/welcome-step"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { QuestionnaireResponse, UserRegistration } from "./types"

export function QuestionnaireDialog() {
  const { isOpen, setIsOpen, currentStep, responses } = useQuestionnaire()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegistrationSubmit = async (registrationData: UserRegistration) => {
    setIsSubmitting(true)
    setError(null)
    try {
      // Registrace uživatele
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
      })

      if (authError) throw authError

      if (authData.user) {
        // Uložení uživatelských dat
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: registrationData.email,
              name: registrationData.name,
            }
          ])

        if (userError) throw userError

        // Uložení odpovědí z dotazníku
        const { error: responseError } = await supabase
          .from('user_questionnaire_responses')
          .insert([
            {
              user_id: authData.user.id,
              ...responses
            }
          ])

        if (responseError) throw responseError

        // Úspěšné dokončení
        setIsOpen(false)
        // Zde můžete přidat kód pro přesměrování uživatele nebo zobrazení úspěšné zprávy
      }
    } catch (error) {
      console.error('Error during registration:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Došlo k chybě při registraci. Zkuste to prosím znovu.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    <WelcomeStep key="welcome" />,
    // Zde budou další kroky dotazníku
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        {steps[currentStep]}
      </DialogContent>
    </Dialog>
  )
}

