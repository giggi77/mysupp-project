import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"
import { Star } from 'lucide-react'
import { useAuth } from '@/app/components/auth/auth-context'
import { toast } from "@/components/ui/use-toast"

interface Product {
  id: number
  name: string
  brand: string
  price: number
  image: string
  description: string
  rating: number
}

interface ProductDetailCardProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product) => void
  onAddToPlan: (product: Product) => Promise<{ success: boolean; message: string }>
}

export function ProductDetailCard({ product, isOpen, onClose, onAddToCart, onAddToPlan }: ProductDetailCardProps) {
  const { user } = useAuth()
  const [isAddedToPlan, setIsAddedToPlan] = useState(false)

  if (!product) return null

  const handleAddToPlan = async () => {
    if (product) {
      try {
        const result = await onAddToPlan(product)
        if (result.success) {
          toast({
            title: "Úspěch",
            description: result.message,
          })
        } else {
          toast({
            title: "Upozornění",
            description: result.message,
            variant: "default",
          })
        }
      } catch (error) {
        console.error('Chyba při přidávání produktu do plánu:', error)
        toast({
          title: "Chyba",
          description: "Došlo k neočekávané chybě při přidávání produktu do plánu.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detail produktu</DialogTitle>
          <DialogDescription>
            Podrobné informace o produktu {product.name}
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="p-4">
            <div className="w-full h-48 relative mb-4">
              <Image
                src={product.image}
                alt={product.name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
            <p className="text-sm mb-2">{product.description}</p>
            <div className="flex items-center mb-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm">{product.rating.toFixed(1)}</span>
            </div>
            <p className="font-bold">{product.price} Kč</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={handleAddToPlan}
              disabled={isAddedToPlan}
              className={isAddedToPlan ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {isAddedToPlan ? "Přidáno do plánu" : "Přidat do plánu"}
            </Button>
            <Button onClick={() => onAddToCart(product)}>
              Koupit
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

