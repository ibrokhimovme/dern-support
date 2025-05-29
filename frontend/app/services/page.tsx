import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ServiceRequestForm } from "@/components/service-request-form"

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold tracking-tight">Xizmat So'rovi</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Kompyuter muammolaringizni hal qilish uchun quyidagi formani to'ldiring. Bizning mutaxassislarimiz tez
              orada siz bilan bog'lanishadi.
            </p>
          </div>
          <ServiceRequestForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
