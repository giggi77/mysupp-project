"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoginForm } from "./login-form"

export function LoginDialog() {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = () => {
    setIsOpen(false)
    // Zde můžete přidat kód pro přesměrování uživatele nebo další akce po úspěšném přihlášení
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Přihlásit se</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Přihlášení</DialogTitle>
          <DialogDescription>
            Přihlaste se ke svému účtu pro přístup k personalizovanému suplementačnímu plánu.
          </DialogDescription>
        </DialogHeader>
        <LoginForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}

