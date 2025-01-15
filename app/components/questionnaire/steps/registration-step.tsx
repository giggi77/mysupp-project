"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { UserRegistration } from "../types"

interface RegistrationStepProps {
  onSubmit: (data: UserRegistration) => void
  isSubmitting: boolean
  error: string | null
}

export function RegistrationStep({ onSubmit, isSubmitting, error }: RegistrationStepProps) {
  const [formData, setFormData] = useState<UserRegistration>({
    email: "",
    password: "",
    name: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Děkujeme za informace</h2>
        <p className="text-muted-foreground">
          Vytvořte si účet pro uložení vašeho profilu a přístup k personalizovaným doporučením.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Heslo"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Jméno"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !isValidEmail(formData.email)}
        >
          {isSubmitting ? "Registrace..." : "Vytvořit účet"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Nebo se přihlaste pomocí
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Button variant="outline" type="button">
            Facebook
          </Button>
          <Button variant="outline" type="button">
            Google
          </Button>
          <Button variant="outline" type="button">
            Apple
          </Button>
        </div>
      </form>
    </div>
  )
}

