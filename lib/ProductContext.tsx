"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from '@/app/components/auth/auth-context'

interface Supplement {
  id: number
  name: string
  brand: string
  price: number
  category: string
  description: string
  image: string
  dosage: string
  ingredients: string
  velikost_baleni: string
  rating: number
}

interface ProductContextType {
  supplements: Supplement[]
  loading: boolean
  error: string | null
  fetchSupplements: () => Promise<void>
  addProduct: (product: Supplement) => Promise<{ success: boolean; message: string }>
  removeProduct: (id: number) => void
  addedProducts: Supplement[]
  fetchUserSupplements: (userId: string) => Promise<void>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedProducts, setAddedProducts] = useState<Supplement[]>([])
  const { user } = useAuth()

  const fetchSupplements = async () => {
    try {
      setLoading(true)
      let { data: supplements, error } = await supabase
        .from('supplements')
        .select('*')

      if (error) {
        throw error
      }

      setSupplements(supplements || [])
    } catch (err) {
      setError('Chyba při načítání suplementů')
      console.error('Chyba při načítání suplementů:', err)
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (product: Supplement) => {
    if (!user) {
      console.error('Uživatel není přihlášen');
      return { success: false, message: 'Pro přidání produktu do plánu se musíte přihlásit.' };
    }

    try {
      // Nejprve zkontrolujeme, zda již existuje záznam pro tohoto uživatele a suplement
      const { data: existingData, error: existingError } = await supabase
        .from('user_supplements')
        .select('*')
        .eq('user_id', user.id)
        .eq('supplement_id', product.id)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Chyba při kontrole existujícího záznamu:', existingError);
        return { success: false, message: 'Došlo k chybě při kontrole existujícího záznamu.' };
      }

      if (existingData) {
        // Pokud záznam existuje, vrátíme upozornění
        return { success: false, message: 'Tento produkt už máte ve svém plánu.' };
      } else {
        // Pokud záznam neexistuje, vložíme nový
        const { data, error } = await supabase
          .from('user_supplements')
          .insert([
            { user_id: user.id, supplement_id: product.id, quantity: 1 }
          ]);

        if (error) throw error;

        console.log('Produkt byl úspěšně přidán do plánu');
        return { success: true, message: 'Produkt byl úspěšně přidán do plánu.' };
      }
    } catch (error) {
      console.error('Chyba při přidávání produktu do databáze:', error);
      return { success: false, message: 'Došlo k chybě při přidávání produktu do databáze.' };
    }
  };

  const removeProduct = (id: number) => {
    setAddedProducts(prev => prev.filter(product => product.id !== id))
  }

  const fetchUserSupplements = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_supplements')
        .select('supplement_id')
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      const supplementIds = data.map(item => item.supplement_id)
      const userSupplements = supplements.filter(supp => supplementIds.includes(supp.id))
      setAddedProducts(userSupplements)
    } catch (err) {
      console.error('Chyba při načítání uživatelských suplementů:', err)
    }
  }

  useEffect(() => {
    fetchSupplements()
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserSupplements(user.id)
    }
  }, [user])

  useEffect(() => {
    console.log('addedProducts se změnily:', addedProducts)
  }, [addedProducts])

  return (
    <ProductContext.Provider value={{ 
      supplements, 
      loading, 
      error, 
      fetchSupplements, 
      addProduct, 
      removeProduct,
      addedProducts,
      fetchUserSupplements
    }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProducts musí být použit uvnitř ProductProvider')
  }
  return context
}

