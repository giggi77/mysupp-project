"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { X, Coffee, Dumbbell, CupSodaIcon as Cup, Bed, DollarSign } from 'lucide-react'
import { CircularProgress } from "./circular-progress-doses"
import { useProducts } from '@/lib/ProductContext'
import { useAuth } from '@/app/components/auth/auth-context'
import { supabase } from '@/lib/supabase'

interface Product {
  id: number
  name: string
  brand: string
  price: number
  category: string
  description: string
  image: string
  dosage: string
  ingredients: string
  velikost_baleni: string
  rating: number
}

interface ProductDetailsProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

interface TimeSlot {
  id: string
  label: string
  icon: React.ElementType
}

export function ProductDetails({ product, isOpen, onClose }: ProductDetailsProps) {
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])
  const [dosage, setDosage] = useState("20g")
  const [remainingDoses, setRemainingDoses] = useState({ current: 33, total: 112 })

  const { addProduct } = useProducts()
  const { user } = useAuth()

  const timeSlots: TimeSlot[] = [
    { id: "rano", label: "Ráno", icon: Coffee },
    { id: "pred-treninkem", label: "Před tréninkem", icon: Dumbbell },
    { id: "po-treninku", label: "Po Tréninku", icon: Cup },
    { id: "pred-spanim", label: "Před spaním", icon: Bed },
  ]

  useEffect(() => {
    if (product) {
      const match = product.velikost_baleni.match(/(\d+)/)
      if (match) {
        const totalGrams = parseInt(match[0])
        const dosageGrams = parseInt(dosage)
        setRemainingDoses({
          current: 33,
          total: Math.floor(totalGrams / dosageGrams)
        })
      }
    }
  }, [product, dosage])

  useEffect(() => {
    const fetchExistingSchedule = async () => {
      if (product && user) {
        const { data, error } = await supabase
          .from('user_schedule')
          .select('time_slot, dosage')
          .eq('user_id', user.id)
          .eq('supplement_id', product.id)

        if (error) {
          console.error('Chyba při načítání rozvrhu:', error)
        } else if (data) {
          setSelectedTimeSlots(data.map(item => item.time_slot))
          if (data.length > 0) {
            setDosage(data[0].dosage)
          }
        }
      }
    }

    fetchExistingSchedule()
  }, [product, user])

  const handleTimeSlotToggle = (slotId: string) => {
    setSelectedTimeSlots(prev =>
      prev.includes(slotId)
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    )
  }

  const handleSave = async () => {
    if (!product || !user) return

    try {
      // Nejprve odstraníme všechny existující záznamy pro tento suplement a uživatele
      const { error: deleteError } = await supabase
        .from('user_schedule')
        .delete()
        .match({ user_id: user.id, supplement_id: product.id })

      if (deleteError) throw deleteError

      // Poté vložíme nové záznamy pro vybrané časové sloty
      const { error: insertError } = await supabase
        .from('user_schedule')
        .insert(selectedTimeSlots.map(slot => ({
          user_id: user.id,
          supplement_id: product.id,
          time_slot: slot,
          dosage: dosage,
        })))

      if (insertError) throw insertError

      addProduct(product)
      onClose()
    } catch (error) {
      console.error('Chyba při ukládání do rozvrhu:', error)
      // Zde můžete přidat zobrazení chybové zprávy uživateli
    }
  }

  if (!product) return null

  const dailyCost = (product.price / remainingDoses.total).toFixed(1)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader>
          <DialogTitle>Detail produktu</DialogTitle>
          <DialogDescription>
            Zde najdete podrobné informace o vybraném produktu.
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-1/2 p-4">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={300}
              height={300}
              className="w-full object-contain rounded-lg"
            />
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-500 mb-1">{product.brand}</h2>
              <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
              <p className="text-lg text-gray-400">{product.velikost_baleni}</p>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Upravit Dávkování:</span>
                <Input
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-24"
                />
                <span>denně</span>
              </div>
            </div>

            <div className="border-t border-b py-4 mb-4">
              {timeSlots.map((slot) => {
                const Icon = slot.icon
                return (
                  <div key={slot.id} className="flex items-center space-x-4 mb-2 last:mb-0">
                    <Icon className="h-5 w-5" />
                    <span className="text-lg">{slot.label}</span>
                    <Checkbox
                      checked={selectedTimeSlots.includes(slot.id)}
                      onCheckedChange={() => handleTimeSlotToggle(slot.id)}
                    />
                  </div>
                )
              })}
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-lg">Denně {dailyCost} Kč</span>
              </div>
              <div className="w-24 h-24">
                <CircularProgress
                  current={remainingDoses.current}
                  total={remainingDoses.total}
                />
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-gray-600 to-gray-400 hover:from-gray-700 hover:to-gray-500 text-white"
              onClick={handleSave}
              disabled={selectedTimeSlots.length === 0}
            >
              Uložit do rozvrhu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

