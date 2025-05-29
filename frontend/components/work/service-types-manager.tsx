"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, DollarSign, Clock } from "lucide-react"

interface ServiceType {
  _id: string
  name: string
  description: string
  basePrice: number
  estimatedDuration: string
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const categoryLabels: Record<string, string> = {
  hardware: "Hardware",
  software: "Dasturiy ta'minot",
  network: "Tarmoq",
  security: "Xavfsizlik",
  maintenance: "Texnik xizmat",
  other: "Boshqa",
}

export function ServiceTypesManager() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<ServiceType | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    estimatedDuration: "",
    category: "other",
    isActive: true,
  })

  useEffect(() => {
    fetchServiceTypes()
  }, [])

  const fetchServiceTypes = async () => {
    try {
      const response = await fetch("https://digus.uz/api/services/admin/types", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setServiceTypes(data.serviceTypes)
      }
    } catch (error) {
      console.error("Service types ni yuklashda xatolik:", error)
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      basePrice: "",
      estimatedDuration: "",
      category: "other",
      isActive: true,
    })
    setEditingType(null)
  }

  const openEditDialog = (serviceType: ServiceType) => {
    setEditingType(serviceType)
    setFormData({
      name: serviceType.name,
      description: serviceType.description,
      basePrice: serviceType.basePrice.toString(),
      estimatedDuration: serviceType.estimatedDuration,
      category: serviceType.category,
      isActive: serviceType.isActive,
    })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingType
        ? `https://digus.uz/api/services/types/${editingType._id}`
        : "https://digus.uz/api/services/types"

      const method = editingType ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          basePrice: Number.parseInt(formData.basePrice),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Muvaffaqiyat!",
          description: editingType ? "Service type yangilandi" : "Yangi service type qo'shildi",
        })
        fetchServiceTypes()
        setDialogOpen(false)
        resetForm()
      } else {
        toast({
          title: "Xatolik!",
          description: data.message || "Xatolik yuz berdi",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Service type ni saqlashda xatolik:", error)
      toast({
        title: "Xatolik!",
        description: "Server bilan bog'lanishda xatolik yuz berdi",
        variant: "destructive",
      })
    }

    setSaving(false)
  }

  const handleDelete = async (typeId: string) => {
    if (!confirm("Haqiqatan ham bu service type ni o'chirmoqchimisiz?")) {
      return
    }

    setDeleting(typeId)

    try {
      const response = await fetch(`https://digus.uz/api/services/types/${typeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Muvaffaqiyat!",
          description: data.message,
        })
        fetchServiceTypes()
      } else {
        toast({
          title: "Xatolik!",
          description: data.message || "O'chirishda xatolik yuz berdi",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Service type ni o'chirishda xatolik:", error)
      toast({
        title: "Xatolik!",
        description: "Server bilan bog'lanishda xatolik yuz berdi",
        variant: "destructive",
      })
    }

    setDeleting(null)
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Xizmat Turlari</CardTitle>
              <CardDescription>Kompaniya xizmat turlarini boshqaring</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yangi Xizmat Turi
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingType ? "Xizmat Turini Tahrirlash" : "Yangi Xizmat Turi"}</DialogTitle>
                  <DialogDescription>
                    {editingType ? "Mavjud xizmat turini tahrirlang" : "Yangi xizmat turi qo'shing"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nomi *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Tavsif *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basePrice">Asosiy narx (so'm) *</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) => updateFormData("basePrice", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDuration">Taxminiy vaqt *</Label>
                      <Input
                        id="estimatedDuration"
                        placeholder="2-3 soat"
                        value={formData.estimatedDuration}
                        onChange={(e) => updateFormData("estimatedDuration", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Kategoriya *</Label>
                    <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => updateFormData("isActive", checked)}
                    />
                    <Label htmlFor="isActive">Faol</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Bekor qilish
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saqlanmoqda..." : editingType ? "Yangilash" : "Qo'shish"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceTypes.map((serviceType) => (
          <Card key={serviceType._id} className={!serviceType.isActive ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{serviceType.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{categoryLabels[serviceType.category]}</Badge>
                    <Badge variant={serviceType.isActive ? "default" : "secondary"}>
                      {serviceType.isActive ? "Faol" : "Faolsiz"}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(serviceType)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(serviceType._id)}
                    disabled={deleting === serviceType._id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{serviceType.description}</p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{serviceType.basePrice.toLocaleString()} so'm</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{serviceType.estimatedDuration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {serviceTypes.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Hali xizmat turlari qo'shilmagan.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
