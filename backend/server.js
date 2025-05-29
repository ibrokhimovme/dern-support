import express from "express"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import cors from "cors"
import dotenv from "dotenv"

// Import all models
import { User } from "./models/User.js"
import { ServiceRequest } from "./models/Service.js"
import { SupportRequest } from "./models/Support.js"
import { Notification } from "./models/Notification.js"

// Import routes
import profileRoutes from "./routes/profile.js"
import adminRoutes from "./routes/admin.js"
import serviceRoutes from "./routes/services.js"
import paymentRoutes from "./routes/payments.js"
import supportRoutes from "./routes/support.js"
import notificationRoutes from "./routes/notifications.js"
import inventoryRoutes from "./routes/inventory.js" // Yangi route

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/computer-repair-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

mongoose.connection.on("connected", () => {
  console.log("MongoDB ga muvaffaqiyatli ulandi")
})

mongoose.connection.on("error", (err) => {
  console.log("MongoDB ulanishida xatolik:", err)
})

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Token topilmadi" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token yaroqsiz" })
    }
    req.user = user
    next()
  })
}

// Role middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Ruxsat yo'q" })
    }
    next()
  }
}

// // Manager qo'shish uchun sodda endpoint
// app.get("/api/create-manager", async (req, res) => {
//   const managerUser = {
//     userType: "individual", // Jismoniy shaxs
//     role: "manager",
//     email: "manager@dernsupport.uz",
//     password: "123456",
//     phone: "+998901234567",
//     address: "Toshkent sh., Chilonzor tumani, 12-uy",
//     city: "Toshkent",
//     firstName: "Javohir",
//     lastName: "Karimov",
//     isActive: true,
//   }

//   try {
//     // Email mavjudligini tekshirish
//     const existingUser = await User.findOne({ email: managerUser.email })
//     if (existingUser) {
//       return res.status(400).json({ message: "Bu email bilan manager allaqachon mavjud" })
//     }

//     const hashedPassword = await bcrypt.hash(managerUser.password, 10)
//     managerUser.password = hashedPassword

//     const user = new User(managerUser)
//     await user.save()

//     res.status(201).json({
//       message: "Manager muvaffaqiyatli yaratildi",
//       user: {
//         id: user._id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         userType: user.userType,
//       },
//     })
//   } catch (error) {
//     console.error("Manager yaratishda xatolik:", error)
//     res.status(500).json({ message: "Server xatoligi" })
//   }
// })

// Routes

// Ro'yxatdan o'tish
app.post("/api/register", async (req, res) => {
  try {
    const {
      userType,
      email,
      password,
      phone,
      address,
      city,
      firstName,
      lastName,
      companyName,
      inn,
      contactPerson,
      website,
    } = req.body

    // Email mavjudligini tekshirish
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Bu email allaqachon ro'yxatdan o'tgan" })
    }

    // Parolni hashlash
    const hashedPassword = await bcrypt.hash(password, 10)

    // Yangi foydalanuvchi yaratish
    const userData = {
      userType,
      email,
      password: hashedPassword,
      phone,
      address,
      city,
    }

    if (userType === "individual") {
      userData.firstName = firstName
      userData.lastName = lastName
    } else if (userType === "legal") {
      userData.companyName = companyName
      userData.inn = inn
      userData.contactPerson = contactPerson
      userData.website = website
    }

    const user = new User(userData)
    await user.save()

    // JWT token yaratish
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        userType: user.userType,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.status(201).json({
      message: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
      token,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Ro'yxatdan o'tishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Foydalanuvchini topish
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Email yoki parol noto'g'ri" })
    }

    // Parolni tekshirish
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email yoki parol noto'g'ri" })
    }

    // Last login ni yangilash
    user.lastLogin = new Date()
    await user.save()

    // JWT token yaratish
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        userType: user.userType,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.json({
      message: "Muvaffaqiyatli login qilindi",
      token,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Login qilishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Profil ma'lumotlarini olish
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" })
    }

    res.json({ user })
  } catch (error) {
    console.error("Profil olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Barcha foydalanuvchilarni olish (faqat manager uchun)
app.get("/api/users", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json({ users })
  } catch (error) {
    console.error("Foydalanuvchilarni olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Foydalanuvchi rolini o'zgartirish (faqat manager uchun)
app.put("/api/users/:userId/role", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body

    if (!["user", "master", "manager"].includes(role)) {
      return res.status(400).json({ message: "Noto'g'ri rol" })
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" })
    }

    res.json({
      message: "Rol muvaffaqiyatli o'zgartirildi",
      user,
    })
  } catch (error) {
    console.error("Rolni o'zgartirishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Ustalarni olish endpoint
app.get("/api/masters", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const masters = await User.find({ role: "master" }).select("firstName lastName companyName email phone")
    res.json({ masters })
  } catch (error) {
    console.error("Ustalarni olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Dashboard statistikasi
app.get("/api/dashboard", authenticateToken, async (req, res) => {
  try {
    const stats = {}

    if (req.user.role === "manager") {
      stats.totalUsers = await User.countDocuments()
      stats.totalRequests = await ServiceRequest.countDocuments()
      stats.pendingRequests = await ServiceRequest.countDocuments({ status: "pending" })
      stats.completedRequests = await ServiceRequest.countDocuments({ status: "completed" })
      stats.supportRequests = await SupportRequest.countDocuments({ status: { $in: ["open", "in_progress"] } })
      stats.unreadNotifications = await Notification.countDocuments({
        targetRoles: { $in: ["manager"] },
        isRead: false,
      })
    } else if (req.user.role === "master") {
      stats.assignedToMe = await ServiceRequest.countDocuments({
        assignedMaster: req.user.userId,
        status: { $in: ["assigned", "in_progress"] },
      })
      stats.completedByMe = await ServiceRequest.countDocuments({
        assignedMaster: req.user.userId,
        status: "completed",
      })
      stats.unreadNotifications = await Notification.countDocuments({
        targetRoles: { $in: ["master"] },
        isRead: false,
      })
    } else {
      stats.myRequests = await ServiceRequest.countDocuments({ user: req.user.userId })
      stats.pendingRequests = await ServiceRequest.countDocuments({
        user: req.user.userId,
        status: { $in: ["pending", "assigned", "in_progress"] },
      })
    }

    res.json({ stats })
  } catch (error) {
    console.error("Dashboard statistikasini olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Use routes
app.use("/api/profile", profileRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/support", supportRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/inventory", inventoryRoutes) // Yangi route qo'shamiz

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API ishlayapti!" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Server xatoligi yuz berdi" })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "API endpoint topilmadi" })
})

// Server ishga tushirish
app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishga tushdi`)
})

export default app
