import { TypeIcon as type, LucideIcon } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 opacity-90" />
      
      <CardContent className="relative p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </Card>
  )
}

