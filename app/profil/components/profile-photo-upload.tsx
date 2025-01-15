"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from 'lucide-react'
import Image from "next/image"
import { supabase } from "@/lib/supabase"

interface ProfilePhotoUploadProps {
  currentPhotoUrl: string | null
  onPhotoUpdated: (url: string) => void
  userId?: string
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoUpdated,
  userId
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userId) return

    try {
      setIsUploading(true)

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)

      // Update user profile with new photo URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ photo_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      onPhotoUpdated(publicUrl)
    } catch (error) {
      console.error('Chyba při nahrávání fotky:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
        {currentPhotoUrl ? (
          <Image
            src={currentPhotoUrl}
            alt="Profilová fotka"
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Nahrát profilovou fotku"
            />
            <div className="flex flex-col items-center">
              <Camera className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Nahrát fotku</span>
            </div>
          </div>
        )}
      </div>
      <label
        htmlFor="photo-upload"
        className="absolute bottom-0 right-0 p-2 bg-green-500 rounded-full cursor-pointer hover:bg-green-600 transition-colors"
      >
        <Camera className="w-4 h-4 text-white" />
        <input
          type="file"
          id="photo-upload"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </label>
    </div>
  )
}

