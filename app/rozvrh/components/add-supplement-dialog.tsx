"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProducts } from "@/lib/ProductContext"
import Image from "next/image"

interface AddSupplementDialogProps {
  isOpen: boolean
  onClose: () => void
  timeSlot: string
  onAdd: (supplement: any) => void
}

export function AddSupplementDialog({ isOpen, onClose, timeSlot, onAdd }: AddSupplementDialogProps) {
  const { addedProducts } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [dosage, setDosage] = useState("")

  const handleAdd = () => {
    if (selectedProduct && dosage) {
      onAdd({
        id: Date.now(),
        productId: selectedProduct,
        timeSlot,
        dosage
      })
      setSelectedProduct(null)
      setDosage("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Přidat suplement</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Vyberte suplement</Label>
            <div className="grid gap-2 max-h-[300px] overflow-y-auto">
              {addedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-2 border rounded-lg cursor-pointer flex items-center gap-2 ${
                    selectedProduct === product.id ? "border-green-500 bg-green-50" : ""
                  }`}
                  onClick={() => setSelectedProduct(product.id)}
                >
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded-md"
                  />
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.brand}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dosage">Dávkování</Label>
            <Input
              id="dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="Např. 1 tableta"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Zrušit
          </Button>
          <Button onClick={handleAdd} disabled={!selectedProduct || !dosage}>
            Přidat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

