import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ProductProvider } from '@/lib/ProductContext'
import { AuthProvider } from './components/auth/auth-context'
import { UserDataLoader } from './components/UserDataLoader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MySupp - Suplementační Plán',
  description: 'Aplikace pro správu vašeho suplementačního plánu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className={inter.className}>
        <AuthProvider>
          <ProductProvider>
            <UserDataLoader>
              <div className="min-h-screen bg-background">
                {children}
              </div>
            </UserDataLoader>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

