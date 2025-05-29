import express from "express"
import bcrypt from "bcrypt"
import { User } from "../models/User.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Profil ma'lumotlarini yangilash
router.put("/update", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const updateData = { ...req.body }

    // Parolni alohida qayta ishlash
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    }

    // Email o'zgartirilayotgan bo'lsa, mavjudligini tekshirish
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: userId },
      })
      if (existingUser) {
        return res.status(400).json({ message: "Bu email allaqachon ishlatilmoqda" })
      }
    }

    updateData.updatedAt = new Date()

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
      "-password",
    )

    if (!updatedUser) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" })
    }

    res.json({
      message: "Profil muvaffaqiyatli yangilandi",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Profilni yangilashda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Profil rasmini yuklash (keyinchalik qo'shiladi)
router.post("/upload-avatar", authenticateToken, async (req, res) => {
  // Bu yerda file upload logic bo'ladi
  res.json({ message: "Avatar yuklash funksiyasi keyinchalik qo'shiladi" })
})

export default router
