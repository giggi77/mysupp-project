"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { User, UserCircle, ChevronLeft, Search, Check } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useAuth } from "../auth/auth-context"
import { supabase } from "@/lib/supabase"
import { useProducts } from '@/lib/ProductContext'
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface QuestionnaireDialogProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: any) => void
}

interface Supplement {
  id: number
  name: string
  brand: string
  image: string
  description: string
  price: number
  category: string
  dosage: string
  ingredients: string
  velikost_baleni: string
  rating: number
}

export function QuestionnaireDialog({ isOpen, onClose, onComplete }: QuestionnaireDialogProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    gender: "",
    height: 170,
    weight: 70,
    goal: "",
    experience: "",
    supplementCount: "",
    currentSupplements: [] as Supplement[],
    selectionPreferences: [] as string[],
    fitnessGoals: [] as string[],
    dietaryPreferences: [] as string[],
  })
  const [registrationData, setRegistrationData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const { signUp } = useAuth()
  const { addProduct } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Supplement[]>([])

  useEffect(() => {
    if (searchTerm) {
      searchSupplements(searchTerm)
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  const searchSupplements = async (term: string) => {
    const { data, error } = await supabase
      .from('supplements')
      .select('*')
      .ilike('name', `%${term}%`)
      .limit(10)

    if (error) {
      console.error('Error searching supplements:', error)
    } else {
      setSearchResults(data || [])
    }
  }

  const addSupplement = (supplement: Supplement) => {
    setAnswers(prev => ({
      ...prev,
      currentSupplements: [...prev.currentSupplements, supplement]
    }))
    addProduct(supplement)
    setSearchTerm("")
  }

  const removeSupplement = (id: number) => {
    setAnswers(prev => ({
      ...prev,
      currentSupplements: prev.currentSupplements.filter(s => s.id !== id)
    }))
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleRegistration()
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleRegistration = async () => {
    try {
      const { user, error } = await signUp(
        registrationData.email,
        registrationData.password,
        registrationData.name
      )
      if (error) throw error
      if (user) {
        const { error: questionnaireError } = await supabase
          .from('user_questionnaire_responses')
          .insert({
            user_id: user.id,
            gender: answers.gender,
            height: answers.height,
            weight: answers.weight,
            goal: answers.goal,
            experience: answers.experience,
            supplement_count: answers.supplementCount,
            selection_preferences: answers.selectionPreferences,
            fitness_goals: answers.fitnessGoals,
            dietary_preferences: answers.dietaryPreferences,
            current_supplements: JSON.stringify(answers.currentSupplements.map(s => s.id))
          })

        if (questionnaireError) throw questionnaireError

        const supplementInserts = answers.currentSupplements.map(supplement => ({
          user_id: user.id,
          supplement_id: supplement.id,
          dosage: supplement.dosage,
          frequency: 'daily',
          time_of_day: 'morning',
        }))

        const { error: supplementError } = await supabase
          .from('user_supplements')
          .insert(supplementInserts)

        if (supplementError) throw supplementError

        answers.currentSupplements.forEach(supplement => {
          addProduct(supplement)
        })

        onComplete({ ...answers, ...registrationData })
        onClose()
        alert("Registrace byla úspěšná. Prosím, potvrďte svůj email kliknutím na odkaz, který jsme vám zaslali.")
      }
    } catch (error) {
      console.error('Chyba při registraci:', error)
      alert(`Došlo k chybě při registraci: ${error.message}`)
    }
  }

  const steps = [
    {
      title: "Vítejte v MySupp",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className={cn(
                "h-32 flex flex-col items-center justify-center space-y-2 rounded-xl",
                answers.gender === "male" && "border-primary"
              )}
              onClick={() => setAnswers({ ...answers, gender: "male" })}
            >
              <User className="h-8 w-8" />
              <span>Muž</span>
            </Button>
            <Button
              variant="outline"
              className={cn(
                "h-32 flex flex-col items-center justify-center space-y-2 rounded-xl",
                answers.gender === "female" && "border-primary"
              )}
              onClick={() => setAnswers({ ...answers, gender: "female" })}
            >
              <UserCircle className="h-8 w-8" />
              <span>Žena</span>
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "Vaše tělesné údaje",
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Výška</span>
              <span className="font-bold">{answers.height} cm</span>
            </div>
            <Slider
              value={[answers.height]}
              onValueChange={(value) => setAnswers({ ...answers, height: value[0] })}
              min={140}
              max={220}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Váha</span>
              <span className="font-bold">{answers.weight} kg</span>
            </div>
            <Slider
              value={[answers.weight]}
              onValueChange={(value) => setAnswers({ ...answers, weight: value[0] })}
              min={40}
              max={150}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )
    },
    {
      title: "Co ti nejvíce pomůže",
      content: (
        <div className="space-y-4">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left h-auto p-4 rounded-xl",
              answers.goal === "plan" && "border-primary"
            )}
            onClick={() => setAnswers({ ...answers, goal: "plan" })}
          >
            <div>
              <div className="font-medium">Sestavit můj plán</div>
              <div className="text-sm text-muted-foreground">Najít vhodný mix</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left h-auto p-4 rounded-xl",
              answers.goal === "search" && "border-primary"
            )}
            onClick={() => setAnswers({ ...answers, goal: "search" })}
          >
            <div>
              <div className="font-medium">Hledám produkty za nejlepší cenu</div>
              <div className="text-sm text-muted-foreground">Sledovat můj plán</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left h-auto p-4 rounded-xl",
              answers.goal === "track" && "border-primary"
            )}
            onClick={() => setAnswers({ ...answers, goal: "track" })}
          >
            <div>
              <div className="font-medium">Sledovat moji suplementaci</div>
              <div className="text-sm text-muted-foreground">Užívám dlouhodobě</div>
            </div>
          </Button>
        </div>
      )
    },
    {
      title: "Vaše zkušenosti se suplementy",
      content: (
        <div className="space-y-4">
          {["beginner", "intermediate", "advanced"].map((exp) => (
            <Button
              key={exp}
              variant="outline"
              className={cn(
                "w-full justify-start text-left h-auto p-4 rounded-xl",
                answers.experience === exp && "border-primary"
              )}
              onClick={() => setAnswers({ ...answers, experience: exp })}
            >
              <div>
                <div className="font-medium">
                  {exp === "beginner" && "Jsem nováček, nevím kde začít"}
                  {exp === "intermediate" && "Už nějakou dobu se snažím si poradit"}
                  {exp === "advanced" && "Užívám dlouhodobě, vyznám se výborně"}
                </div>
              </div>
            </Button>
          ))}
        </div>
      )
    },
    {
      title: "Kolik suplementů užíváte?",
      content: (
        <div className="space-y-4">
          {["0", "1-2", "3-5", "6-10", "11+"].map((count) => (
            <Button
              key={count}
              variant="outline"
              className={cn(
                "w-full justify-start text-left h-auto p-4 rounded-xl",
                answers.supplementCount === count && "border-primary"
              )}
              onClick={() => setAnswers({ ...answers, supplementCount: count })}
            >
              {count}
            </Button>
          ))}
        </div>
      )
    },
    {
      title: "Vaše cíle",
      content: (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">Vyberte až 3 cíle:</p>
          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
            {["Nárůst svalů", "Síla", "Energie", "Spalování tuků", "Regenerace", "Zdraví", "Imunita", "Spánek", "Soustředění"].map((goal) => (
              <Button
                key={goal}
                variant="outline"
                size="sm"
                className={cn(
                  "h-auto py-2 justify-start text-left",
                  answers.fitnessGoals.includes(goal) && "border-primary"
                )}
                onClick={() => {
                  const updatedGoals = answers.fitnessGoals.includes(goal)
                    ? answers.fitnessGoals.filter(g => g !== goal)
                    : [...answers.fitnessGoals, goal].slice(0, 3)
                  setAnswers({ ...answers, fitnessGoals: updatedGoals })
                }}
                disabled={answers.fitnessGoals.length >= 3 && !answers.fitnessGoals.includes(goal)}
              >
                <div className="flex items-center w-full">
                  <span className="flex-grow">{goal}</span>
                  {answers.fitnessGoals.includes(goal) && <Check className="h-4 w-4 ml-2 flex-shrink-0" />}
                </div>
              </Button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Preference stravy",
      content: (
        <div className="space-y-4">
          {["Běžná strava", "Vegetarián", "Vegan", "Paleo", "Keto", "Bezlepková"].map((diet) => (
            <Button
              key={diet}
              variant="outline"
              className={cn(
                "w-full justify-start text-left h-auto p-4 rounded-xl",
                answers.dietaryPreferences.includes(diet) && "border-primary"
              )}
              onClick={() => {
                const updatedDiet = answers.dietaryPreferences.includes(diet)
                  ? answers.dietaryPreferences.filter(d => d !== diet)
                  : [...answers.dietaryPreferences, diet]
                setAnswers({ ...answers, dietaryPreferences: updatedDiet })
              }}
            >
              <div className="flex justify-between items-center w-full">
                <span>{diet}</span>
                {answers.dietaryPreferences.includes(diet) && <Check className="h-4 w-4" />}
              </div>
            </Button>
          ))}
        </div>
      )
    },
    {
      title: "Vyhledejte své suplementy",
      content: (
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Vyhledat suplement"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.map((supplement) => (
              <Card key={supplement.id} className="p-2">
                <CardContent className="flex items-center justify-between p-2">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={supplement.image || "/placeholder.svg"}
                      alt={supplement.name}
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                    <div>
                      <div className="font-medium">{supplement.name}</div>
                      <div className="text-sm text-muted-foreground">{supplement.brand}</div>
                    </div>
                  </div>
                  <Button onClick={() => addSupplement(supplement)}>Přidat</Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Vybrané suplementy:</h3>
            {answers.currentSupplements.map((supplement) => (
              <Card key={supplement.id} className="p-2">
                <CardContent className="flex items-center justify-between p-2">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={supplement.image || "/placeholder.svg"}
                      alt={supplement.name}
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                    <div>
                      <div className="font-medium">{supplement.name}</div>
                      <div className="text-sm text-muted-foreground">{supplement.brand}</div>
                    </div>
                  </div>
                  <Button variant="destructive" onClick={() => removeSupplement(supplement.id)}>Odebrat</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Registrační údaje",
      content: (
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Jméno"
            value={registrationData.name}
            onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email"
            value={registrationData.email}
            onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Heslo"
            value={registrationData.password}
            onChange={(e) => setRegistrationData({ ...registrationData, password: e.target.value })}
          />
        </div>
      )
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{steps[step].title}</DialogTitle>
          <DialogDescription>
            {steps[step].description || "Vyplňte prosím následující informace."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {step > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4"
              onClick={handleBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {steps[step].content}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleNext}>
            {step === steps.length - 1 ? "Dokončit" : "Pokračovat"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

