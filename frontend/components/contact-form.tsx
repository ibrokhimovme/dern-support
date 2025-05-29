"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function ContactForm() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("https://digus.uz/api/support/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Muvaffaqiyat!",
          description: "Xabaringiz muvaffaqiyatli yuborildi. Tez orada siz bilan bog'lanamiz.",
        })

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
      } else {
        toast({
          title: "Xatolik!",
          description: data.message || "Xabarni yuborishda xatolik yuz berdi.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Xabarni yuborishda xatolik:", error)
      toast({
        title: "Xatolik!",
        description: "Server bilan bog'lanishda xatolik yuz berdi.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bizga Xabar Yuboring</CardTitle>
        <CardDescription>
          Savollaringiz yoki takliflaringiz bo'lsa, quyidagi formani to'ldiring. Biz tez orada javob beramiz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ism Familiya *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon raqam</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => updateFormData("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Mavzu *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => updateFormData("subject", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Xabar *</Label>
            <Textarea
              id="message"
              placeholder="Xabaringizni yozing..."
              value={formData.message}
              onChange={(e) => updateFormData("message", e.target.value)}
              required
              rows={5}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Yuborilmoqda..." : "Xabar Yuborish"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
