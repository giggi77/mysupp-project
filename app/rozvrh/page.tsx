"use client"

import { useState, useEffect } from "react"
import { Navigation } from "../components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coffee, Dumbbell, Moon, Plus, CupSoda } from 'lucide-react'
import { WaterIntakeTracker } from "./components/water-intake-tracker"
import { useProducts } from "@/lib/ProductContext"
import { AddTimeSlotSupplement } from "./components/add-time-slot-supplement"
import { ProductDetailCard } from "./components/product-detail-card"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/app/components/auth/auth-context"
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

class ScheduledSupplement {
  id: number;
  productId: number;
  timeSlot: string;
  dosage: string;
  name: string;
  brand: string;
  image: string;

  constructor({ id, productId, timeSlot, dosage, name, brand, image = "/placeholder.svg" }: {
    id: number;
    productId: number;
    timeSlot: string;
    dosage: string;
    name: string;
    brand: string;
    image?: string;
  }) {
    this.id = id;
    this.productId = productId;
    this.timeSlot = timeSlot;
    this.dosage = dosage;
    this.name = name;
    this.brand = brand;
    this.image = image;
  }
}

export default function RozvrhPage() {
  const { addedProducts } = useProducts()
  const [scheduledSupplements, setScheduledSupplements] = useState<ScheduledSupplement[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{id: string, title: string} | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ScheduledSupplement | null>(null);
  const { user } = useAuth()

  const timeSlots = [
    { id: "rano", title: "Ráno", icon: Coffee },
    { id: "pred-treninkem", title: "Před tréninkem", icon: Dumbbell },
    { id: "po-treninku", title: "Po tréninku", icon: CupSoda },
    { id: "pred-spanim", title: "Před spaním", icon: Moon },
  ]

  useEffect(() => {
    if (user) {
      fetchUserSupplements(user.id)
    }
  }, [user])

  const fetchUserSupplements = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_schedule')
        .select(`
          id,
          supplement_id,
          time_slot,
          dosage,
          supplements (
            id,
            name,
            brand
          )
        `)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      const formattedData = data.map(item => new ScheduledSupplement({
        id: item.id,
        productId: item.supplement_id,
        timeSlot: item.time_slot,
        dosage: item.dosage,
        name: item.supplements.name,
        brand: item.supplements.brand,
        image: "/placeholder.svg"
      }))

      setScheduledSupplements(formattedData)
    } catch (error) {
      console.error('Chyba při načítání uživatelských suplementů:', error)
    }
  }

  const handleAddSupplement = (timeSlot: {id: string, title: string}) => {
    setSelectedTimeSlot(timeSlot)
  }

  const handleScheduleSupplement = (supplement: ScheduledSupplement) => {
    setScheduledSupplements(prev => [...prev, supplement])
  }

  const getSupplementsForSlot = (slot: string) => {
    return scheduledSupplements.filter(supp => supp.timeSlot === slot)
  }

  const handleRemoveSupplement = async (supplementId: number) => {
    try {
      const { error } = await supabase
        .from('user_schedule')
        .delete()
        .eq('id', supplementId)

      if (error) throw error

      setScheduledSupplements(prev => prev.filter(supp => supp.id !== supplementId))
    } catch (error) {
      console.error('Chyba při odstraňování suplementu:', error)
    }
  }

  const handleDosageChange = async (supplementId: number, newDosage: string) => {
    try {
      const { error } = await supabase
        .from('user_schedule')
        .update({ dosage: newDosage })
        .eq('id', supplementId)

      if (error) throw error

      setScheduledSupplements(prev => prev.map(supp => 
        supp.id === supplementId ? { ...supp, dosage: newDosage } : supp
      ))
    } catch (error) {
      console.error('Chyba při aktualizaci dávkování:', error)
    }
  }

  const handleProductClick = (supplement: ScheduledSupplement) => {
    setSelectedProduct(supplement);
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const newSupplements = Array.from(scheduledSupplements);
    const [reorderedItem] = newSupplements.splice(source.index, 1);
    
    // Změna časového slotu, pokud je potřeba
    if (source.droppableId !== destination.droppableId) {
      reorderedItem.timeSlot = destination.droppableId;
    }
    
    newSupplements.splice(destination.index, 0, reorderedItem);

    setScheduledSupplements(newSupplements);

    // Aktualizace v Supabase
    try {
      const { error } = await supabase
        .from('user_schedule')
        .update({ time_slot: destination.droppableId })
        .eq('id', reorderedItem.id)

      if (error) throw error
    } catch (error) {
      console.error('Chyba při aktualizaci časového slotu:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-400 text-transparent bg-clip-text">Denní rozvrh suplementace</h1>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid gap-4 mb-8">
            {timeSlots.map((slot) => {
              const SlotIcon = slot.icon
              const supplements = getSupplementsForSlot(slot.id)

              return (
                <Droppable droppableId={slot.id} key={slot.id}>
                  {(provided, snapshot) => (
                    <Card 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-green-50' : ''
                      }`}
                    >
                      <CardHeader className="flex flex-row items-center justify-between p-2">
                        <div className="flex items-center gap-1">
                          <SlotIcon className="w-4 h-4" />
                          <CardTitle className="text-sm">{slot.title}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAddSupplement(slot)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-1">
                        <div className="space-y-1">
                          {supplements.map((supplement, index) => (
                            <Draggable key={supplement.id.toString()} draggableId={supplement.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                                    snapshot.isDragging ? 'shadow-lg bg-white' : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => handleProductClick(supplement)}
                                >
                                  <div className="flex items-center gap-3">
                                    <Image
                                      src={supplement.image || "/placeholder.svg"}
                                      alt={supplement.name}
                                      width={40}
                                      height={40}
                                      className="rounded-md"
                                    />
                                    <div>
                                      <div className="font-medium">{supplement.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        Dávkování: {supplement.dosage}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveSupplement(supplement.id);
                                      }}
                                    >
                                      Odebrat
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Droppable>
              )
            })}
          </div>
        </DragDropContext>

        <WaterIntakeTracker />

        {selectedTimeSlot && (
          <AddTimeSlotSupplement
            isOpen={!!selectedTimeSlot}
            onClose={() => setSelectedTimeSlot(null)}
            timeSlot={selectedTimeSlot.id}
            timeSlotTitle={selectedTimeSlot.title}
            onAdd={handleScheduleSupplement}
          />
        )}
        {selectedProduct && (
          <ProductDetailCard
            supplement={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onUpdateDosage={handleDosageChange}
          />
        )}
      </main>
    </div>
  )
}

