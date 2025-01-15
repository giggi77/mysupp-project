export interface UserRegistration {
  email: string
  password: string
  name: string
}

export interface QuestionnaireResponse {
  gender: 'male' | 'female'
  height: number
  weight: number
  goal: string
  experience: string
  supplementCount: string
  selectionPreferences: string[]
  fitnessGoals: string[]
  dietaryPreferences: string[]
}

