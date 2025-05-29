"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/components/auth-provider"
import { LoginDialog } from "@/components/login-dialog"
import { RegisterDialog } from "@/components/register-dialog"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  const navigation = [
    { name: "Bosh sahifa", href: "/" },
    { name: "Xizmatlar", href: "/services" },
    { name: "Aloqa", href: "/contact" },
  ]

  // Add work navigation for managers and masters
  if (user && (user.role === "manager" || user.role === "master")) {
    navigation.push({ name: "Ish paneli", href: "/work" })
  }

  // Add dashboard for regular users
  if (user && user.role === "user") {
    navigation.push({ name: "Shaxsiy kabinet", href: "/dashboard" })
  }

  return (
    <header className="bg-background border-b">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              Dern Support
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications for managers and masters */}
            {user && (user.role === "manager" || user.role === "master") && <NotificationsDropdown />}

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Mavzuni o'zgartirish</span>
            </Button>

            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-foreground">Salom, {user.firstName || user.companyName}!</span>
                <Button variant="outline" onClick={logout}>
                  Chiqish
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => setLoginOpen(true)}>
                  Kirish
                </Button>
                <Button onClick={() => setRegisterOpen(true)}>Ro'yxatdan o'tish</Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="flex items-center space-x-2 px-3 py-2">
                {user && (user.role === "manager" || user.role === "master") && <NotificationsDropdown />}
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </div>

              {user ? (
                <div className="px-3 py-2">
                  <p className="text-sm text-foreground mb-2">Salom, {user.firstName || user.companyName}!</p>
                  <Button variant="outline" onClick={logout} className="w-full">
                    Chiqish
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Button variant="ghost" onClick={() => setLoginOpen(true)} className="w-full">
                    Kirish
                  </Button>
                  <Button onClick={() => setRegisterOpen(true)} className="w-full">
                    Ro'yxatdan o'tish
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} />
    </header>
  )
}
