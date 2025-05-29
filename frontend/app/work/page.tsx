"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth-provider"
import { ManagerDashboard } from "@/components/work/manager-dashboard"
import { MasterDashboard } from "@/components/work/master-dashboard"
import { useRouter } from "next/navigation"

export default function WorkPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || (user.role !== "manager" && user.role !== "master"))) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== "manager" && user.role !== "master")) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-6">{user.role === "manager" ? <ManagerDashboard /> : <MasterDashboard />}</main>
      <Footer />
    </div>
  )
}
