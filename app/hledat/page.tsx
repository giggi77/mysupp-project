"use client"

import { useState, useEffect } from "react"
import { Navigation } from "../components/navigation"
import { SearchFilters } from "./components/search-filters"
import { SearchResults } from "./components/search-results"
import { useProducts } from '@/lib/ProductContext'
import { Loader2 } from 'lucide-react'

export default function SearchPage() {
  const { supplements, loading, error } = useProducts()
  const [filteredSupplements, setFilteredSupplements] = useState(supplements)
  const [isFiltered, setIsFiltered] = useState(false)

  useEffect(() => {
    setFilteredSupplements(supplements)
  }, [supplements])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-red-500">Chyba: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gray-600 to-gray-400 text-transparent bg-clip-text">Hledat Suplementy</h1>
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          <SearchFilters onSearch={handleSearch} supplements={supplements} />
          <SearchResults 
            supplements={supplements} 
            filteredSupplements={filteredSupplements} 
            isFiltered={isFiltered}
          />
        </div>
      </main>
    </div>
  )
}

