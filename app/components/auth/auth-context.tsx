"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    console.log('1. Začátek procesu registrace')
    try {
      console.log('2. Kontrola vstupních dat')
      if (!email || !password || !name) {
        console.error('Chybí některé z povinných polí')
        throw new Error('Všechna pole jsou povinná')
      }

      console.log('3. Zahájení registrace uživatele pomocí Supabase Auth')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      })

      if (error) {
        console.error('4. Chyba při registraci v auth.users:', error)
        throw error
      }

      console.log('4. Uživatel úspěšně vytvořen v auth.users')

      if (data.user) {
        console.log('5. Začátek vkládání dat do public.users')
        try {
          const { data: userData, error: insertError } = await supabase
            .from('users')
            .insert({ 
              id: data.user.id,
              name, 
              email,
              created_at: new Date().toISOString()
            })
            .select()

          if (insertError) {
            console.error('6. Chyba při vkládání do public.users:', insertError)
            console.log('7. Zahájení procesu odstranění uživatele z auth.users')
            await supabase.auth.admin.deleteUser(data.user.id)
            console.log('8. Uživatel odstraněn z auth.users')
            throw insertError
          }

          console.log('6. Uživatel úspěšně vložen do public.users:', userData)

          console.log('7. Nastavení uživatele v kontextu')
          setUser(data.user)
          
          console.log('8. Registrace úspěšně dokončena')
          return { user: data.user, error: null }
        } catch (insertError) {
          console.error('Chyba při vkládání do public.users:', insertError)
          throw new Error('Registrace selhala při vkládání do public.users')
        }
      } else {
        console.error('5. Neočekávaná chyba: data.user je null')
        throw new Error('Neočekávaná chyba při registraci')
      }
    } catch (error) {
      console.error('Chyba při registraci:', error)
      return { user: null, error: error instanceof Error ? error : new Error('Neznámá chyba při registraci') }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name, created_at')
          .eq('id', data.user.id)
          .single()

        if (userError) throw userError

        const extendedUser = {
          ...data.user,
          name: userData.name,
          created_at: userData.created_at
        }

        setUser(extendedUser)
        return { user: extendedUser, error: null }
      } else {
        throw new Error('Neočekávaná chyba při přihlašování')
      }
    } catch (error) {
      console.error('Chyba při přihlašování:', error)
      return { user: null, error: error instanceof Error ? error : new Error('Neznámá chyba při přihlašování') }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
    } catch (error) {
      console.error('Chyba při odhlašování:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth musí být použit uvnitř AuthProvider')
  }
  return context
}

