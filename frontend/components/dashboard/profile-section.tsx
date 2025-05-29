"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Edit, Save, X } from "lucide-react"

interface UserProfile {
  _id: string
  userType: "individual" | "legal"
  role: string
  email: string
  phone: string
  address: string
  city: string
  firstName?: string
  lastName?: string
  companyName?: string
  inn?: string
  contactPerson?: string
  website?: string
  createdAt: string
}

export function ProfileSection() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState<Partial<UserProfile>>({})

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (response.ok) {
          setProfile(data.user)
          setEditData(data.user)
        }
      } catch (error) {
        console.error("Profil ma'lumotlarini yuklashda xatolik:", error)
      }
      setLoading(false)
    }

    if (token) {
      fetchProfile()
    }
  }, [token])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("http://localhost:5000/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      })

      const data = await response.json()
      if (response.ok) {
        setProfile(data.user)
        setEditing(false)
        toast({
          title: "Muvaffaqiyat!",
          description: "Profil ma'lumotlari yangilandi.",
        })
      } else {
        toast({
          title: "Xatolik!",
          description: data.message || "Ma'lumotlarni yangilashda xatolik yuz berdi.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Profilni yangilashda xatolik:", error)
      toast({
        title: "Xatolik!",
        description: "Server bilan bog'lanishda xatolik yuz berdi.",
        variant: "destructive",
      })
    }
    setSaving(false)
  }

  const handleCancel = () => {
    setEditData(profile || {})
    setEditing(false)
  }

  const updateEditData = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Profil ma'lumotlarini yuklashda xatolik yuz berdi.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Shaxsiy Ma'lumotlar</CardTitle>
            <CardDescription>Sizning account ma'lumotlaringiz</CardDescription>
          </div>
          <div className="flex space-x-2">
            {editing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Bekor qilish
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-1" />
                Tahrirlash
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Foydalanuvchi turi</Label>
            <Input value={profile.userType === "individual" ? "Jismoniy shaxs" : "Yuridik shaxs"} disabled />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Input
              value={
                profile.role === "user"
                  ? "Foydalanuvchi"
                  : profile.role === "master"
                    ? "Usta"
                    : profile.role === "manager"
                      ? "Manager"
                      : profile.role
              }
              disabled
            />
          </div>
        </div>

        {/* Personal/Company Info */}
        {profile.userType === "individual" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ism</Label>
              <Input
                id="firstName"
                value={editing ? editData.firstName || "" : profile.firstName || ""}
                onChange={(e) => updateEditData("firstName", e.target.value)}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Familiya</Label>
              <Input
                id="lastName"
                value={editing ? editData.lastName || "" : profile.lastName || ""}
                onChange={(e) => updateEditData("lastName", e.target.value)}
                disabled={!editing}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Kompaniya nomi</Label>
                <Input
                  id="companyName"
                  value={editing ? editData.companyName || "" : profile.companyName || ""}
                  onChange={(e) => updateEditData("companyName", e.target.value)}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inn">INN</Label>
                <Input
                  id="inn"
                  value={editing ? editData.inn || "" : profile.inn || ""}
                  onChange={(e) => updateEditData("inn", e.target.value)}
                  disabled={!editing}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Kontakt shaxs</Label>
                <Input
                  id="contactPerson"
                  value={editing ? editData.contactPerson || "" : profile.contactPerson || ""}
                  onChange={(e) => updateEditData("contactPerson", e.target.value)}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Veb-sayt</Label>
                <Input
                  id="website"
                  value={editing ? editData.website || "" : profile.website || ""}
                  onChange={(e) => updateEditData("website", e.target.value)}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={editing ? editData.email || "" : profile.email}
              onChange={(e) => updateEditData("email", e.target.value)}
              disabled={!editing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon raqam</Label>
            <Input
              id="phone"
              value={editing ? editData.phone || "" : profile.phone}
              onChange={(e) => updateEditData("phone", e.target.value)}
              disabled={!editing}
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Shahar</Label>
            <Input
              id="city"
              value={editing ? editData.city || "" : profile.city}
              onChange={(e) => updateEditData("city", e.target.value)}
              disabled={!editing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Manzil</Label>
            <Input
              id="address"
              value={editing ? editData.address || "" : profile.address}
              onChange={(e) => updateEditData("address", e.target.value)}
              disabled={!editing}
            />
          </div>
        </div>

        {/* Account Info */}
        <div className="pt-4 border-t">
          <div className="space-y-2">
            <Label>Ro'yxatdan o'tgan sana</Label>
            <Input value={new Date(profile.createdAt).toLocaleDateString("uz-UZ")} disabled />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
