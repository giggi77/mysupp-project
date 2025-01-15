"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Timer, Dumbbell, Zap, Heart, Brain, Shield } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

interface ProtocolCardProps {
  id: number
  title: string
  description: string
  duration: string
  category: string
  level: string
  icon: "endurance" | "strength" | "regeneration" | "health" | "cognitive" | "wellness"
}

export function ProtocolCard({
  id,
  title,
  description,
  duration,
  category,
  level,
  icon
}: ProtocolCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'začátečník':
        return 'bg-gradient-to-r from-blue-500 to-blue-600'
      case 'pokročilý':
        return 'bg-gradient-to-r from-green-500 to-green-600'
      case 'expert':
        return 'bg-gradient-to-r from-red-500 to-red-600'
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'endurance':
        return Timer
      case 'strength':
        return Dumbbell
      case 'regeneration':
        return Zap
      case 'health':
        return Heart
      case 'cognitive':
        return Brain
      case 'wellness':
        return Shield
      default:
        return Timer
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vytrvalost':
        return 'border-blue-400 bg-blue-50 text-blue-600'
      case 'síla':
        return 'border-red-400 bg-red-50 text-red-600'
      case 'regenerace':
        return 'border-green-400 bg-green-50 text-green-600'
      case 'zdraví':
        return 'border-purple-400 bg-purple-50 text-purple-600'
      case 'kognice':
        return 'border-yellow-400 bg-yellow-50 text-yellow-600'
      default:
        return 'border-gray-400 bg-gray-50 text-gray-600'
    }
  }

  const Icon = getIcon(icon)

  const handleCardClick = async () => {
    setIsLoading(true)
    setIsOpen(true)
    try {
      const { data, error } = await supabase
        .from('protocols')
        .select('content')
        .eq('id', id)
        .single()

      if (error) throw error

      setContent(data.content)
    } catch (error) {
      console.error('Chyba při načítání obsahu protokolu:', error)
      setContent("Omlouváme se, obsah protokolu se nepodařilo načíst.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full flex flex-col" onClick={handleCardClick}>
        <div className="relative flex-grow">
          <div className="aspect-[4/3] relative overflow-hidden">
            <Image
              src={`/placeholder.svg?height=300&width=400`}
              alt={title}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <Badge className={`${getLevelColor(level)} text-white font-medium text-xs mb-2`}>
                {level}
              </Badge>
              <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                {title}
              </h3>
            </div>
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <Badge variant="outline" className={`${getCategoryColor(category)} font-medium text-xs self-start mb-2`}>
              {category}
            </Badge>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
              {description}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground mt-auto">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-medium">{duration}</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="mt-4">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsOpen(false)}>Zavřít</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

