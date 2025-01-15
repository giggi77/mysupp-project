"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProducts } from "@/lib/ProductContext"
import Image from "next/image"
import { Slider } from "@/components/ui/slider"

interface ProductDetailCardProps {
  supplement: {
    id: number;
    productId: number;
    timeSlot: string;
    dosage: number;
  };
  onClose: () => void;
  onUpdateDosage: (supplementId: number, newDosage: number) => void;
}

export function ProductDetailCard({ supplement, onClose, onUpdateDosage }: ProductDetailCardProps) {
  const { addedProducts } = useProducts()
  const product = addedProducts.find(p => p.id === supplement.productId)
  const [dosage, setDosage] = useState(supplement.dosage)

  if (!product) return null

  const handleDosageChange = (newDosage: number[]) => {
    setDosage(newDosage[0])
  }

  const handleSave = () => {
    onUpdateDosage(supplement.id, dosage)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detail produktu</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={80}
              height={80}
              className="rounded-md"
            />
            <div>
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dosage">Dávkování</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="dosage"
                min={1}
                max={30}
                step={1}
                value={[dosage]}
                onValueChange={(newValue) => setDosage(newValue[0])}
                className="flex-grow"
              />
              {/* This value will be saved and displayed in the schedule */}
              <span className="font-bold">
                {dosage} {product.dosage.replace(/[0-9.]/g, '')}
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Doporučené dávkování: {product.dosage}</p>
            <p>Velikost balení: {product.velikost_baleni}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Zrušit</Button>
          <Button onClick={handleSave}>Uložit změny</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

