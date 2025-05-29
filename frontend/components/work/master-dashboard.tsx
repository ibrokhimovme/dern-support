"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { Wrench, CheckCircle, Clock, User, Package } from "lucide-react"
import { AssignedTasks } from "@/components/work/assigned-tasks"
import { CompletedTasks } from "@/components/work/completed-tasks"
import { InventoryViewer } from "@/components/work/inventory-viewer"
import { WorkProfileSection } from "@/components/work/work-profile-section"

interface DashboardStats {
  assignedToMe: number
  completedByMe: number
  unreadNotifications: number
}

export function MasterDashboard() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("https://digus.uz/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (response.ok) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Statistikani yuklashda xatolik:", error)
      }
      setLoading(false)
    }

    if (token) {
      fetchStats()
    }
  }, [token])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Master Dashboard</h1>
        <p className="text-muted-foreground">Xush kelibsiz, {user?.firstName || user?.companyName}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Joriy Ishlar</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.assignedToMe || 0}</div>
            <p className="text-xs text-muted-foreground">Sizga tayinlangan ishlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugallangan</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedByMe || 0}</div>
            <p className="text-xs text-muted-foreground">Bajarilgan ishlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bildirishnomalar</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unreadNotifications || 0}</div>
            <p className="text-xs text-muted-foreground">O'qilmagan xabarlar</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Joriy Ishlar</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Tugallangan</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Ehtiyot Qismlar</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <AssignedTasks />
        </TabsContent>

        <TabsContent value="completed">
          <CompletedTasks />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryViewer />
        </TabsContent>

        <TabsContent value="profile">
          <WorkProfileSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
