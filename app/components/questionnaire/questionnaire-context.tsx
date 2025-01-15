"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { QuestionnaireResponse } from '../auth/types'

interface QuestionnaireContextType {
  responses: Partial<QuestionnaireResponse>
  updateResponses: (updates: Partial<QuestionnaireResponse>) => void
  currentStep: number
  setCurrentStep: (step: number) => void
}

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined)

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [responses, setResponses] = useState<Partial<QuestionnaireResponse>>({})
  const [currentStep, setCurrentStep] = useState(0)

  const updateResponses = (updates: Partial<QuestionnaireResponse>) => {
    setResponses(prev => ({ ...prev, ...updates }))
  }

  return (
    <QuestionnaireContext.Provider value={{
      responses,
      updateResponses,
      currentStep,
      setCurrentStep,
    }}>
      {children}
    </QuestionnaireContext.Provider>
  )
}

export function useQuestionnaire() {
  const context = useContext(QuestionnaireContext)
  if (context === undefined) {
    throw new Error('useQuestionnaire must be used within a QuestionnaireProvider')
  }
  return context
}

