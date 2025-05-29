"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Phone, User, Clock } from "lucide-react"

interface ServiceRequest {
  _id: string
  user: {
    firstName?: string
    lastName?: string
    companyName?: string
    email: string
    phone: string
  }
  serviceType: {
    name: string
    description: string
    basePrice: number
  }
  deviceType: string
  problemDescription: string
  city: string
  address: string
  preferredDate: string
  preferredTime: string
  contactMethod: string
  additionalInfo?: string
  status: string
  assignedMaster?: {
    firstName?: string
    lastName?: string
    companyName?: string
  }
  fixedPrice: number
  managerNotes?: string
  masterNotes?: string
  createdAt: string
}

interface Master {
  _id: string
  firstName?: string
  lastName?: string
  companyName?: string
  email: string
  phone: string
}

const statusLabels: Record<string, string> = {
  pending: "Kutilmoqda",
  approved: "Tasdiqlangan",
  assigned: "Usta tayinlangan",
  in_progress: "Jarayonda",
  completed: "Tugallangan",
  cancelled: "Bekor qilingan",
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  assigned: "bg-purple-100 text-purple-800",
  in_progress: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const deviceTypeLabels: Record<string, string> = {
  desktop: "Stol kompyuteri",
  laptop: "Noutbuk",
  server: "Server",
  other: "Boshqa",
}

export function ServiceRequestsManager() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [masters, setMasters] = useState<Master[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [selectedMaster, setSelectedMaster] = useState("")
  const [managerNotes, setManagerNotes] = useState("")

  useEffect(() => {
    fetchRequests()
    fetchMasters()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("https://digus.uz/api/services/all-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setRequests(data.requests)
      }
    } catch (error) {
      console.error("So'rovlarni yuklashda xatolik:", error)
    }
    setLoading(false)
  }

  const fetchMasters = async () => {
    try {
      const response = await fetch("https://digus.uz/api/masters", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setMasters(data.masters)
      }
    } catch (error) {
      console.error("Ustalarni yuklashda xatolik:", error)
    }
  }

  const handleAssignMaster = async (requestId: string) => {
    if (!selectedMaster) {
      toast({
        title: "Xatolik!",
        description: "Ustani tanlang.",
        variant: "destructive",
      })
      return
    }

    setAssigningId(requestId)

    try {
      const response = await fetch(`https://digus.uz/api/services/requests/${requestId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignedMaster: selectedMaster,
          managerNotes,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Muvaffaqiyat!",
          description: "Usta muvaffaqiyatli tayinlandi.",
        })
        fetchRequests()
        setSelectedMaster("")
        setManagerNotes("")
      } else {
        toast({
          title: "Xatolik!",
          description: data.message || "Usta tayinlashda xatolik yuz berdi.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Usta tayinlashda xatolik:", error)
      toast({
        title: "Xatolik!",
        description: "Server bilan bog'lanishda xatolik yuz berdi.",
        variant: "destructive",
      })
    }

    setAssigningId(null)
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
          <CardTitle>Xizmat So'rovlari</CardTitle>
          <CardDescription>Barcha xizmat so'rovlarini boshqaring va ustalar tayinlang</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{request.serviceType.name}</CardTitle>
                  <CardDescription>
                    {request.user.firstName || request.user.companyName} - {deviceTypeLabels[request.deviceType]}
                  </CardDescription>
                </div>
                <Badge className={statusColors[request.status]}>{statusLabels[request.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Mijoz ma'lumotlari:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.user.firstName || request.user.companyName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.user.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {request.city}, {request.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Xizmat ma'lumotlari:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(request.preferredDate).toLocaleDateString("uz-UZ")} - {request.preferredTime}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Yuborilgan: {new Date(request.createdAt).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Narx: </span>
                      <span className="text-sm">{request.fixedPrice.toLocaleString()} so'm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <h4 className="font-medium mb-2">Muammo tavsifi:</h4>
                <p className="text-muted-foreground text-sm">{request.problemDescription}</p>
              </div>

              {/* Additional Info */}
              {request.additionalInfo && (
                <div>
                  <h4 className="font-medium mb-2">Qo'shimcha ma'lumot:</h4>
                  <p className="text-muted-foreground text-sm">{request.additionalInfo}</p>
                </div>
              )}

              {/* Assigned Master */}
              {request.assignedMaster && (
                <div>
                  <h4 className="font-medium mb-2">Tayinlangan usta:</h4>
                  <p className="text-muted-foreground text-sm">
                    {request.assignedMaster.firstName || request.assignedMaster.companyName}
                  </p>
                </div>
              )}

              {/* Manager Notes */}
              {request.managerNotes && (
                <div>
                  <h4 className="font-medium mb-2">Manager izohi:</h4>
                  <p className="text-muted-foreground text-sm">{request.managerNotes}</p>
                </div>
              )}

              {/* Master Notes */}
              {request.masterNotes && (
                <div>
                  <h4 className="font-medium mb-2">Usta izohi:</h4>
                  <p className="text-muted-foreground text-sm">{request.masterNotes}</p>
                </div>
              )}

              {/* Assign Master Section */}
              {request.status === "pending" && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Usta tayinlash:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ustani tanlang</Label>
                      <Select value={selectedMaster} onValueChange={setSelectedMaster}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ustani tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {masters.map((master) => (
                            <SelectItem key={master._id} value={master._id}>
                              {master.firstName || master.companyName} - {master.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Manager izohi</Label>
                      <Textarea
                        placeholder="Izoh yozing..."
                        value={managerNotes}
                        onChange={(e) => setManagerNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => handleAssignMaster(request._id)}
                    disabled={assigningId === request._id}
                  >
                    {assigningId === request._id ? "Tayinlanmoqda..." : "Usta Tayinlash"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
