import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Trash2 } from 'lucide-react'

interface ProductItemProps {
  id: number
  name: string
  brand: string
  image: string
  price: number
  onRemove: (id: number) => void
}

export function ProductItem({ id, name, brand, image, price, onRemove }: ProductItemProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 opacity-90" />
      
      <CardContent className="relative flex items-center p-4">
        <div className="w-1/4">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={80}
            height={80}
            className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="w-2/4 px-4">
          <h3 className="font-semibold group-hover:text-primary transition-colors">{name}</h3>
          <p className="text-sm text-muted-foreground">{brand}</p>
        </div>
        <div className="w-1/4 flex flex-col items-end">
          <p className="font-bold mb-2">{price} Kč</p>
          <Button 
            variant="destructive" 
            size="icon"
            onClick={() => onRemove(id)}
            className="transition-colors hover:bg-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </Card>
  )
}

