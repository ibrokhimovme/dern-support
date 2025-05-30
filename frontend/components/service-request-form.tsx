"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { uz } from "date-fns/locale"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ServiceType {
  _id: string
  name: string
  description: string
  basePrice: number
  estimatedDuration: string
}

export function ServiceRequestForm() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [accountInfo, setAccountInfo] = useState<{
    email: string
    password: string
    autoCreated: boolean
  } | null>(null)

  const [formData, setFormData] = useState({
    serviceType: "",
    deviceType: "",
    problemDescription: "",
    city: "",
    address: "",
    preferredTime: "",
    contactMethod: "",
    additionalInfo: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    fetch("https://digus.uz/api/services/types")
      .then((res) => res.json())
      .then((data) => setServiceTypes(data.serviceTypes || []))
      .catch((err) => console.error("Xizmat turlarini yuklashda xatolik:", err))
  }, [])

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }))

      fetch("https://digus.uz/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setFormData((prev) => ({
              ...prev,
              phone: data.user.phone || "",
              city: data.user.city || "",
              address: data.user.address || "",
            }))
          }
        })
        .catch((err) => console.error("Profil yuklashda xatolik:", err))
    }
  }, [user, token])

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!agreed && !user) {
      toast({
        title: "Rozilik talab qilinadi",
        description: "Iltimos, maxfiylik siyosatiga rozilik bildiring.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const requestData = {
        ...formData,
        preferredDate: selectedDate?.toISOString(),
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch("https://digus.uz/api/services/request", {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
      })

      const data = await response.json()
      console.log("🚀 Serverdan olingan data:", data)

      if (response.ok) {
        if (data.generatedPassword || data.autoCreatedAccount) {
          setAccountInfo({
            email: formData.email,
            password: data.generatedPassword ?? "(parol yuborilmagan)",
            autoCreated: true,
          })
          setShowAccountModal(true)
        } else {
          toast({
            title: "Muvaffaqiyat!",
            description: "Xizmat so'rovi muvaffaqiyatli yuborildi.",
          })
        }

        setFormData({
          serviceType: "",
          deviceType: "",
          problemDescription: "",
          city: user ? formData.city : "",
          address: user ? formData.address : "",
          preferredTime: "",
          contactMethod: "",
          additionalInfo: "",
          firstName: user ? formData.firstName : "",
          lastName: user ? formData.lastName : "",
          email: user ? formData.email : "",
          phone: user ? formData.phone : "",
        })
        setSelectedDate(undefined)
        setAgreed(false)
      } else {
        toast({
          title: "Xatolik!",
          description: data.message || "So'rov yuborilmadi",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Xatolik!",
        description: "Server bilan bog'lanishda muammo",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Xizmat So'rovi Formi</CardTitle>
          <CardDescription>
            {user
              ? "Sizning ma'lumotlaringiz avtomatik to'ldirildi. Qolgan maydonlarni to'ldiring."
              : "Barcha maydonlarni to'ldiring. Agar accountingiz yo'q bo'lsa, avtomatik yaratiladi."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="serviceType">Xizmat turi *</Label>
              <Select value={formData.serviceType} onValueChange={(value) => updateFormData("serviceType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Xizmat turini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service._id} value={service._id}>
                      {service.name} - {service.basePrice.toLocaleString()} so'm
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Device Type */}
            <div className="space-y-3">
              <Label>Qurilma turi *</Label>
              <RadioGroup value={formData.deviceType} onValueChange={(value) => updateFormData("deviceType", value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="desktop" id="desktop" />
                  <Label htmlFor="desktop">Stol kompyuteri</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="laptop" id="laptop" />
                  <Label htmlFor="laptop">Noutbuk</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="server" id="server" />
                  <Label htmlFor="server">Server</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Boshqa</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Problem Description */}
            <div className="space-y-2">
              <Label htmlFor="problemDescription">Muammo tavsifi *</Label>
              <Textarea
                id="problemDescription"
                placeholder="Muammoni batafsil tasvirlab bering..."
                value={formData.problemDescription}
                onChange={(e) => updateFormData("problemDescription", e.target.value)}
                required
              />
            </div>

            {/* Personal Information (for guests or editable for users) */}
            {!user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ism *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Familiya *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  disabled={!!user}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon raqam *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  disabled={!!user}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Shahar *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  disabled={!!user}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Manzil *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  disabled={!!user}
                  required
                />
              </div>
            </div>

            {/* Preferred Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Afzal sana *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: uz }) : "Sanani tanlang"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Afzal vaqt *</Label>
                <Select
                  value={formData.preferredTime}
                  onValueChange={(value) => updateFormData("preferredTime", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vaqtni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00-12:00">09:00 - 12:00</SelectItem>
                    <SelectItem value="12:00-15:00">12:00 - 15:00</SelectItem>
                    <SelectItem value="15:00-18:00">15:00 - 18:00</SelectItem>
                    <SelectItem value="18:00-21:00">18:00 - 21:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Method */}
            <div className="space-y-3">
              <Label>Bog'lanish usuli *</Label>
              <RadioGroup
                value={formData.contactMethod}
                onValueChange={(value) => updateFormData("contactMethod", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone-contact" />
                  <Label htmlFor="phone-contact">Telefon orqali</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email-contact" />
                  <Label htmlFor="email-contact">Email orqali</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both-contact" />
                  <Label htmlFor="both-contact">Ikkalasi ham</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Qo'shimcha ma'lumot</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Qo'shimcha ma'lumot yoki izohlar..."
                value={formData.additionalInfo}
                onChange={(e) => updateFormData("additionalInfo", e.target.value)}
              />
            </div>

            {!user && (
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="privacy"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        required
                      />
                      <label htmlFor="privacy" className="text-sm">
                        Men
                        <button type="button" onClick={() => setShowPrivacy(true)} className="text-blue-600 underline mx-1">
                          Maxfiylik siyosati
                        </button>
                        bilan tanishdim va roziman
                      </label>
                    </div>
                  )}
            <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Maxfiylik siyosati</DialogTitle>
            <DialogDescription>
              Siz yuborayotgan ma'lumotlar faqat xizmat ko‘rsatish uchun ishlatiladi. Maxfiylikka qat’iy rioya qilinadi va uchinchi tomonlarga berilmaydi.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

        <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-green-600">✅ Hisob yaratildi!</DialogTitle>
              <DialogDescription>
                Quyidagi ma’lumotlar bilan tizimga kirishingiz mumkin:
              </DialogDescription>
            </DialogHeader>

            {accountInfo && (
              <div className="space-y-4">
                <div className="bg-card p-4 rounded border">
                  <p><strong>Email:</strong> {accountInfo.email}</p>
                  <p><strong>Parol:</strong> {accountInfo.password}</p>
                </div>
                <div className="text-xs text-yellow-800">
                  ⚠️ Bu ma’lumotlarni xavfsiz joyda saqlang. Parolni keyinroq o‘zgartirishingiz mumkin.
                </div>
                <Button onClick={() => setShowAccountModal(false)}>Tushunarli</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Yuborilmoqda..." : "Xizmat So'rovi Yuborish"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* Account Modal */}
      <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">✅ Xizmat so'rovi yuborildi!</DialogTitle>
            <DialogDescription>
              Sizning xizmat so'rovingiz muvaffaqiyatli yuborildi va tez orada siz bilan bog'lanamiz.
            </DialogDescription>
          </DialogHeader>

          {accountInfo?.autoCreated && (
            <div className="space-y-4">
              <div className="bg-card p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-green-600 mb-2">🎉 Sizga yangi account yaratildi!</h4>
                <p className="text-sm text-sm mb-3">
                  Yangiliklardan xabardor bo'lish va xizmat so'rovlaringizni kuzatish uchun quyidagi ma'lumotlar bilan
                  tizimga kirishingiz mumkin:
                </p>

                <div className="space-y-2">
                  <div className="bg-card p-3 rounded border">
                    <label className="text-xs font-medium text-gray-500">EMAIL:</label>
                    <p className="font-mono text-sm font-semibold">{accountInfo.email}</p>
                  </div>
                  <div className="bg-card p-3 rounded border">
                    <label className="text-xs font-medium text-gray-500">PAROL:</label>
                    <p className="font-mono text-sm font-semibold">{accountInfo.password}</p>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Bu ma'lumotlarni xavfsiz joyda saqlang! Parolni keyinroq o'zgartirishingiz mumkin.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAccountModal(false)} className="flex-1">
                  Keyinroq
                </Button>
              </div>
            </div>
          )}

          {!accountInfo?.autoCreated && (
            <div className="text-center">
              <Button onClick={() => setShowAccountModal(false)}>Yopish</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
