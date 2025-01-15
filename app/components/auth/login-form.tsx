"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "./auth-context"

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { user, error } = await signIn(email, password)
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Nesprávný email nebo heslo.")
        } else {
          setError(error.message)
        }
      } else if (user) {
        onSuccess()
      } else {
        setError('Neočekávaná chyba při přihlášení. Zkuste to prosím znovu.')
      }
    } catch (error) {
      setError('Došlo k neočekávané chybě při přihlášení. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Heslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Přihlašování..." : "Přihlásit se"}
      </Button>
    </form>
  )
}

