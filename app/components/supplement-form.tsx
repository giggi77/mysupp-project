"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SupplementForm() {
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Zde bude logika pro přidání suplementu
    console.log('Přidán suplement:', { name, dosage })
    setName('')
    setDosage('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Název suplementu</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="dosage">Dávkování</Label>
        <Input
          id="dosage"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Přidat Suplement</Button>
    </form>
  )
}

