"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { Users, FileText, MessageSquare, TrendingUp, User, Settings, Package } from "lucide-react"
import { StatsCards } from "@/components/work/stats-cards"
import { ServiceRequestsManager } from "@/components/work/service-requests-manager"
import { UsersManager } from "@/components/work/users-manager"
import { SupportRequestsManager } from "@/components/work/support-requests-manager"
import { ServiceTypesManager } from "@/components/work/service-types-manager"
import { InventoryManager } from "@/components/work/inventory-manager"
import { WorkProfileSection } from "@/components/work/work-profile-section"

export function ManagerDashboard() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground">Xush kelibsiz, {user?.firstName || user?.companyName}!</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Umumiy</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Xizmat So'rovlari</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Foydalanuvchilar</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Support</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Xizmat Turlari</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Inventar</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StatsCards />
        </TabsContent>

        <TabsContent value="requests">
          <ServiceRequestsManager />
        </TabsContent>

        <TabsContent value="users">
          <UsersManager />
        </TabsContent>

        <TabsContent value="support">
          <SupportRequestsManager />
        </TabsContent>

        <TabsContent value="services">
          <ServiceTypesManager />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryManager />
        </TabsContent>

        <TabsContent value="profile">
          <WorkProfileSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
