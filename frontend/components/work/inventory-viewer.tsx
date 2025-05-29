"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Package, AlertTriangle, Search, Minus } from "lucide-react"

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
  createdAt: string
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

export function InventoryViewer() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [useDialogOpen, setUseDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [using, setUsing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showLowStock, setShowLowStock] = useState(false)

  const [useFormData, setUseFormData] = useState({
    quantityUsed: "",
    usageType: "service",
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

  const openUseDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setUseFormData({
      quantityUsed: "",
      usageType: "service",
      notes: "",
    })
    setUseDialogOpen(true)
  }

  const handleUseItem = async () => {
    if (!selectedItem) return

    setUsing(true)

    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${selectedItem._id}/use`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantityUsed: Number.parseInt(useFormData.quantityUsed),
          usageType: useFormData.usageType,
          notes: useFormData.notes,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Muvaffaqiyat!",
          description: "Ehtiyot qism muvaffaqiyatli ishlatildi",
        })
        fetchItems()
        setUseDialogOpen(false)
        setSelectedItem(null)
      } else {
        toast({
          title: "Xatolik!",
          description: data.message || "Ehtiyot qismni ishlatishda xatolik yuz berdi",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Ehtiyot qismni ishlatishda xatolik:", error)
      toast({
        title: "Xatolik!",
        description: "Server bilan bog'lanishda xatolik yuz berdi",
        variant: "destructive",
      })
    }

    setUsing(false)
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
          <CardTitle>Ehtiyot Qismlar</CardTitle>
          <CardDescription>Mavjud ehtiyot qismlarni ko'ring va ishlatishingiz mumkin</CardDescription>
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
                <Button variant="outline" size="sm" onClick={() => openUseDialog(item)} disabled={item.quantity === 0}>
                  <Minus className="h-4 w-4 mr-1" />
                  Ishlatish
                </Button>
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
                    <span>Joylashuv:</span>
                    <span>{item.location}</span>
                  </div>
                  {item.quantity <= item.minQuantity && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      ⚠️ Kam qoldi! Minimum: {item.minQuantity} dona
                    </div>
                  )}
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
              <p className="text-muted-foreground">Hech qanday ehtiyot qism topilmadi.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Use Item Dialog */}
      <Dialog open={useDialogOpen} onOpenChange={setUseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ehtiyot Qismni Ishlatish</DialogTitle>
            <DialogDescription>
              {selectedItem && `${selectedItem.name} (${selectedItem.brand} ${selectedItem.model})`}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded">
                <div className="flex justify-between text-sm">
                  <span>Mavjud miqdor:</span>
                  <span className="font-medium">{selectedItem.quantity} dona</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantityUsed">Ishlatilgan miqdor *</Label>
                <Input
                  id="quantityUsed"
                  type="number"
                  min="1"
                  max={selectedItem.quantity}
                  value={useFormData.quantityUsed}
                  onChange={(e) => setUseFormData((prev) => ({ ...prev, quantityUsed: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageType">Ishlatish turi</Label>
                <Select
                  value={useFormData.usageType}
                  onValueChange={(value) => setUseFormData((prev) => ({ ...prev, usageType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={useFormData.usageType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Xizmat ko'rsatish</SelectItem>
                    <SelectItem value="repair">Ta'mirlash</SelectItem>
                    <SelectItem value="replacement">Almashtirish</SelectItem>
                    <SelectItem value="testing">Test qilish</SelectItem>
                    <SelectItem value="other">Boshqa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Izoh</Label>
                <Input
                  id="notes"
                  value={useFormData.notes}
                  onChange={(e) => setUseFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Qayerda ishlatilgani haqida izoh..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setUseDialogOpen(false)}>
                  Bekor qilish
                </Button>
                <Button onClick={handleUseItem} disabled={using || !useFormData.quantityUsed}>
                  {using ? "Ishlatilmoqda..." : "Ishlatish"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
