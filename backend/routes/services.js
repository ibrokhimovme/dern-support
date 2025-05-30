import express from "express"
import bcrypt from "bcrypt"
import { ServiceType, ServiceRequest } from "../models/Service.js"
import { User } from "../models/User.js"
import { authenticateToken, authorizeRole } from "../middleware/auth.js"
import { sendEmail, generateRandomPassword } from "../utils/emailService.js"
import { createNotification } from "../utils/notificationService.js"

const router = express.Router()

// Xizmat turlarini olish
router.get("/types", async (req, res) => {
  try {
    const serviceTypes = await ServiceType.find({ isActive: true }).sort({ name: 1 })
    res.json({ serviceTypes })
  } catch (error) {
    console.error("Xizmat turlarini olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Yangi xizmat turi qo'shish (manager uchun)
router.post("/types", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { name, description, basePrice, estimatedDuration, category } = req.body

    const serviceType = new ServiceType({
      name,
      description,
      basePrice,
      estimatedDuration,
      category,
    })

    await serviceType.save()

    res.status(201).json({
      message: "Xizmat turi muvaffaqiyatli qo'shildi",
      serviceType,
    })
  } catch (error) {
    console.error("Xizmat turini qo'shishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Service Types CRUD operations qo'shish (manager uchun)

// Barcha service types ni olish (manager uchun)
router.get("/admin/types", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const serviceTypes = await ServiceType.find().sort({ createdAt: -1 })
    res.json({ serviceTypes })
  } catch (error) {
    console.error("Service types ni olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Service type ni yangilash (manager uchun)
router.put("/types/:typeId", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { typeId } = req.params
    const { name, description, basePrice, estimatedDuration, category, isActive } = req.body

    const serviceType = await ServiceType.findByIdAndUpdate(
      typeId,
      {
        name,
        description,
        basePrice,
        estimatedDuration,
        category,
        isActive,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    )

    if (!serviceType) {
      return res.status(404).json({ message: "Service type topilmadi" })
    }

    res.json({
      message: "Service type muvaffaqiyatli yangilandi",
      serviceType,
    })
  } catch (error) {
    console.error("Service type ni yangilashda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Service type ni o'chirish (manager uchun)
router.delete("/types/:typeId", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { typeId } = req.params

    // Tekshirish: bu service type bilan bog'liq so'rovlar bormi
    const relatedRequests = await ServiceRequest.countDocuments({ serviceType: typeId })

    if (relatedRequests > 0) {
      // Agar bog'liq so'rovlar bo'lsa, faqat faolsizlashtirish
      const serviceType = await ServiceType.findByIdAndUpdate(
        typeId,
        { isActive: false, updatedAt: new Date() },
        { new: true },
      )

      return res.json({
        message: "Service type faolsizlashtirildi (bog'liq so'rovlar mavjud)",
        serviceType,
      })
    }

    // Agar bog'liq so'rovlar bo'lmasa, to'liq o'chirish
    const serviceType = await ServiceType.findByIdAndDelete(typeId)

    if (!serviceType) {
      return res.status(404).json({ message: "Service type topilmadi" })
    }

    res.json({ message: "Service type muvaffaqiyatli o'chirildi" })
  } catch (error) {
    console.error("Service type ni o'chirishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Xizmat so'rovi yuborish (ro'yxatdan o'tmagan foydalanuvchilar uchun ham)
router.post("/request", async (req, res) => {
  try {
    const {
      serviceType,
      deviceType,
      deviceBrand,
      deviceModel,
      problemDescription,
      urgencyLevel,
      city,
      address,
      preferredDate,
      preferredTime,
      contactMethod,
      additionalInfo,
      // Foydalanuvchi ma'lumotlari (agar ro'yxatdan o'tmagan bo'lsa)
      firstName,
      lastName,
      email,
      phone,
      userType = "individual",
    } = req.body

    let userId = req.user?.userId
    let isAutoCreated = false
    let randomPassword;

    // Agar foydalanuvchi login qilmagan bo'lsa, yangi account yaratish
    if (!userId) {
      // Email mavjudligini tekshirish
      const existingUser = await User.findOne({ email })

      if (!existingUser) {
        // Yangi foydalanuvchi yaratish
        randomPassword = generateRandomPassword()
        const hashedPassword = await bcrypt.hash(randomPassword, 10)

        const newUser = new User({
          userType,
          firstName,
          lastName,
          email,
          phone,
          address,
          city,
          password: hashedPassword,
          role: "user",
        })

        await newUser.save()
        userId = newUser._id
        isAutoCreated = true

        // Notification yaratish
        await createNotification(
          "user_registration",
          "Yangi avtomatik foydalanuvchi",
          `${firstName} ${lastName} uchun avtomatik account yaratildi`,
          newUser._id,
          "User",
          ["manager"],
        )
      } else {
        userId = existingUser._id
      }
    }

    // Xizmat turini topish va narxni olish
    const serviceTypeDoc = await ServiceType.findById(serviceType)
    if (!serviceTypeDoc) {
      return res.status(400).json({ message: "Xizmat turi topilmadi" })
    }

    const serviceRequest = new ServiceRequest({
      user: userId,
      serviceType,
      deviceType,
      deviceBrand,
      deviceModel,
      problemDescription,
      urgencyLevel,
      city,
      address,
      preferredDate,
      preferredTime,
      contactMethod,
      additionalInfo,
      fixedPrice: serviceTypeDoc.basePrice,
      isAutoCreatedUser: isAutoCreated,
    })

    await serviceRequest.save()
    await serviceRequest.populate("serviceType user")

    // Notification yaratish
    await createNotification(
      "service_request",
      "Yangi xizmat so'rovi",
      `${serviceRequest.user.firstName || serviceRequest.user.companyName} tomonidan yangi xizmat so'rovi`,
      serviceRequest._id,
      "ServiceRequest",
      ["manager"],
    )

    res.status(201).json({
      message: "Xizmat so'rovi muvaffaqiyatli bo'ldi",
      generatedPassword: randomPassword,
      serviceRequest,
      autoCreatedAccount: isAutoCreated,
    })
  } catch (error) {
    console.error("Xizmat so'rovini yuborishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Foydalanuvchining xizmat so'rovlarini olish
router.get("/my-requests", authenticateToken, async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ user: req.user.userId })
      .populate("serviceType", "name description basePrice")
      .populate("assignedMaster", "firstName lastName companyName")
      .sort({ createdAt: -1 })

    res.json({ requests })
  } catch (error) {
    console.error("Xizmat so'rovlarini olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Barcha xizmat so'rovlarini olish (manager uchun)
router.get("/all-requests", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { status = "", page = 1, limit = 10 } = req.query

    const query = {}
    if (status) {
      query.status = status
    }

    const requests = await ServiceRequest.find(query)
      .populate("user", "firstName lastName companyName email phone")
      .populate("serviceType", "name description basePrice")
      .populate("assignedMaster", "firstName lastName companyName")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await ServiceRequest.countDocuments(query)

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Barcha so'rovlarni olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Ustaga tayinlangan ishlarni olish
router.get("/assigned-to-me", authenticateToken, authorizeRole(["master"]), async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      assignedMaster: req.user.userId,
      status: { $in: ["assigned", "in_progress"] },
    })
      .populate("user", "firstName lastName companyName email phone")
      .populate("serviceType", "name description basePrice")
      .sort({ preferredDate: 1 })

    res.json({ requests })
  } catch (error) {
    console.error("Tayinlangan ishlarni olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Usta tomonidan bajarilgan ishlar
router.get("/completed-by-me", authenticateToken, authorizeRole(["master"]), async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      assignedMaster: req.user.userId,
      status: "completed",
    })
      .populate("user", "firstName lastName companyName email phone")
      .populate("serviceType", "name description basePrice")
      .sort({ updatedAt: -1 })

    res.json({ requests })
  } catch (error) {
    console.error("Bajarilgan ishlarni olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Xizmat so'rovini tasdiqlash va usta tayinlash (manager uchun)
router.put("/requests/:requestId/assign", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { requestId } = req.params
    const { assignedMaster, managerNotes } = req.body

    const request = await ServiceRequest.findByIdAndUpdate(
      requestId,
      {
        status: "assigned",
        assignedMaster,
        managerNotes,
        assignedDate: new Date(),
        updatedAt: new Date(),
      },
      { new: true },
    ).populate("user serviceType assignedMaster")

    if (!request) {
      return res.status(404).json({ message: "So'rov topilmadi" })
    }

    // Notification yaratish
    await createNotification(
      "assignment_update",
      "Ish tayinlandi",
      `Sizga yangi ish tayinlandi: ${request.serviceType.name}`,
      request._id,
      "ServiceRequest",
      ["master"],
    )

    res.json({
      message: "Usta muvaffaqiyatli tayinlandi",
      request,
    })
  } catch (error) {
    console.error("Usta tayinlashda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Xizmat holatini yangilash
router.put("/requests/:requestId/status", authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params
    const { status, masterNotes } = req.body

    // Faqat tayinlangan usta yoki manager o'zgartira oladi
    const request = await ServiceRequest.findById(requestId)
    if (!request) {
      return res.status(404).json({ message: "So'rov topilmadi" })
    }

    if (req.user.role !== "manager" && request.assignedMaster.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Ruxsat yo'q" })
    }

    const updateData = {
      status,
      updatedAt: new Date(),
    }

    if (masterNotes) updateData.masterNotes = masterNotes

    // Set specific dates based on status
    if (status === "in_progress" && !request.actualStartDate) {
      updateData.actualStartDate = new Date()
    }

    if (status === "completed" && !request.completedAt) {
      updateData.completedAt = new Date()
    }

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(requestId, updateData, { new: true }).populate(
      "user serviceType assignedMaster",
    )

    // Notification yaratish
    if (status === "completed") {
      await createNotification(
        "status_update",
        "Ish tugallandi",
        `${updatedRequest.serviceType.name} xizmati tugallandi`,
        updatedRequest._id,
        "ServiceRequest",
        ["manager"],
      )
    }

    res.json({
      message: "Holat muvaffaqiyatli yangilandi",
      request: updatedRequest,
    })
  } catch (error) {
    console.error("Holatni yangilashda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

export default router
