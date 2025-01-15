"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Home, Search, Calendar, ClipboardList, UserCircle, Waves, BookOpen } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { name: "MySupp", href: "/", icon: Waves },
    { name: "Domů", href: "/domu", icon: Home },
    { name: "Hledat", href: "/hledat", icon: Search },
    { name: "Můj plán", href: "/plan", icon: Calendar },
    { name: "Rozvrh", href: "/rozvrh", icon: BookOpen },
    { name: "Protokoly", href: "/protokoly", icon: ClipboardList },
    { name: "Profil", href: "/profil", icon: UserCircle },
  ]

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center space-x-4 h-16">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

