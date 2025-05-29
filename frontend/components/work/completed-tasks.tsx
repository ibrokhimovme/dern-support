"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { Calendar, MapPin, Phone, User, Clock, CheckCircle } from "lucide-react"

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
  fixedPrice: number
  managerNotes?: string
  masterNotes?: string
  createdAt: string
  updatedAt: string
}

const deviceTypeLabels: Record<string, string> = {
  desktop: "Stol kompyuteri",
  laptop: "Noutbuk",
  server: "Server",
  other: "Boshqa",
}

export function CompletedTasks() {
  const { token } = useAuth()
  const [tasks, setTasks] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompletedTasks()
  }, [])

  const fetchCompletedTasks = async () => {
    try {
      const response = await fetch("https://digus.uz/api/services/completed-by-me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setTasks(data.requests)
      }
    } catch (error) {
      console.error("Tugallangan ishlarni yuklashda xatolik:", error)
    }
    setLoading(false)
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

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tugallangan Ishlar</CardTitle>
          <CardDescription>Siz tomonidan tugallangan ishlar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Hali tugallangan ishlar yo'q.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tugallangan Ishlar</CardTitle>
          <CardDescription>Siz tomonidan muvaffaqiyatli tugallangan ishlar tarixi</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{task.serviceType.name}</CardTitle>
                  <CardDescription>
                    {task.user.firstName || task.user.companyName} - {deviceTypeLabels[task.deviceType]}
                  </CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Tugallangan
                </Badge>
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
                      <span className="text-sm">{task.user.firstName || task.user.companyName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{task.user.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {task.city}, {task.address}
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
                        {new Date(task.preferredDate).toLocaleDateString("uz-UZ")} - {task.preferredTime}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Tugallangan: {new Date(task.updatedAt).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Narx: </span>
                      <span className="text-sm">{task.fixedPrice.toLocaleString()} so'm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <h4 className="font-medium mb-2">Muammo tavsifi:</h4>
                <p className="text-muted-foreground text-sm">{task.problemDescription}</p>
              </div>

              {/* Manager Notes */}
              {task.managerNotes && (
                <div>
                  <h4 className="font-medium mb-2">Manager izohi:</h4>
                  <p className="text-muted-foreground text-sm">{task.managerNotes}</p>
                </div>
              )}

              {/* Master Notes */}
              {task.masterNotes && (
                <div>
                  <h4 className="font-medium mb-2">Usta izohi:</h4>
                  <p className="text-muted-foreground text-sm">{task.masterNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
