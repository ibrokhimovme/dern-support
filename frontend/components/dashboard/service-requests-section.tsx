"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { Calendar, Clock, MapPin, Phone, Mail, User } from "lucide-react"

interface ServiceRequest {
  _id: string
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
  updatedAt: string
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

export function ServiceRequestsSection() {
  const { token } = useAuth()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("https://digus.uz/api/services/my-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (response.ok) {
          setRequests(data.requests)
        }
      } catch (error) {
        console.error("Xizmat so'rovlarini yuklashda xatolik:", error)
      }
      setLoading(false)
    }

    if (token) {
      fetchRequests()
    }
  }, [token])

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

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Xizmat So'rovlari</CardTitle>
          <CardDescription>Sizning yuborgan xizmat so'rovlaringiz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Hali xizmat so'rovi yubormagansiz.</p>
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
          <CardDescription>Sizning yuborgan xizmat so'rovlaringiz va ularning holati</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{request.serviceType.name}</CardTitle>
                  <CardDescription>{deviceTypeLabels[request.deviceType]}</CardDescription>
                </div>
                <Badge className={statusColors[request.status]}>{statusLabels[request.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Problem Description */}
              <div>
                <h4 className="font-medium mb-2">Muammo tavsifi:</h4>
                <p className="text-muted-foreground">{request.problemDescription}</p>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(request.preferredDate).toLocaleDateString("uz-UZ")} - {request.preferredTime}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {request.city}, {request.address}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {request.contactMethod === "phone" ? (
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    ) : request.contactMethod === "email" ? (
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      {request.contactMethod === "phone"
                        ? "Telefon orqali"
                        : request.contactMethod === "email"
                          ? "Email orqali"
                          : "Ikkalasi ham"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Narx: </span>
                    <span className="text-sm">{request.fixedPrice.toLocaleString()} so'm</span>
                  </div>
                  {request.assignedMaster && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Usta: {request.assignedMaster.firstName || request.assignedMaster.companyName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Yuborilgan: {new Date(request.createdAt).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {request.additionalInfo && (
                <div>
                  <h4 className="font-medium mb-2">Qo'shimcha ma'lumot:</h4>
                  <p className="text-muted-foreground text-sm">{request.additionalInfo}</p>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
