"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Phone, User } from "lucide-react"

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
  fixedPrice: number
  managerNotes?: string
  masterNotes?: string
  createdAt: string
}

const statusLabels: Record<string, string> = {
  assigned: "Tayinlangan",
  in_progress: "Jarayonda",
}

const statusColors: Record<string, string> = {
  assigned: "bg-purple-100 text-purple-800",
  in_progress: "bg-orange-100 text-orange-800",
}

const deviceTypeLabels: Record<string, string> = {
  desktop: "Stol kompyuteri",
  laptop: "Noutbuk",
  server: "Server",
  other: "Boshqa",
}

export function AssignedTasks() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [masterNotes, setMasterNotes] = useState("")

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("https://digus.uz/api/services/assigned-to-me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setTasks(data.requests)
      }
    } catch (error) {
      console.error("Ishlarni yuklashda xatolik:", error)
    }
    setLoading(false)
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    setUpdatingId(requestId)

    try {
      const response = await fetch(`https://digus.uz/api/services/requests/${requestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          masterNotes,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Muvaffaqiyat!",
          description: "Holat muvaffaqiyatli yangilandi.",
        })
        fetchTasks()
        setMasterNotes("")
      } else {
        toast({
          title: "Xatolik!",
          description: data.message || "Holatni yangilashda xatolik yuz berdi.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Holatni yangilashda xatolik:", error)
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

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Joriy Ishlar</CardTitle>
          <CardDescription>Sizga tayinlangan ishlar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Hozircha sizga tayinlangan ishlar yo'q.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Joriy Ishlar</CardTitle>
          <CardDescription>Sizga tayinlangan va bajarilishi kerak bo'lgan ishlar</CardDescription>
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
                <Badge className={statusColors[task.status]}>{statusLabels[task.status]}</Badge>
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

              {/* Additional Info */}
              {task.additionalInfo && (
                <div>
                  <h4 className="font-medium mb-2">Qo'shimcha ma'lumot:</h4>
                  <p className="text-muted-foreground text-sm">{task.additionalInfo}</p>
                </div>
              )}

              {/* Manager Notes */}
              {task.managerNotes && (
                <div>
                  <h4 className="font-medium mb-2">Manager izohi:</h4>
                  <p className="text-muted-foreground text-sm">{task.managerNotes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="masterNotes">Usta izohi</Label>
                    <Textarea
                      id="masterNotes"
                      placeholder="Ish haqida izoh yozing..."
                      value={masterNotes}
                      onChange={(e) => setMasterNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-2">
                    {task.status === "assigned" && (
                      <Button
                        onClick={() => handleStatusUpdate(task._id, "in_progress")}
                        disabled={updatingId === task._id}
                      >
                        {updatingId === task._id ? "Yangilanmoqda..." : "Ishni Boshlash"}
                      </Button>
                    )}
                    {task.status === "in_progress" && (
                      <Button
                        onClick={() => handleStatusUpdate(task._id, "completed")}
                        disabled={updatingId === task._id}
                      >
                        {updatingId === task._id ? "Yangilanmoqda..." : "Ishni Tugallash"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
