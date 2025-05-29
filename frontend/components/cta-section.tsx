import { Button } from "@/components/ui/button"
import { ArrowRight, Phone } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Kompyuteringiz bilan muammo bormi?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Bizning professional jamoamiz sizning barcha texnik muammolaringizni tez va sifatli hal qilishga tayyor.
              Bugun orada aloqaga chiqing!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/services">
                Xizmat so'rash
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Phone className="mr-2 h-5 w-5" />
              +998 90 123 45 67
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8">
            <div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="opacity-90">Yordam xizmati</div>
            </div>
            <div>
              <div className="text-2xl font-bold">30 kun</div>
              <div className="opacity-90">Kafolat muddati</div>
            </div>
            <div>
              <div className="text-2xl font-bold">500+</div>
              <div className="opacity-90">Mamnun mijozlar</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
