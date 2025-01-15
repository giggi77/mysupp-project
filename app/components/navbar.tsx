import Link from 'next/link'
import { Button } from "@/components/ui/button"

export function NavBar() {
  return (
    <nav className="flex justify-between items-center py-4">
      <Link href="/" className="text-2xl font-bold">MySupp</Link>
      <div>
        <Button variant="ghost" asChild>
          <Link href="/plan">Můj Plán</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/suplementy">Suplementy</Link>
        </Button>
      </div>
    </nav>
  )
}

