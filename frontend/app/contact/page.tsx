import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl font-bold tracking-tight">Biz Bilan Aloqa</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Savollaringiz bormi? Yordam kerakmi? Biz bilan bog'laning! Har qanday vaqtda sizga yordam berishga
              tayyormiz.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Aloqa Ma'lumotlari</h2>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Telefon</h3>
                          <p className="text-muted-foreground">+998 90 123 45 67</p>
                          <p className="text-muted-foreground">+998 91 234 56 78</p>
                          <p className="text-sm text-muted-foreground mt-1">24/7 yordam xizmati</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Email</h3>
                          <p className="text-muted-foreground">info@dernsupport.uz</p>
                          <p className="text-muted-foreground">support@dernsupport.uz</p>
                          <p className="text-sm text-muted-foreground mt-1">24 soat ichida javob beramiz</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Manzil</h3>
                          <p className="text-muted-foreground">Toshkent shahar, Chilonzor tumani</p>
                          <p className="text-muted-foreground">Bunyodkor ko'chasi, 12-uy</p>
                          <p className="text-sm text-muted-foreground mt-1">Metro: Chilonzor</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Ish Vaqti</h3>
                          <p className="text-muted-foreground">Dushanba - Juma: 9:00 - 18:00</p>
                          <p className="text-muted-foreground">Shanba: 10:00 - 16:00</p>
                          <p className="text-muted-foreground">Yakshanba: Dam olish kuni</p>
                          <p className="text-sm text-muted-foreground mt-1">Shoshilinch holatlar uchun 24/7</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>

            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <Card>
              <CardHeader>
                <CardTitle>Bizning Joylashuvimiz</CardTitle>
                <CardDescription>Ofisimizga tashrif buyuring yoki xarita orqali yo'l toping</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg">
                  <div className="text-center" style={{ height: "100%" }}>
                    {/* <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" /> */}
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24255.896357553993!2d69.20601598924962!3d41.22766607897364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae6124b2bd1953%3A0xa64d5da175d3778b!2z0KDQtdC80L7QvdGCINC60L7QvNC_0YzRjtGC0LXRgNC-0LIgLyDQodC10YDQstC40YHQvdGL0Lkg0YbQtdC90YLRgA!5e1!3m2!1sru!2s!4v1748492654768!5m2!1sru!2s" style={{ border: "0", width: "100%", height: "100%" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    {/* <p className="text-sm text-muted-foreground">Toshkent, Sergeli tumani, Bunyodkor ko'chasi 12</p> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
