"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Star, Tag, Box } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

interface SearchFiltersProps {
  onSearch: (searchTerm: string, priceRange: number, selectedCategories: string[], selectedBrands: string[], minRating: number) => void
  supplements: Supplement[]
}

export function SearchFilters({ onSearch, supplements }: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState(3000)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null)

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(supplements.map(s => s.category)))
    setCategories(uniqueCategories)

    const uniqueBrands = Array.from(new Set(supplements.map(s => s.brand)))
    setBrands(uniqueBrands)
  }, [supplements])

  const handleSearch = () => {
    onSearch(searchTerm, priceRange, selectedCategories, selectedBrands, minRating)
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const updatedCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      onSearch(searchTerm, priceRange, updatedCategories, selectedBrands, minRating);
      return updatedCategories;
    });
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => {
      const updatedBrands = prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand];
      onSearch(searchTerm, priceRange, selectedCategories, updatedBrands, minRating);
      return updatedBrands;
    });
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value[0]);
    onSearch(searchTerm, value[0], selectedCategories, selectedBrands, minRating);
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    onSearch(newSearchTerm, priceRange, selectedCategories, selectedBrands, minRating);
  };

  const handleRatingChange = (value: string) => {
    const newRating = Number(value);
    setMinRating(newRating);
    onSearch(searchTerm, priceRange, selectedCategories, selectedBrands, newRating);
  };

  const maxPrice = Math.max(...supplements.map(s => s.price), 3000)

  const toggleFilter = (filter: string) => {
    setExpandedFilter(expandedFilter === filter ? null : filter)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="search">Vyhledat podle názvu nebo značky</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={handleSearchTermChange}
                placeholder="Zadejte název suplementu nebo značku..."
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm sm:text-base">Cenové rozpětí</h3>
              <div className="flex items-center space-x-2">
                <div className="w-64 sm:w-80">
                  <Slider
                    value={[priceRange]}
                    min={0}
                    max={maxPrice}
                    step={100}
                    onValueChange={handlePriceRangeChange}
                    className="[&>.bg-primary]:bg-gradient-to-r [&>.bg-primary]:from-gray-600 [&>.bg-primary]:to-gray-400 [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-gray-700 [&_[role=slider]]:to-gray-500 [&_[role=slider]]:border-gray-300 [&_[role=slider]]:shadow-md [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 sm:[&_[role=slider]]:w-4 sm:[&_[role=slider]]:h-4"
                  />
                </div>
                <span className="text-xs font-medium w-20">{priceRange} Kč</span>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-0 sm:flex sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => toggleFilter('categories')}
                className="w-full sm:flex-1 justify-between bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-md"
              >
                <Tag className="w-4 h-4 mr-2" />
                <span>Kategorie</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilter === 'categories' ? 'transform rotate-180' : ''}`} />
              </Button>
              <Button
                variant="outline"
                onClick={() => toggleFilter('brands')}
                className="w-full sm:flex-1 justify-between bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-md"
              >
                <Box className="w-4 h-4 mr-2" />
                <span>Značky</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilter === 'brands' ? 'transform rotate-180' : ''}`} />
              </Button>
              <Select 
                value={minRating.toString()} 
                onValueChange={handleRatingChange}
              >
                <SelectTrigger className="w-full sm:flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-md">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-400" />
                      <span>Hodnocení</span>
                    </div>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      <div className="flex items-center">
                        {rating === 0 ? "Všechna hodnocení" : (
                          <>
                            {rating}
                            <Star className="w-4 h-4 ml-1 fill-yellow-400 text-yellow-400" />
                            {rating < 5 && "a více"}
                          </>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {expandedFilter === 'categories' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    onClick={() => toggleCategory(category)}
                    className={`w-full justify-start text-sm py-1 px-2 shadow-md transition-all ${
                      selectedCategories.includes(category)
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}

            {expandedFilter === 'brands' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {brands.map((brand) => (
                  <Button
                    key={brand}
                    variant={selectedBrands.includes(brand) ? "default" : "outline"}
                    onClick={() => toggleBrand(brand)}
                    className={`w-full justify-start text-sm py-1 px-2 shadow-md transition-all ${
                      selectedBrands.includes(brand)
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {brand}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

