// Email yuborish uchun utility function
// Haqiqiy email service (nodemailer, sendgrid) o'rniga console.log ishlatamiz

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Bu yerda haqiqiy email yuborish logic bo'ladi
    console.log("=== EMAIL YUBORILDI ===")
    console.log("Kimga:", to)
    console.log("Mavzu:", subject)
    console.log("Matn:", htmlContent)
    console.log("=====================")

    return { success: true, message: "Email yuborildi" }
  } catch (error) {
    console.error("Email yuborishda xatolik:", error)
    return { success: false, message: "Email yuborilmadi" }
  }
}

export const generateRandomPassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let password = ""
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export const sendAccountCreatedEmail = async (email, firstName, lastName, password) => {
  const subject = "Sizga yangi account yaratildi - Kompyuter Ta'mirlash Xizmati"

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">🎉 Xush kelibsiz!</h2>
      
      <p>Hurmatli ${firstName} ${lastName},</p>
      
      <p>Sizning xizmat so'rovingiz muvaffaqiyatli yuborildi va sizga yangi account yaratildi.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Tizimga kirish ma'lumotlari:</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Parol:</strong> <span style="color: #dc2626; font-family: monospace;">${password}</span></p>
      </div>
      
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e;">
          ⚠️ <strong>Muhim:</strong> Bu parolni xavfsiz joyda saqlang va tizimga kirgandan keyin uni o'zgartiring.
        </p>
      </div>
      
      <p>Endi siz quyidagilarni qila olasiz:</p>
      <ul>
        <li>Xizmat so'rovlaringizni kuzatish</li>
        <li>Yangi xizmat so'rovlari yuborish</li>
        <li>Profil ma'lumotlaringizni yangilash</li>
        <li>Xizmat tarixi va hisob-kitoblarni ko'rish</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/dashboard" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Tizimga kirish
        </a>
      </div>
      
      <p>Agar savollaringiz bo'lsa, biz bilan bog'laning.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        Bu email avtomatik yuborildi. Javob bermang.<br>
        Kompyuter Ta'mirlash Xizmati © 2024
      </p>
    </div>
  `

  return await sendEmail(email, subject, htmlContent)
}
