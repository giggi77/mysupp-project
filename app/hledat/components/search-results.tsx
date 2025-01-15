"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Star, Plus } from 'lucide-react'
import { useProducts } from '@/lib/ProductContext'
import { useAuth } from "@/app/components/auth/auth-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Supplement {
  id: number
  name: string
  brand: string
  price: number
  category: string
  image: string
  dosage: string
  ingredients: string
  velikost_baleni: string
  rating: number
  description: string
}

interface SearchResultsProps {
  supplements: Supplement[]
  filteredSupplements: Supplement[]
  isFiltered: boolean
}

export function SearchResults({ supplements, filteredSupplements, isFiltered }: SearchResultsProps) {
  const { addProduct } = useProducts()
  const { user } = useAuth()
  const [addedProducts, setAddedProducts] = useState<number[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Supplement | null>(null)

  const handleAddProduct = async (event: React.MouseEvent, product: Supplement) => {
    event.stopPropagation();
    if (!user) {
      alert("Pro přidání produktu do plánu se musíte přihlásit.");
      return;
    }
    
    try {
      const result = await addProduct(product);
      if (result.success) {
        setAddedProducts(prev => [...prev, product.id]);
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Chyba při přidávání produktu:', error);
      alert('Došlo k chybě při přidávání produktu do plánu. Zkuste to prosím znovu.');
    }
  }

  const topProducts = supplements
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20);

  const displayProducts = isFiltered ? filteredSupplements : topProducts;

  const handleProductClick = (product: Supplement) => {
    setSelectedProduct(product);
  }

  return (
    <div>
      {!isFiltered && (
        <h2 className="text-xl font-semibold mb-4">Top produkty</h2>
      )}
      {isFiltered && (
        <div className="mb-4 text-muted-foreground">
          Nalezeno {filteredSupplements.length} výsledků vyhledávání
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayProducts.map((item) => (
          <Card 
            key={`search-${item.id}`} 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => handleProductClick(item)}
          >
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                />
                <Badge variant="secondary" className="absolute top-2 right-2">
                  {item.category}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1 truncate">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{item.brand}</p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm">{item.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm">{item.velikost_baleni}</span>
                </div>
                <p className="text-sm mb-4 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">{item.price} Kč</span>
                  <Button 
                    size="sm"
                    className={`transition-colors ${
                      addedProducts.includes(item.id)
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gradient-to-r from-gray-600 to-gray-400 hover:from-gray-700 hover:to-gray-500 text-white'
                    }`}
                    onClick={(e) => handleAddProduct(e, item)}
                    disabled={addedProducts.includes(item.id)}
                  >
                    {addedProducts.includes(item.id) ? 'Přidáno' : <Plus className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail produktu</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="mt-4">
              <div className="mb-4">
                <Image
                  src={selectedProduct.image || "/placeholder.svg"}
                  alt={selectedProduct.name}
                  width={500}
                  height={300}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{selectedProduct.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{selectedProduct.brand}</p>
              <p className="text-sm mb-4">{selectedProduct.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div><strong>Kategorie:</strong> {selectedProduct.category}</div>
                <div><strong>Dávkování:</strong> {selectedProduct.dosage}</div>
                <div><strong>Velikost balení:</strong> {selectedProduct.velikost_baleni}</div>
                <div className="flex items-center">
                  <strong className="mr-1">Hodnocení:</strong>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{selectedProduct.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">{selectedProduct.price} Kč</span>
                <Button 
                  className={`transition-colors ${
                    addedProducts.includes(selectedProduct.id)
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                  onClick={(e) => handleAddProduct(e, selectedProduct)}
                  disabled={addedProducts.includes(selectedProduct.id)}
                >
                  {addedProducts.includes(selectedProduct.id) ? 'Přidáno do plánu' : 'Přidat do plánu'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

