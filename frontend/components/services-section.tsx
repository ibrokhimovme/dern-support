import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Monitor, HardDrive, Download, Settings, Database, Wifi, ArrowRight } from "lucide-react"
import Link from "next/link"

const services = [
  {
    icon: Monitor,
    title: "Virus tozalash",
    description: "Kompyuteringizni viruslar va zararli dasturlardan tozalaymiz",
    price: "50,000 so'm",
  },
  {
    icon: HardDrive,
    title: "Hardware almashtirish",
    description: "Buzilgan qismlarni yangi va sifatli qismlar bilan almashtiramiz",
    price: "100,000 so'm",
  },
  {
    icon: Download,
    title: "Dasturiy ta'minot o'rnatish",
    description: "Kerakli dasturlarni o'rnatish va sozlash xizmatlari",
    price: "30,000 so'm",
  },
  {
    icon: Settings,
    title: "Tizim optimallashtirish",
    description: "Kompyuter tezligini oshirish va ishlashini yaxshilash",
    price: "70,000 so'm",
  },
  {
    icon: Database,
    title: "Ma'lumotlarni tiklash",
    description: "Yo'qolgan ma'lumotlarni tiklash va zaxira nusxa yaratish",
    price: "120,000 so'm",
  },
  {
    icon: Wifi,
    title: "Tarmoq sozlash",
    description: "Internet va lokal tarmoq sozlash xizmatlari",
    price: "60,000 so'm",
  },
]

export function ServicesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Bizning Xizmatlarimiz</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional kompyuter ta'mirlash va texnik yordam xizmatlarining to'liq spektri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <div className="text-lg font-semibold text-primary">{service.price}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">{service.description}</CardDescription>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/services">
                    So'rov yuborish
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link href="/services">
              Barcha xizmatlarni ko'rish
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
