"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface RegisterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegisterDialog({ open, onOpenChange }: RegisterDialogProps) {
  const [userType, setUserType] = useState<"individual" | "legal">("individual")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    firstName: "",
    lastName: "",
    companyName: "",
    inn: "",
    contactPerson: "",
    website: "",
  })
  const [agreed, setAgreed] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!agreed) {
      toast({
        title: "Rozilik talab qilinadi",
        description: "Iltimos, maxfiylik siyosatiga rozilik bildiring.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const userData = {
      userType,
      ...formData,
    }

    const success = await register(userData)

    if (success) {
      toast({
        title: "Muvaffaqiyat!",
        description: "Ro'yxatdan muvaffaqiyatli o'tdingiz.",
      })
      onOpenChange(false)
      setFormData({
        email: "",
        password: "",
        phone: "",
        address: "",
        city: "",
        firstName: "",
        lastName: "",
        companyName: "",
        inn: "",
        contactPerson: "",
        website: "",
      })
      setAgreed(false)
    } else {
      toast({
        title: "Xatolik!",
        description: "Ro'yxatdan o'tishda xatolik yuz berdi.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ro'yxatdan o'tish</DialogTitle>
            <DialogDescription>Ma'lumotlaringizni to'ldiring</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Type Selection */}
            <div className="space-y-3">
              <Label>Foydalanuvchi turi</Label>
              <RadioGroup value={userType} onValueChange={(value: "individual" | "legal") => setUserType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual">Jismoniy shaxs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="legal" id="legal" />
                  <Label htmlFor="legal">Yuridik shaxs</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" pattern="^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$" value={formData.email} onChange={(e) => updateFormData("email", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Parol</Label>
                <Input id="password" type="password" minLength={6} value={formData.password} onChange={(e) => updateFormData("password", e.target.value)} required />
              </div>
            </div>

            {userType === "individual" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ism</Label>
                  <Input id="firstName" value={formData.firstName} onChange={(e) => updateFormData("firstName", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Familiya</Label>
                  <Input id="lastName" value={formData.lastName} onChange={(e) => updateFormData("lastName", e.target.value)} required />
                </div>
              </div>
            )}

            {userType === "legal" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Kompaniya nomi</Label>
                    <Input id="companyName" value={formData.companyName} onChange={(e) => updateFormData("companyName", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inn">INN</Label>
                    <Input id="inn" pattern="^[0-9]{9}$" value={formData.inn} onChange={(e) => updateFormData("inn", e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Kontakt shaxs</Label>
                    <Input id="contactPerson" value={formData.contactPerson} onChange={(e) => updateFormData("contactPerson", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Veb-sayt</Label>
                    <Input id="website" type="url" value={formData.website} onChange={(e) => updateFormData("website", e.target.value)} required />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon raqam</Label>
                <Input id="phone" pattern="^[0-9]{7,15}$" value={formData.phone} onChange={(e) => updateFormData("phone", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Shahar</Label>
                <Input id="city" value={formData.city} onChange={(e) => updateFormData("city", e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Manzil</Label>
              <Input id="address" value={formData.address} onChange={(e) => updateFormData("address", e.target.value)} required />
            </div>

            {/* Privacy Agreement */}
            <div className="flex items-start gap-2">
              <input id="privacy" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
              <label htmlFor="privacy" className="text-sm">
                Men {" "}
                <button type="button" onClick={() => setShowPrivacy(true)} className="text-blue-600 underline">
                  Maxfiylik siyosati
                </button>{" "}
                bilan tanishdim va roziman
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Kuting..." : "Ro'yxatdan o'tish"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Maxfiylik siyosati</DialogTitle>
            <DialogDescription>
              Sizning ma'lumotlaringiz xavfsiz saqlanadi. Ular faqat ro'yxatdan o'tish va xizmat ko'rsatish maqsadida ishlatiladi. Uchinchilar bilan bo‘lishilmaydi. Barcha ma'lumotlar GDPR va O'zbekiston qonunchiligiga muvofiq tarzda qayta ishlanadi.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
