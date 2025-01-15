"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SuccessDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SuccessDialog({ isOpen, onClose }: SuccessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrace úspěšná</DialogTitle>
          <DialogDescription>
            Váš účet byl úspěšně vytvořen. Nyní se můžete přihlásit a začít používat naši aplikaci.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>Zavřít</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

