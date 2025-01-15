"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from 'lucide-react'

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

interface MonthlyExpenseProps {
  supplements: Supplement[]
}

export function MonthlyExpense({ supplements }: MonthlyExpenseProps) {
  const calculateMonthlyExpense = () => {
    return supplements.reduce((total, product) => {
      const packageSize = parseInt(product.velikost_baleni.match(/\d+/)?.[0] || "0")
      const recommendedDosage = parseInt(product.dosage.match(/\d+/)?.[0] || "1")
      const daysPerPackage = packageSize / recommendedDosage
      const dailyCost = product.price / daysPerPackage
      return total + (dailyCost * 30)
    }, 0)
  }

  const monthlyExpense = calculateMonthlyExpense()

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 opacity-90" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
          <DollarSign className="w-5 h-5 text-primary" />
          Měsíční útrata za suplementy
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-2">
        <p className="text-3xl font-bold">{monthlyExpense.toFixed(2)} Kč</p>
        <p className="text-sm text-muted-foreground">
          Tato částka je vypočítána na základě velikosti balení, doporučeného dávkování a ceny jednotlivých suplementů ve vašem plánu.
        </p>
      </CardContent>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </Card>
  )
}

