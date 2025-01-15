export interface QuestionnaireResponse {
  gender: 'male' | 'female'
  height: number
  weight: number
  name: string
  goal: string
  experience: string
  supplementCount: string
  selectionPreferences: string[]
  fitnessGoals: string[]
  dietaryPreferences: string[]
}

export interface UserRegistration {
  email: string
  password: string
  name: string
}

