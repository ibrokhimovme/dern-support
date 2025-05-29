"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, User, Clock, MessageSquare } from "lucide-react"

interface SupportRequest {
  _id: string
  user?: {
    firstName?: string
    lastName?: string
    companyName?: string
  }
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: string
  priority: string
  assignedTo?: {
    firstName?: string
    lastName?: string
  }
  adminResponse?: string
  createdAt: string
  updatedAt: string
}

const statusLabels: Record<string, string> = {
  open: "Ochiq",
  in_progress: "Jarayonda",
  resolved: "Hal qilingan",
  closed: "Yopiq",
}

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
}

const priorityLabels: Record<string, string> = {
  low: "Past",
  medium: "O'rta",
  high: "Yuqori",
  urgent: "Shoshilinch",
}

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

export function SupportRequestsManager() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [requests, setRequests] = useState<SupportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [adminResponse, setAdminResponse] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedPriority, setSelectedPriority] = useState("")

  useEffect(() => {
    fetchSupportRequests()
  }, [])

  const fetchSupportRequests = async () => {
    try {
      const response = await fetch("https://digus.uz/api/support/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setRequests(data.requests)
      }
    } catch (error) {
      console.error("Support so'rovlarini yuklashda xatolik:", error)
    }
    setLoading(false)
  }

  // handleUpdateRequest funksiyasini soddalashtiramiz
  const handleUpdateRequest = async (requestId: string) => {
    if (!selectedStatus) {
      toast({
        title: "Xatolik!",
        description: "Holatni tanlang.",
        variant: "destructive",
      })
      return
    }

    setUpdatingId(requestId)

    try {
      const response = await fetch(`https://digus.uz/api/support/requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: selectedStatus,
          priority: selectedPriority || "medium",
        }),
      })

      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Muvaffaqiyat!",
          description: "Support so'rovi yangilandi.",
        })
        fetchSupportRequests()
        setSelectedStatus("")
        setSelectedPriority("")
      } else {
        toast({
          title: "Xatolik!",
          description: data.message || "So'rovni yangilashda xatolik yuz berdi.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Support so'rovini yangilashda xatolik:", error)
      toast({
        title: "Xatolik!",
        description: "Server bilan bog'lanishda xatolik yuz berdi.",
        variant: "destructive",
      })
    }

    setUpdatingId(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
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
          <CardTitle>Support So'rovlari</CardTitle>
          <CardDescription>Mijozlardan kelgan support so'rovlarini boshqaring</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{request.subject}</CardTitle>
                  <CardDescription>
                    {request.name} - {request.email}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge className={statusColors[request.status]}>{statusLabels[request.status]}</Badge>
                  <Badge className={priorityColors[request.priority]}>{priorityLabels[request.priority]}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{request.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{request.email}</span>
                  </div>
                  {request.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.phone}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Yuborilgan: {new Date(request.createdAt).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>
                  {request.user && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Ro'yxatdan o'tgan: {request.user.firstName || request.user.companyName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <h4 className="font-medium mb-2">Xabar:</h4>
                <p className="text-muted-foreground text-sm bg-muted p-3 rounded">{request.message}</p>
              </div>

              {/* Admin Response */}
              {request.adminResponse && (
                <div>
                  <h4 className="font-medium mb-2">Admin javobi:</h4>
                  <p className="text-muted-foreground text-sm bg-primary/5 p-3 rounded">{request.adminResponse}</p>
                </div>
              )}

              {/* Response Section */}
              {request.status !== "closed" && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Holatni yangilash:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Holat</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Holatni tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_progress">Jarayonda</SelectItem>
                          <SelectItem value="resolved">Hal qilingan</SelectItem>
                          <SelectItem value="closed">Yopiq</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Muhimlik darajasi</Label>
                      <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                        <SelectTrigger>
                          <SelectValue placeholder="Muhimlik darajasini tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Past</SelectItem>
                          <SelectItem value="medium">O'rta</SelectItem>
                          <SelectItem value="high">Yuqori</SelectItem>
                          <SelectItem value="urgent">Shoshilinch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => handleUpdateRequest(request._id)}
                    disabled={updatingId === request._id}
                  >
                    {updatingId === request._id ? "Yangilanmoqda..." : "Holatni Yangilash"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Hali support so'rovlari yo'q.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
