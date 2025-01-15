"use client"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CircularProgress } from "./components/circular-progress"
import Image from "next/image"
import { Trash2, X } from 'lucide-react'
import { useProducts } from '@/lib/ProductContext'
import { ProductDetails } from "./components/product-details"
import { MonthlyExpense } from "./components/monthly-expense"
import { SearchResults } from "../hledat/components/search-results"
import { SearchFilters } from "../hledat/components/search-filters"
import { useAuth } from '../components/auth/auth-context'
import { supabase } from "@/lib/supabase"
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
  description: string
  image: string
  dosage: string
  ingredients: string
  velikost_baleni: string
  rating: number
}

interface IngredientDetails {
  name: string
  description: string
  benefits: string[]
  sources: string[]
}

// Nová komponenta pro zobrazení detailů složky
function IngredientDetailsCard({ ingredient, onClose }: { ingredient: IngredientDetails, onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ingredient.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">{ingredient.description}</p>
          <h4 className="font-semibold mb-1">Přínosy:</h4>
          <ul className="list-disc list-inside mb-2">
            {ingredient.benefits.map((benefit, index) => (
              <li key={index} className="text-sm">{benefit}</li>
            ))}
          </ul>
          <h4 className="font-semibold mb-1">Zdroje:</h4>
          <ul className="list-disc list-inside">
            {ingredient.sources.map((source, index) => (
              <li key={index} className="text-sm">{source}</li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function PlanPage() {
  const { user } = useAuth()
  const { addedProducts, removeProduct, supplements, addProduct, fetchUserSupplements } = useProducts()
  const [showProducts, setShowProducts] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Supplement | null>(null)
  const [showSearchCard, setShowSearchCard] = useState(false)
  const [filteredSupplements, setFilteredSupplements] = useState(supplements)
  const [isFiltered, setIsFiltered] = useState(false)
  const [protocols, setProtocols] = useState<any[]>([])
  const [userSupplements, setUserSupplements] = useState<Supplement[]>([])
  const [ingredients, setIngredients] = useState<string[]>([])
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientDetails | null>(null)

  const handleProductClick = (product: Supplement) => {
    setSelectedProduct(product)
  }

  const handleSearch = (searchTerm: string, priceRange: number, selectedCategories: string[], selectedBrands: string[], minRating: number) => {
    const filtered = supplements.filter(supplement => {
      const matchesSearch = searchTerm === '' || 
        supplement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplement.brand.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPrice = supplement.price <= priceRange
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(supplement.category)
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(supplement.brand)
      const matchesRating = supplement.rating >= minRating

      return matchesSearch && matchesPrice && matchesCategory && matchesBrand && matchesRating
    })
    setFilteredSupplements(filtered)
    setIsFiltered(searchTerm !== '' || priceRange < 3000 || selectedCategories.length > 0 || selectedBrands.length > 0 || minRating > 0)
  }

  useEffect(() => {
    if (showSearchCard) {
      setFilteredSupplements(supplements)
      setIsFiltered(false)
    }
  }, [showSearchCard, supplements])

  const searchCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchCardRef.current && !searchCardRef.current.contains(event.target as Node)) {
        setShowSearchCard(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    console.log('addedProducts na stránce Můj plán:', addedProducts)
  }, [addedProducts])

  useEffect(() => {
    if (user) {
      fetchUserSupplements(user.id)
    }
  }, [user, fetchUserSupplements])

  useEffect(() => {
    const allIngredients = addedProducts.flatMap(product => 
      product.ingredients.split(', ').map(ingredient => ingredient.trim())
    )
    const uniqueIngredients = Array.from(new Set(allIngredients))
    setIngredients(uniqueIngredients)
  }, [addedProducts])

  console.log('Načítám stránku Můj plán')

  const removeProductFromPlan = async (productId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_supplements')
        .delete()
        .eq('user_id', user.id)
        .eq('supplement_id', productId);

      if (error) throw error;

      // Aktualizace lokálního stavu
      setUserSupplements(prev => prev.filter(supp => supp.id !== productId));
      removeProduct(productId);
    } catch (error) {
      console.error('Chyba při odstraňování produktu:', error);
      alert('Došlo k chybě při odstraňování produktu. Zkuste to prosím znovu.');
    }
  };

  // Funkce pro získání detailů o složce (toto je jen ukázka, ve skutečnosti byste měli mít databázi s těmito informacemi)
  const getIngredientDetails = (ingredientName: string): IngredientDetails => {
    // Toto je jen ukázkový objekt, ve skutečné aplikaci byste měli mít databázi s těmito informacemi
    return {
      name: ingredientName,
      description: `${ingredientName} je důležitá složka v mnoha suplementech.`,
      benefits: ['Podporuje zdraví', 'Zvyšuje energii', 'Zlepšuje regeneraci'],
      sources: ['Potraviny', 'Suplementy']
    }
  }

  const handleIngredientClick = (ingredient: string) => {
    const details = getIngredientDetails(ingredient)
    setSelectedIngredient(details)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-gray-600 to-gray-400 text-transparent bg-clip-text">
          Můj Suplementační Plán
        </h1>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Levá strana - Přehled plánu */}
          <Card>
            <CardHeader>
              <CardTitle>Přehled plánu</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-48 h-48 mb-6">
                <CircularProgress percentage={75} />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Tvůj plán je na skvělé úrovni.
              </h3>
              <p className="text-muted-foreground">
                Doporučuji přidat zinek a Omega-3 mastné kyseliny pro ještě lepší výsledky.
              </p>
            </CardContent>
          </Card>

          {/* Pravá strana - Statistiky a karty */}
          <div className="space-y-6">
            {/* Statistiky */}
            <div className="grid grid-cols-3 gap-4">
              <Card
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setShowProducts(true)}
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-green-500">{addedProducts.length}</div>
                  <p className="text-sm text-muted-foreground">Produkty</p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setShowProducts(false)}
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">{ingredients.length}</div>
                  <p className="text-sm text-muted-foreground">Složky</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">{protocols.length || 0}</div>
                  <p className="text-sm text-muted-foreground">Protokoly</p>
                </CardContent>
              </Card>
            </div>

            {/* Produkty nebo Složky */}
            <Card>
              <CardHeader>
                <CardTitle>{showProducts ? 'Produkty v plánu' : 'Složky v plánu'}</CardTitle>
              </CardHeader>
              <CardContent>
                {addedProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Zatím nemáte žádné produkty v plánu.
                    </p>
                    <Button 
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => setShowSearchCard(true)}
                    >
                      Přidat produkty
                    </Button>
                  </div>
                ) : showProducts ? (
                  <div className="space-y-4">
                    {addedProducts.map((product) => (
                      <Card key={product.id} className="flex flex-row items-center cursor-pointer hover:bg-gray-50" onClick={() => handleProductClick(product)}>
                        <div className="w-1/4 p-2">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={80}
                            height={80}
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="w-2/4 p-2">
                          <CardHeader className="p-0">
                            <CardTitle className="text-sm">{product.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          </CardHeader>
                          <CardContent className="p-0 mt-1">
                            <p className="text-xs"><strong>Dávkování:</strong> {product.dosage || 'Není uvedeno'}</p>
                            <p className="text-xs"><strong>Velikost balení:</strong> {product.velikost_baleni || 'Není uvedeno'}</p>
                          </CardContent>
                        </div>
                        <div className="w-1/4 p-2 flex flex-col items-end">
                          <p className="text-sm font-bold mb-2">{product.price ? `${product.price} Kč` : 'Cena není uvedena'}</p>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeProductFromPlan(product.id);
                            }}
                            className="bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    <div className="text-center mt-4">
                      <Button 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => setShowSearchCard(true)}
                      >
                        Přidat další produkty
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ingredients.map((ingredient, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleIngredientClick(ingredient)}
                      >
                        <span>{ingredient}</span>
                        <span className="text-sm text-gray-500">
                          {addedProducts.filter(product => 
                            product.ingredients.split(', ').map(i => i.trim()).includes(ingredient)
                          ).length} produktů
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Moje Protokoly */}
            <Card>
              <CardHeader>
                <CardTitle>Moje Protokoly</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Zatím nemáte přidané žádné protokoly.
                  </p>
                  <Button className="bg-green-500 hover:bg-green-600">
                    Přidat protokol
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Měsíční útrata */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Měsíční útrata</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyExpense supplements={addedProducts} />
          </CardContent>
        </Card>

        {showSearchCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto" ref={searchCardRef}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Vyhledat produkty</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowSearchCard(false)}>
                    Zavřít
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-[250px_1fr] gap-4">
                  <SearchFilters onSearch={handleSearch} supplements={supplements} />
                  <SearchResults 
                    supplements={supplements} 
                    filteredSupplements={filteredSupplements} 
                    isFiltered={isFiltered}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <ProductDetails
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
        {selectedIngredient && (
          <IngredientDetailsCard 
            ingredient={selectedIngredient} 
            onClose={() => setSelectedIngredient(null)} 
          />
        )}
      </main>
    </div>
  )
}

