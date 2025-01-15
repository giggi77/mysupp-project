import { Navigation } from "../components/navigation"
import { ProtocolCard } from "./components/protocol-card"

const protocols = [
  {
    id: 1,
    title: "Maximální Vytrvalost",
    description: "Protokol pro zvýšení vytrvalostního výkonu a energetické kapacity",
    duration: "12 týdnů",
    category: "Vytrvalost",
    level: "Pokročilý",
    icon: "endurance"
  },
  {
    id: 2,
    title: "Silový Výkon",
    description: "Optimalizace suplementace pro maximální sílu a výbušnost",
    duration: "8 týdnů",
    category: "Síla",
    level: "Expert",
    icon: "strength"
  },
  {
    id: 3,
    title: "Rychlá Regenerace",
    description: "Protokol zaměřený na zrychlení regenerace po náročném tréninku",
    duration: "4 týdnů",
    category: "Regenerace",
    level: "Začátečník",
    icon: "regeneration"
  },
  {
    id: 4,
    title: "Imunitní Podpora",
    description: "Komplexní protokol pro posílení imunitního systému",
    duration: "12 týdnů",
    category: "Zdraví",
    level: "Začátečník",
    icon: "health"
  },
  {
    id: 5,
    title: "Mentální Výkon",
    description: "Optimalizace kognitivních funkcí a mentální výkonnosti",
    duration: "6 týdnů",
    category: "Kognice",
    level: "Pokročilý",
    icon: "cognitive"
  },
  {
    id: 6,
    title: "Celkové Zdraví",
    description: "Základní protokol pro podporu celkového zdraví a vitality",
    duration: "16 týdnů",
    category: "Zdraví",
    level: "Začátečník",
    icon: "wellness"
  }
] as const

export default function ProtocolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-600 to-gray-400 text-transparent bg-clip-text">
            Protokoly
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Vyberte si plán přesně pro Váš cíl. Každý protokol je navržen podle vědeckých poznatků, aby Vám poskytl jasná doporučení pro maximální výsledky.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {protocols.map((protocol) => (
            <ProtocolCard
              key={protocol.id}
              {...protocol}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

