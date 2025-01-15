"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface QuestionnaireDataEditProps {
  data: any
  onUpdate: (newData: any) => void
}

export function QuestionnaireDataEdit({ data, onUpdate }: QuestionnaireDataEditProps) {
  const [editedData, setEditedData] = useState(data || {})

  const handleChange = (key: string, value: string) => {
    setEditedData({ ...editedData, [key]: value })
  }

  const handleSubmit = () => {
    onUpdate(editedData)
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="activity_level">Úroveň aktivity</Label>
          <Input
            id="activity_level"
            value={editedData.activity_level || ""}
            onChange={(e) => handleChange("activity_level", e.target.value)}
          />
        </div>
        <Button onClick={handleSubmit}>Uložit změny</Button>
      </CardContent>
    </Card>
  )
}

