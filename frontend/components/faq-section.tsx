"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Xizmat so'rovini qanday yuborish mumkin?",
    answer:
      "Xizmat so'rovi yuborish uchun \"Xizmatlar\" sahifasiga o'ting va kerakli xizmatni tanlab, formani to'ldiring. Yoki to'g'ridan-to'g'ri bizga qo'ng'iroq qiling.",
  },
  {
    question: "Ta'mirlash qancha vaqt oladi?",
    answer:
      "Ta'mirlash vaqti muammoning murakkabligiga bog'liq. Oddiy muammolar 1-2 soat, murakkab ta'mirlar 1-3 kun vaqt olishi mumkin.",
  },
  {
    question: "Kafolat berasizmi?",
    answer:
      "Ha, barcha ta'mirlash ishlariga 30 kun kafolat beramiz. Agar muammo qayta paydo bo'lsa, bepul ta'mirlaymiz.",
  },
  {
    question: "Uyga chiqib xizmat ko'rsatasizmi?",
    answer: "Ha, uyga chiqib xizmat ko'rsatamiz. Qo'shimcha transport xarajati 20,000 so'm.",
  },
  {
    question: "To'lov usullari qanday?",
    answer: "Naqd pul, plastik karta va bank o'tkazmasi orqali to'lov qilishingiz mumkin.",
  },
  {
    question: "Qanday qurilmalarni ta'mirlay olasiz?",
    answer:
      "Biz kompyuter, noutbuk, server va boshqa texnik qurilmalarni ta'mirlaymiz. Barcha brendlar bilan ishlaymiz.",
  },
]

export function FAQSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ko'p So'raladigan Savollar</h2>
          <p className="text-xl text-muted-foreground">
            Mijozlarimiz tomonidan eng ko'p so'raladigan savollarga javoblar
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="bg-background rounded-lg px-6">
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
