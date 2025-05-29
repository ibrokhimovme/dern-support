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
import { Plus, Edit, Trash2, Package, AlertTriangle, Search } from "lucide-react"

interface InventoryItem {
  _id: string
  name: string
  description: string
  category: string
  brand: string
  model: string
  specifications?: string
  quantity: number
  minQuantity: number
  unitPrice: number
  totalValue: number
  location: string
  condition: string
  supplier?: string
  purchaseDate?: string
  warrantyExpiry?: string
  notes?: string
  isActive: boolean
  createdBy: {
    firstName?: string
    lastName?: string
  }
  createdAt: string
  updatedAt: string
}

interface Category {
  value: string
  label: string
}

const conditionLabels: Record<string, string> = {
  new: "Yangi",
  used: "Ishlatilgan",
  refurbished: "Ta'mirlangan",
  damaged: "Buzilgan",
}

const conditionColors: Record<string, string> = {
  new: "bg-green-100 text-green-800",
  used: "bg-blue-100 text-blue-800",
  refurbished: "bg-yellow-100 text-yellow-800",
  damaged: "bg-red-100 text-red-800",
}

export function InventoryManager() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showLowStock, setShowLowStock] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    model: "",
    specifications: "",
    quantity: "",
    minQuantity: "",
    unitPrice: "",
    location: "Asosiy ombor",
    condition: "new",
    supplier: "",
    purchaseDate: "",
    warrantyExpiry: "",
    notes: "",
  })

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [searchTerm, categoryFilter, showLowStock])

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (categoryFilter) params.append("category", categoryFilter)
      if (showLowStock) params.append("lowStock", "true")

      const response = await fetch(`http://localhost:5000/api/inventory?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setItems(data.items)
      }
    } catch (error) {
      console.error("Inventarni yuklashda xatolik:", error)
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/inventory/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Kategoriyalarni yuklashda xatolik:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      brand: "",
      model: "",
      specifications: "",
      quantity: "",
      minQuantity: "",
      unitPrice: "",
      location: "Asosiy ombor",
      condition: "new",
      supplier: "",
      purchaseDate: "",
      warrantyExpiry: "",
      notes: "",
    })
    setEditingItem(null)
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      brand: item.brand,
      model: item.model,
      specifications: item.specifications || "",
      quantity: item.quantity.toString(),
      minQuantity: item.minQuantity.toString(),
      unitPrice: item.unitPrice.toString(),
      location: item.location,
      condition: item.condition,
      supplier: item.supplier || "",
      purchaseDate: item.purchaseDate ? item.purchaseDate.split("T")[0] : "",
      warrantyExpiry: item.warrantyExpiry ? item.warrantyExpiry.split("T")[0] : "",
      notes: item.notes || "",
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
      const url = editingItem
        ? `http://localhost:5000/api/inventory/${editingItem._id}`
        : "http://localhost:5000/api/inventory"

      const method = editingItem ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          quantity: Number.parseInt(formData.quantity),
          minQuantity: Number.parseInt(formData.minQuantity),
          unitPrice: Number.parseFloat(formData.unitPrice),
          purchaseDate: formData.purchaseDate || undefined,
          warrantyExpiry: formData.warrantyExpiry || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Muvaffaqiyat!",
          description: editingItem ? "Ehtiyot qism yangilandi" : "Yangi ehtiyot qism qo'shildi",
        })
        fetchItems()
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
      console.error("Ehtiyot qismni saqlashda xatolik:", error)
      toast({
        title: "Xatolik!",
        description: "Server bilan bog'lanishda xatolik yuz berdi",
        variant: "destructive",
      })
    }

    setSaving(false)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Haqiqatan ham bu ehtiyot qismni o'chirmoqchimisiz?")) {
      return
    }

    setDeleting(itemId)

    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Muvaffaqiyat!",
          description: "Ehtiyot qism o'chirildi",
        })
        fetchItems()
      } else {
        toast({
          title: "Xatolik!",
          description: data.message || "O'chirishda xatolik yuz berdi",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Ehtiyot qismni o'chirishda xatolik:", error)
      toast({
        title: "Xatolik!",
        description: "Server bilan bog'lanishda xatolik yuz berdi",
        variant: "destructive",
      })
    }

    setDeleting(null)
  }

  const updateFormData = (field: string, value: string) => {
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
              <CardTitle>Ehtiyot Qismlar Boshqaruvi</CardTitle>
              <CardDescription>Inventar va ehtiyot qismlarni boshqaring</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yangi Qism Qo'shish
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Ehtiyot Qismni Tahrirlash" : "Yangi Ehtiyot Qism"}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Mavjud ehtiyot qismni tahrirlang" : "Yangi ehtiyot qism qo'shing"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="category">Kategoriya *</Label>
                      <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategoriyani tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                      <Label htmlFor="brand">Brend *</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => updateFormData("brand", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => updateFormData("model", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specifications">Texnik xususiyatlar</Label>
                    <Textarea
                      id="specifications"
                      value={formData.specifications}
                      onChange={(e) => updateFormData("specifications", e.target.value)}
                      placeholder="Masalan: 16GB DDR4 3200MHz"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Miqdor *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => updateFormData("quantity", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minQuantity">Min. miqdor *</Label>
                      <Input
                        id="minQuantity"
                        type="number"
                        value={formData.minQuantity}
                        onChange={(e) => updateFormData("minQuantity", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice">Narx (so'm) *</Label>
                      <Input
                        id="unitPrice"
                        type="number"
                        value={formData.unitPrice}
                        onChange={(e) => updateFormData("unitPrice", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Joylashuv</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => updateFormData("location", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Holat</Label>
                      <Select value={formData.condition} onValueChange={(value) => updateFormData("condition", value)}>
                        <SelectTrigger>
                          <SelectValue>{conditionLabels[formData.condition]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(conditionLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Ta'minotchi</Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => updateFormData("supplier", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchaseDate">Sotib olingan sana</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => updateFormData("purchaseDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warrantyExpiry">Kafolat tugash sanasi</Label>
                      <Input
                        id="warrantyExpiry"
                        type="date"
                        value={formData.warrantyExpiry}
                        onChange={(e) => updateFormData("warrantyExpiry", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Izohlar</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => updateFormData("notes", e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Bekor qilish
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saqlanmoqda..." : editingItem ? "Yangilash" : "Qo'shish"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Kategoriya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha kategoriyalar</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
              className="w-full sm:w-auto"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Kam qolganlar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item._id} className={item.quantity <= item.minQuantity ? "border-orange-200" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>
                    {item.brand} {item.model}
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item._id)}
                    disabled={deleting === item._id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{item.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {item.quantity} dona
                      {item.quantity <= item.minQuantity && (
                        <AlertTriangle className="h-4 w-4 text-orange-500 inline ml-1" />
                      )}
                    </span>
                  </div>
                  <Badge className={conditionColors[item.condition]}>{conditionLabels[item.condition]}</Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Narx:</span>
                    <span className="font-medium">{item.unitPrice.toLocaleString()} so'm</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Umumiy qiymat:</span>
                    <span className="font-medium">{item.totalValue.toLocaleString()} so'm</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Joylashuv:</span>
                    <span>{item.location}</span>
                  </div>
                </div>

                {item.specifications && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">{item.specifications}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Hali ehtiyot qismlar qo'shilmagan.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
