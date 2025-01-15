"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { Plus, ShoppingCart, Info } from 'lucide-react'

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

interface AddProductsDialogProps {
  onAddProduct: (product: Product) => void
}

export function AddProductsDialog({ onAddProduct }: AddProductsDialogProps) {
  const [priceRange, setPriceRange] = useState(3000)
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [addedProducts, setAddedProducts] = useState<number[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
      if (error) {
        console.error('Error fetching products:', error)
      } else {
        setProducts(data || [])
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter(product => 
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.brand.toLowerCase().includes(searchQuery.toLowerCase())) &&
      product.price <= priceRange
    )
    setFilteredProducts(filtered)
  }, [searchQuery, priceRange, products])

  const handleAddProduct = (product: Product) => {
    if (!addedProducts.includes(product.id)) {
      setAddedProducts([...addedProducts, product.id])
      onAddProduct(product)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600">
          Přidat produkty
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Přidat produkty do plánu</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="search">Vyhledat podle názvu nebo značky</Label>
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zadejte název suplementu nebo značku..."
              className="mt-2"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Cenové rozpětí</h3>
            <Slider
              value={[priceRange]}
              min={0}
              max={3000}
              step={100}
              onValueChange={(value) => setPriceRange(value[0])}
              className="[&>.bg-primary]:bg-black [&_[role=slider]]:bg-black [&_[role=slider]]:border-black [&_[role=slider]]:shadow-black"
            />
            <div className="flex justify-between text-sm">
              <span>0 Kč</span>
              <span>{priceRange} Kč</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map(product => (
              <Card key={product.id} className="flex flex-row">
                <div className="w-1/3 p-4 flex items-center justify-center">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={150}
                    height={150}
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="w-2/3 p-4">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.brand}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <p className="text-sm"><strong>Kategorie:</strong> {product.category}</p>
                      <p className="text-sm"><strong>Dávkování:</strong> {product.dosage}</p>
                      <p className="text-sm"><strong>Velikost balení:</strong> {product.velikost_baleni}</p>
                      <p className="text-sm"><strong>Složení:</strong> {product.ingredients}</p>
                      <p className="text-sm"><strong>Hodnocení:</strong> {product.rating}/5</p>
                    </div>
                  </CardContent>
                  <CardFooter className="p-0 mt-2 flex justify-between items-center">
                    <p className="text-lg font-bold">{product.price} Kč</p>
                    <Button 
                      onClick={() => handleAddProduct(product)}
                      className={`${addedProducts.includes(product.id) ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-gray-900 to-gray-600 hover:from-gray-800 hover:to-gray-500'} text-white shadow-lg transition-colors`}
                      style={{
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'
                      }}
                      disabled={addedProducts.includes(product.id)}
                    >
                      {addedProducts.includes(product.id) ? (
                        'Přidáno'
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Přidat do plánu
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

