"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, MapPin, Calendar, Search } from "lucide-react"

interface UserData {
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

const roleLabels: Record<string, string> = {
  user: "Foydalanuvchi",
  master: "Usta",
  manager: "Manager",
}

const roleColors: Record<string, string> = {
  user: "bg-blue-100 text-blue-800",
  master: "bg-green-100 text-green-800",
  manager: "bg-purple-100 text-purple-800",
}

export function UsersManager() {
  const { token, user: currentUser, updateUser } = useAuth() // updateUser qo'shamiz
  const { toast } = useToast()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Foydalanuvchilarni yuklashda xatolik:", error)
    }
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId)

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Muvaffaqiyat!",
          description: "Foydalanuvchi roli yangilandi.",
        })

        // Agar o'zgartirilayotgan user joriy user bo'lsa, localStorage ni yangilash
        if (currentUser && currentUser.id === userId) {
          const updatedCurrentUser = {
            ...currentUser,
            role: newRole as "user" | "master" | "manager",
          }
          updateUser(updatedCurrentUser)
        }

        fetchUsers()
      } else {
        toast({
          title: "Xatolik!",
          description: data.message || "Rolni yangilashda xatolik yuz berdi.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Rolni yangilashda xatolik:", error)
      toast({
        title: "Xatolik!",
        description: "Server bilan bog'lanishda xatolik yuz berdi.",
        variant: "destructive",
      })
    }

    setUpdatingId(null)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) ??
      false

    const matchesRole = roleFilter === "" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
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
          <CardTitle>Foydalanuvchilar</CardTitle>
          <CardDescription>Barcha foydalanuvchilarni boshqaring va rollarini o'zgartiring</CardDescription>
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Rolni tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha rollar</SelectItem>
                <SelectItem value="user">Foydalanuvchi</SelectItem>
                <SelectItem value="master">Usta</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user._id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  {/* User Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {user.firstName ? `${user.firstName} ${user.lastName}` : user.companyName || "Noma'lum"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {user.userType === "individual" ? "Jismoniy shaxs" : "Yuridik shaxs"}
                      </p>
                    </div>
                    <Badge className={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {user.city}, {user.address}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Ro'yxatdan o'tgan: {new Date(user.createdAt).toLocaleDateString("uz-UZ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Legal Entity Info */}
                  {user.userType === "legal" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <span className="text-sm font-medium">INN: </span>
                        <span className="text-sm text-muted-foreground">{user.inn}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Kontakt shaxs: </span>
                        <span className="text-sm text-muted-foreground">{user.contactPerson}</span>
                      </div>
                      {user.website && (
                        <div>
                          <span className="text-sm font-medium">Veb-sayt: </span>
                          <span className="text-sm text-muted-foreground">{user.website}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Role Management */}
                  <div className="flex items-center space-x-4 pt-4 border-t">
                    <span className="text-sm font-medium">Rolni o'zgartirish:</span>
                    <Select
                      value={user.role}
                      onValueChange={(newRole) => handleRoleChange(user._id, newRole)}
                      disabled={updatingId === user._id}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Foydalanuvchi</SelectItem>
                        <SelectItem value="master">Usta</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    {updatingId === user._id && <span className="text-sm text-muted-foreground">Yangilanmoqda...</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Hech qanday foydalanuvchi topilmadi.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
