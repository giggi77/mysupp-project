"use client"

import { useState, useEffect } from "react"
import { Navigation } from "../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LogOut, Pencil } from 'lucide-react'
import { useAuth } from "../components/auth/auth-context"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { ProfilePhotoUpload } from "./components/profile-photo-upload"
import { QuestionnaireDataEdit } from "./components/questionnaire-data-edit"
import { WeightChart } from "./components/weight-chart"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState("cs")
  const [goals, setGoals] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [questionnaireData, setQuestionnaireData] = useState<any>(null)
  const [weightHistory, setWeightHistory] = useState<{date: string, weight: number}[]>([])
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [isEditNameDialogOpen, setIsEditNameDialogOpen] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('users')
          .select('name, photo_url, settings, goals, questionnaire_data')
          .eq('id', user.id)
          .single()

        if (data) {
          setName(data.name || "")
          setPhotoUrl(data.photo_url || null)
          setNotifications(data.settings?.notifications ?? true)
          setDarkMode(data.settings?.darkMode ?? false)
          setLanguage(data.settings?.language ?? "cs")
          setGoals(data.goals || "")
          setQuestionnaireData(data.questionnaire_data || null)
          setSelectedGoals(data.goals || [])
        }

        // Fetch weight history
        const { data: weightData, error: weightError } = await supabase
          .from('weight_history')
          .select('date, weight')
          .eq('user_id', user.id)
          .order('date', { ascending: true })

        if (weightData) {
          setWeightHistory(weightData)
        }
      }
      setIsLoading(false)
    }

    fetchUserProfile()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Chyba při odhlašování:', error)
    }
  }

  const updateProfile = async () => {
    if (!user?.id) return

    const { error } = await supabase
      .from('users')
      .update({
        name,
        settings: {
          notifications,
          darkMode,
          language
        },
        goals,
        questionnaire_data: questionnaireData
      })
      .eq('id', user.id)

    if (error) {
      console.error('Chyba při ukládání profilu:', error)
    }
  }

  const handleQuestionnaireDataUpdate = (newData: any) => {
    setQuestionnaireData(newData)
  }

  const handleWeightUpdate = async (newWeight: number) => {
    if (!user?.id) return

    const newEntry = {
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      weight: newWeight
    }

    const { data, error } = await supabase
      .from('weight_history')
      .insert(newEntry)

    if (error) {
      console.error('Chyba při ukládání váhy:', error)
    } else {
      setWeightHistory([...weightHistory, { date: newEntry.date, weight: newWeight }])
    }
  }

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal].slice(0, 3)
    )
  }

  const saveGoals = async () => {
    if (!user?.id) return
    try {
      const { error } = await supabase
        .from('users')
        .update({ goals: selectedGoals })
        .eq('id', user.id)
      if (error) throw error
      // Zde můžete přidat notifikaci o úspěšném uložení
    } catch (error) {
      console.error('Chyba při ukládání cílů:', error)
      // Zde můžete přidat notifikaci o chybě
    }
  }

  if (isLoading) {
    return <div>Načítání...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-gray-600 to-gray-400 text-transparent bg-clip-text">Profil</h1>

          {/* Osobní informace */}
          <Card>
            <CardHeader>
              <CardTitle>Osobní informace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-6">
                <ProfilePhotoUpload
                  currentPhotoUrl={photoUrl}
                  onPhotoUpdated={(url) => {
                    setPhotoUrl(url)
                  }}
                  userId={user?.id}
                />
                <div className="flex-grow">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-500">Jméno</Label>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-lg font-semibold">{name}</span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setIsEditNameDialogOpen(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Údaje z dotazníku */}
          <QuestionnaireDataEdit
            data={questionnaireData}
            onUpdate={handleQuestionnaireDataUpdate}
          />

          {/* Graf váhy */}
          <WeightChart
            weightHistory={weightHistory}
            onWeightUpdate={handleWeightUpdate}
          />

          {/* Nastavení aplikace */}
          <Card>
            <CardHeader>
              <CardTitle>Nastavení aplikace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Notifikace</Label>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode">Tmavý režim</Label>
                <Switch
                  id="darkMode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Jazyk</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cs">Čeština</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sk">Slovenština</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cíle suplementace */}
          <Card>
            <CardHeader>
              <CardTitle>Vyberte nové cíle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {['Nárůst svalů', 'Síla', 'Energie', 'Spalování tuků', 'Regenerace', 'Zdraví', 'Imunita', 'Spánek', 'Soustředění'].map((goal) => (
                  <Button
                    key={goal}
                    variant={selectedGoals.includes(goal) ? "default" : "outline"}
                    onClick={() => toggleGoal(goal)}
                    disabled={selectedGoals.length >= 3 && !selectedGoals.includes(goal)}
                    className="justify-start"
                  >
                    {goal}
                  </Button>
                ))}
              </div>
              <Button onClick={saveGoals} disabled={selectedGoals.length === 0}>Uložit cíle</Button>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button onClick={updateProfile} className="bg-green-500 hover:bg-green-600">
              Uložit změny
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Odhlásit se
            </Button>
          </div>
          <Dialog open={isEditNameDialogOpen} onOpenChange={setIsEditNameDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upravit jméno</DialogTitle>
                <DialogDescription>
                  Zde můžete změnit své zobrazované jméno. Toto jméno bude viditelné pro ostatní uživatele.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Jméno
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsEditNameDialogOpen(false)} variant="outline">
                  Zrušit
                </Button>
                <Button onClick={() => {
                  updateProfile()
                  setIsEditNameDialogOpen(false)
                }}>
                  Uložit změny
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}

