import express from "express"
import bcrypt from "bcrypt"
import { User } from "../models/User.js"
import { authenticateToken, authorizeRole } from "../middleware/auth.js"

const router = express.Router()

// Manager qo'shish uchun endpoint
router.get("/users/create-manager", async (req, res) => {

  const managerUser = {
    userType: "individual", // Jismoniy shaxs
    role: "manager",
    email: "manager@dernsupport.uz",
    password: "123456",
    phone: "+998901234567",
    address: "Toshkent sh., Chilonzor tumani, 12-uy",
    city: "Toshkent",
    firstName: "Umidjon",
    lastName: "Ibrokhimov",
    isActive: true,
  }
  try {
    const hashedPassword = await bcrypt.hash(managerUser.password, 10)
    managerUser.password = hashedPassword
    const user = new User(managerUser)
    await user.save()

    res.status(201).json({ message: "Foydalanuvchi muvaffaqiyatli qo'shildi", user })
  } catch (error) {
    console.error("Foydalanuvchi qo'shishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Barcha foydalanuvchilarni olish (manager uchun)
router.get("/users", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "" } = req.query

    const query = {}
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }
    if (role) {
      query.role = role
    }

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments(query)

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Foydalanuvchilarni olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Foydalanuvchi ma'lumotlarini yangilash (manager uchun)
router.put("/users/:userId", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { userId } = req.params
    const updateData = { ...req.body }

    // Parolni alohida qayta ishlash
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    }

    updateData.updatedAt = new Date()

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
      "-password",
    )

    if (!updatedUser) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" })
    }

    res.json({
      message: "Foydalanuvchi ma'lumotlari yangilandi",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Foydalanuvchini yangilashda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Foydalanuvchini o'chirish (manager uchun)
router.delete("/users/:userId", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { userId } = req.params

    const deletedUser = await User.findByIdAndDelete(userId)
    if (!deletedUser) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" })
    }

    res.json({ message: "Foydalanuvchi o'chirildi" })
  } catch (error) {
    console.error("Foydalanuvchini o'chirishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

export default router
