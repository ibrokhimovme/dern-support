import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Aziz Karimov",
    role: "Biznes egasi",
    content:
      "Juda tez va sifatli xizmat. Kompyuterim viruslar bilan to'lib ketgan edi, bir kun ichida tozalab berishdi. Tavsiya qilaman!",
    rating: 5,
  },
  {
    name: "Malika Tosheva",
    role: "O'qituvchi",
    content:
      "Noutbukimning ekrani buzilgan edi. Dern Support jamoasi juda professional tarzda almashtirdi. Narxi ham qulay edi.",
    rating: 5,
  },
  {
    name: "Bobur Rahimov",
    role: "Talaba",
    content:
      "Dasturiy ta'minot o'rnatish uchun murojaat qilgan edim. Barcha kerakli dasturlarni o'rnatib, sozlab berishdi. Rahmat!",
    rating: 5,
  },
  {
    name: "Nilufar Abdullayeva",
    role: "Dizayner",
    content:
      "Ma'lumotlarim yo'qolib qolgan edi. Dern Support orqali hammasini tiklab olishga muvaffaq bo'ldim. Juda minnatdorman!",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Mijozlar Fikrlari</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bizning xizmatlarimizdan foydalangan mijozlarning fikr-mulohazalari
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Rating */}
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground">"{testimonial.content}"</p>

                  {/* Author */}
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
