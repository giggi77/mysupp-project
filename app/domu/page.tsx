"use client"

import { useState, useEffect } from "react"
import { Navigation } from "../components/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, Activity, Droplet, Plus, Coffee, Dumbbell, CupSoda, Moon, Star } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { useProducts } from "@/lib/ProductContext"
import { useAuth } from "../components/auth/auth-context"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ProductDetailCard } from "../components/product-detail-card"
import { WeightChart } from "../profil/components/weight-chart"

interface ScheduledSupplement {
  id: number;
  supplement_id: number;
  time_slot: string;
  dosage: string;
  name: string;
  brand: string;
  image: string;
  taken: boolean;
}

interface Supplement {
  id: number;
  name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
  image: string;
  dosage: string;
  ingredients: string;
  velikost_baleni: string;
  rating: number;
}

export default function HomePage() {
  const { supplements, addProduct } = useProducts()
  const { user } = useAuth()
  const [planCompletion, setPlanCompletion] = useState(0)
  const [waterIntake, setWaterIntake] = useState(1500)
  const [waterGoal, setWaterGoal] = useState(2500)
  //const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>([]) //removed
  const [scheduledSupplements, setScheduledSupplements] = useState<ScheduledSupplement[]>([])
  const [showCongratulations, setShowCongratulations] = useState(false)
  const [hasShownCongratulations, setHasShownCongratulations] = useState(false)
  const [planAdherence, setPlanAdherence] = useState<number>(0)
  const [addedProducts, setAddedProducts] = useState<number[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Supplement | null>(null)
  const [recommendedProducts, setRecommendedProducts] = useState<Supplement[]>([])
  const [motivationalMessage, setMotivationalMessage] = useState("")

  const fetchRandomMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('motivational_messages')
        .select('message')
        .order(() => 'RANDOM()')
        .limit(1)
        .single()

      if (error) throw error
      setMotivationalMessage(data.message)
    } catch (error) {
      console.error('Chyba při načítání motivační zprávy:', error)
      setMotivationalMessage('Gratulujeme k vašemu úspěchu!')
    }
  }

  const handleAddWater = () => {
    setWaterIntake(prev => Math.min(prev + 250, waterGoal))
  }

  const calculatePlanAdherence = (intakeData: any[]) => {
    const totalSupplements = intakeData.length
    const takenSupplements = intakeData.filter(item => item.taken).length
    return totalSupplements > 0 ? Math.round((takenSupplements / totalSupplements) * 100) : 0
  }

  const fetchScheduledSupplements = async () => {
    if (user) {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('user_schedule')
        .select(`
          id,
          supplement_id,
          time_slot,
          dosage,
          supplements (
            name,
            brand
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Chyba při načítání rozvrhnutých suplementů:', error)
      } else if (data) {
        const supplementIds = data.map(item => item.supplement_id)
        const { data: intakeData, error: intakeError } = await supabase
          .from('daily_supplement_intake')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .in('supplement_id', supplementIds)

        if (intakeError) {
          console.error('Chyba při načítání denního příjmu suplementů:', intakeError)
        } else if (intakeData) {
          const adherencePercentage = calculatePlanAdherence(intakeData)
          setPlanAdherence(adherencePercentage)
        }

        const formattedData = data.map(item => ({
          id: item.id,
          supplement_id: item.supplement_id,
          time_slot: item.time_slot,
          dosage: item.dosage,
          name: item.supplements.name,
          brand: item.supplements.brand,
          image: "/placeholder.svg",
          taken: intakeData ? intakeData.some(intake => intake.supplement_id === item.supplement_id && intake.taken) : false
        }))
        setScheduledSupplements(formattedData)
        updatePlanCompletion(formattedData)
      }
    }
  }

  const updatePlanCompletion = (supplements: ScheduledSupplement[]) => {
    const totalSupplements = supplements.length
    const takenSupplements = supplements.filter(supp => supp.taken).length
    const completion = totalSupplements > 0 ? (takenSupplements / totalSupplements) * 100 : 0
    setPlanCompletion(Math.round(completion))

    if (completion === 100 && !hasShownCongratulations) {
      const today = new Date().toISOString().split('T')[0]
      const lastCongratulationDate = localStorage.getItem('lastCongratulationDate')
    
      if (lastCongratulationDate !== today) {
        setShowCongratulations(true)
        setHasShownCongratulations(true)
        localStorage.setItem('lastCongratulationDate', today)
      }
    }
  }

  const handleSupplementToggle = async (supplementId: number, timeSlot: string) => {
    if (user) {
      const today = new Date().toISOString().split('T')[0]
      const updatedSupplements = scheduledSupplements.map(supp => 
        supp.supplement_id === supplementId && supp.time_slot === timeSlot
          ? { ...supp, taken: !supp.taken }
          : supp
      )
      
      setScheduledSupplements(updatedSupplements)
      updatePlanCompletion(updatedSupplements)

      const supplementToUpdate = updatedSupplements.find(supp => supp.supplement_id === supplementId && supp.time_slot === timeSlot)

      if (supplementToUpdate) {
        const { data, error } = await supabase
          .from('daily_supplement_intake')
          .upsert({
            user_id: user.id,
            supplement_id: supplementId,
            time_slot: timeSlot,
            date: today,
            taken: supplementToUpdate.taken
          }, {
            onConflict: 'user_id,supplement_id,time_slot,date'
          })

        if (error) {
          console.error('Chyba při aktualizaci stavu suplementu:', error)
        }
      }
    }
  }

  const fetchRecommendedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .order('rating', { ascending: false })
        .limit(20)

      if (error) throw error

      // Náhodně vybere 3 produkty z top 20
      const shuffled = data.sort(() => 0.5 - Math.random())
      setRecommendedProducts(shuffled.slice(0, 3))
    } catch (error) {
      console.error('Chyba při načítání doporučených produktů:', error)
    }
  }

  useEffect(() => {
    const fetchWeightHistory = async () => {
      //Removed - weight history is now handled by WeightChart component
    }

    const fetchScheduledSupplementsAndCheckCompletion = async () => {
      await fetchScheduledSupplements()
      const today = new Date().toISOString().split('T')[0]
      const lastCongratulationDate = localStorage.getItem('lastCongratulationDate')
      if (lastCongratulationDate !== today) {
        setHasShownCongratulations(false)
      }
    }

    fetchWeightHistory()
    fetchScheduledSupplementsAndCheckCompletion()
    fetchRecommendedProducts()
    fetchRandomMessage()
  }, [user])

  useEffect(() => {
    if (showCongratulations) {
      fetchRandomMessage()
    }
  }, [showCongratulations])

  const getSupplementsForSlot = (slot: string) => {
    return scheduledSupplements.filter(supp => supp.time_slot === slot)
  }

  const timeSlots = [
    { id: "rano", title: "Ráno", icon: Coffee },
    { id: "pred-treninkem", title: "Před tréninkem", icon: Dumbbell },
    { id: "po-treninku", title: "Po tréninku", icon: CupSoda },
    { id: "pred-spanim", title: "Před spaním", icon: Moon },
  ]

  //const CustomTooltip = ({ active, payload, label }: any) => { //removed
  //  if (active && payload && payload.length) {
  //    return (
  //      <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
  //        <p className="text-sm text-gray-600">
  //          {format(parseISO(label), 'd. MMMM yyyy', { locale: cs })}
  //        </p>
  //        <p className="text-sm font-bold">
  //          {payload[0].value} kg
  //        </p>
  //      </div>
  //    )
  //  }
  //  return null
  //} //removed

  const handleProductClick = (product: Supplement) => {
    setSelectedProduct(product)
  }

  const handleCloseProductDetail = () => {
    setSelectedProduct(null)
  }

  const handleAddToCart = (product: Supplement) => {
    console.log("Produkt přidán do košíku:", product)
    // Zde implementujte logiku pro přidání do košíku
  }

  const handleAddToPlan = async (product: Supplement) => {
    if (user) {
      try {
        const result = await addProduct(product);
        return result;
      } catch (error) {
        console.error('Chyba při přidávání produktu do plánu:', error);
        return { success: false, message: 'Došlo k chybě při přidávání produktu do plánu.' };
      }
    } else {
      return { success: false, message: 'Pro přidání produktu do plánu se musíte přihlásit.' };
    }
  }

  useEffect(() => {
    const fetchWaterGoal = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_settings')
            .select('water_goal')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (error) {
            if (error.code !== 'PGRST116') {
              console.error('Chyba při načítání denního cíle vody:', error)
            }
          } else if (data) {
            setWaterGoal(data.water_goal)
          }
        } catch (error) {
          console.error('Chyba při načítání denního cíle vody:', error)
        }
      }
    }

    fetchWaterGoal()
  }, [user])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-300 to-gray-400">
        <div className="grid gap-6">
          {/* Suplementační plán overview */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Váš suplementační plán</h1>
                  <p className="text-muted-foreground">
                    Máte {scheduledSupplements.length} produktů ve vašem plánu.
                  </p>
                </div>
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 stroke-current"
                      strokeWidth="10"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-green-500 stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 45}`,
                        strokeDashoffset: `${2 * Math.PI * 45 * (1 - planCompletion / 100)}`,
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%'
                      }}
                    />
                    <text
                      x="50"
                      y="50"
                      className="text-xl font-bold"
                      textAnchor="middle"
                      dy=".3em"
                      fill="currentColor"
                    >
                      {planCompletion}%
                    </text>
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {timeSlots.map((slot) => {
                  const SlotIcon = slot.icon
                  const supplements = getSupplementsForSlot(slot.id)
                  return (
                    <div key={slot.id} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center mb-2">
                        <SlotIcon className="w-5 h-5 mr-2 text-gray-600" />
                        <h3 className="text-sm font-semibold">{slot.title}</h3>
                      </div>
                      {supplements.length > 0 ? (
                        <div className="space-y-2">
                          {supplements.map((supp) => (
                            <Button
                              key={supp.id}
                              variant={supp.taken ? "default" : "outline"}
                              size="sm"
                              className={`w-full justify-between ${
                                supp.taken 
                                  ? "bg-gradient-to-r from-green-300 to-green-400 hover:from-green-400 hover:to-green-500 text-white" 
                                  : "hover:bg-gradient-to-r hover:from-green-100 hover:to-green-200"
                              }`}
                              onClick={() => handleSupplementToggle(supp.supplement_id, supp.time_slot)}
                            >
                              <span>{supp.name}</span>
                              <span className="text-xs">{supp.dosage}</span>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Žádné suplementy</p>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-center">
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-gray-800 to-gray-600 text-white hover:from-gray-700 hover:to-gray-500 transition-colors shadow-sm opacity-80 hover:opacity-100 py-2 px-4 text-sm"
                >
                  <Link href="/rozvrh">
                    Upravit rozvrh
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Doporučené produkty */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Doporučené produkty</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedProducts.map((product) => (
                    <Card 
                      key={`recommended-${product.id}`} 
                      className="flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow duration-300"
                      onClick={() => handleProductClick(product)}
                    >
                      <CardHeader className="p-4">
                        <div className="w-full h-40 relative mb-2">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-lg"
                          />
                        </div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription>{product.brand}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 flex-grow">
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm">{product.rating.toFixed(1)}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 flex justify-between items-center">
                        <span className="font-bold">{product.price} Kč</span>
                        <Button
                          onClick={() => handleAddToPlan(product)}
                          className="bg-gradient-to-r from-gray-800 to-gray-600 text-white hover:from-gray-700 hover:to-gray-500 transition-colors shadow-sm opacity-80 hover:opacity-100"
                        >
                          Přidat do plánu
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiky */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Graf váhy */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vývoj váhy</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <WeightChart onWeightUpdate={() => {}} />
              </CardContent>
            </Card>

            {/* Pitný režim */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pitný režim</CardTitle>
                <Droplet className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-500">{waterIntake} / {waterGoal} ml</div>
                <Progress 
                  value={(waterIntake / waterGoal) * 100} 
                  className="mt-2 h-2 bg-gradient-to-r from-blue-100 to-blue-200" 
                  style={{
                    '& > div': {
                      background: 'linear-gradient(to right, #3b82f6, #2563eb)'
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Denní cíl: {waterGoal} ml
                </p>
                <Button 
                  onClick={handleAddWater} 
                  className="mt-4 bg-blue-500 bg-opacity-20 hover:bg-blue-600 hover:bg-opacity-30 text-blue-600 hover:text-blue-100 backdrop-filter backdrop-blur-sm shadow-md transition-all duration-300"
                  disabled={waterIntake >= waterGoal}
                >
                  <Plus className="mr-2 h-4 w-4" /> Přidat 250 ml
                </Button>
              </CardContent>
              <style jsx>{`
                .bg-blue-100 > div {
                  background-color: #3b82f6;
                }
              `}</style>
            </Card>

            {/* Denní výdaje */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Denní výdaje</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">0.00 Kč</div>
                <p className="text-xs text-muted-foreground mt-2">
                  0 Kč měsíčně
                </p>
              </CardContent>
            </Card>

            {/* Aktivita */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktivita</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{planAdherence}%</div>
                <Progress value={planAdherence} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Dodržování plánu dnes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Aktuální protokoly */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Aktuální protokoly</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center py-6">
              <p className="text-muted-foreground mb-4">
                Zatím nemáte žádné aktivní protokoly.
              </p>
              <Button asChild className="bg-green-500 hover:bg-green-600">
                <Link href="/protokoly">
                  Prozkoumat protokoly
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showCongratulations} onOpenChange={(open) => {
        setShowCongratulations(open)
        if (!open) {
          setHasShownCongratulations(true)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gratulujeme!</DialogTitle>
            <DialogDescription>
              {motivationalMessage}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowCongratulations(false)}>Zavřít</Button>
        </DialogContent>
      </Dialog>
      <ProductDetailCard
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={handleCloseProductDetail}
        onAddToCart={handleAddToCart}
        onAddToPlan={handleAddToPlan}
      />
    </div>
  )
}

