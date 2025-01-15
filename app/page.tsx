"use client"

import { Navigation } from "./components/navigation"
import { FeatureCard } from "./components/feature-card"
import { Button } from "@/components/ui/button"
import { FileText, Database, TrendingUp } from 'lucide-react'
import { AuthProvider, useAuth } from "./components/auth/auth-context"
import { RegistrationDialog } from "./components/auth/registration-dialog"
import { LoginDialog } from "./components/auth/login-dialog"
import { useState } from 'react';

function AuthButtons() {
  const { user, signOut } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      setError('Došlo k chybě při odhlašování. Zkuste to prosím znovu.')
    }
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span>Přihlášen jako: {user.email}</span>
        <Button onClick={handleSignOut}>Odhlásit se</Button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
    )
  }

  return (
    <div className="flex gap-4 justify-center">
      <RegistrationDialog />
      <LoginDialog />
    </div>
  )
}

function HomeContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-gray-600 to-gray-300 text-transparent bg-clip-text">
            MYSUPP
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Vítejte ve vašem osobním průvodci světem suplementace
          </p>
          <AuthButtons />
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <FeatureCard
            icon={FileText}
            title="Personalizovaný plán"
            description="Vytvořte si suplementační plán na míru vašim cílům a potřebám."
          />
          <FeatureCard
            icon={Database}
            title="Široká nabídka suplementů"
            description="Vybírejte z rozsáhlé databáze kvalitních doplňků stravy."
          />
          <FeatureCard
            icon={TrendingUp}
            title="Sledování pokroku"
            description="Monitorujte svůj pokrok a optimalizujte svůj suplementační plán."
          />
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  )
}

