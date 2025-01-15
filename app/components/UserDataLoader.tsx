"use client"

import { useEffect } from 'react'
import { useAuth } from './auth/auth-context'
import { useProducts } from '@/lib/ProductContext'

export function UserDataLoader({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { fetchUserSupplements } = useProducts()

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        console.log('Načítám suplementy pro uživatele:', user.id)
        try {
          await fetchUserSupplements(user.id)
          console.log('Suplementy úspěšně načteny')
        } catch (error) {
          console.error('Chyba při načítání suplementů:', error)
        }
      }
    }

    loadUserData()
  }, [user, fetchUserSupplements])

  return <>{children}</>
}

