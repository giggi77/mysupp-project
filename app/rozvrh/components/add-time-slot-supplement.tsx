"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/lib/ProductContext"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/app/components/auth/auth-context"

interface AddTimeSlotSupplementProps {
  isOpen: boolean
  onClose: () => void
  timeSlot: string
  timeSlotTitle: string
  onAdd: (supplement: {
    id: number
    productId: number
    timeSlot: string
    dosage: string
    name: string
    brand: string
    image: string
  }) => void
}

export function AddTimeSlotSupplement({
  isOpen,
  onClose,
  timeSlot,
  timeSlotTitle,
  onAdd
}: AddTimeSlotSupplementProps) {
  const { addedProducts } = useProducts()
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const { user } = useAuth()

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleAdd = async () => {
    if (selectedProducts.length > 0 && user) {
      for (const productId of selectedProducts) {
        const product = addedProducts.find(p => p.id === productId)
        if (product) {
          try {
            const { data, error } = await supabase
              .from('user_schedule')
              .insert({
                user_id: user.id,
                supplement_id: product.id,
                time_slot: timeSlot,
                dosage: "1" // Výchozí dávkování
              })
              .select()

            if (error) throw error

            if (data && data[0]) {
              onAdd({
                id: data[0].id,
                productId: product.id,
                timeSlot: timeSlot,
                dosage: "1",
                name: product.name,
                brand: product.brand,
                image: product.image || "/placeholder.svg"
              })
            }
          } catch (error) {
            console.error("Chyba při přidávání suplementu do rozvrhu:", error)
          }
        }
      }
      setSelectedProducts([])
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Přidat suplement - {timeSlotTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Vyberte suplementy z vašeho plánu</div>
            <div className="grid gap-2 max-h-[300px] overflow-y-auto">
              {addedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:border-green-500 transition-colors ${
                    selectedProducts.includes(product.id) ? "border-green-500 bg-green-50" : ""
                  }`}
                  onClick={() => toggleProductSelection(product.id)}
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="rounded-md"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.brand}</div>
                      <div className="text-sm text-muted-foreground">Doporučené dávkování: {product.dosage}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Zrušit
          </Button>
          <Button 
            onClick={handleAdd} 
            disabled={selectedProducts.length === 0}
            className="bg-green-500 hover:bg-green-600"
          >
            Přidat do rozvrhu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

