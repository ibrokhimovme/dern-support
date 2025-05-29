import express from "express"
import { SupportRequest } from "../models/Support.js"
import { authenticateToken, authorizeRole } from "../middleware/auth.js"
import { createNotification } from "../utils/notificationService.js"

const router = express.Router()

// Support so'rovi yuborish (login qilmagan foydalanuvchilar uchun ham)
router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    const supportRequest = new SupportRequest({
      user: req.user?.userId || null,
      name,
      email,
      phone,
      subject,
      message,
    })

    await supportRequest.save()

    // Notification yaratish
    await createNotification(
      "support_request",
      "Yangi support so'rovi",
      `${name} tomonidan yangi support so'rovi: ${subject}`,
      supportRequest._id,
      "SupportRequest",
      ["manager"],
    )

    res.status(201).json({
      message: "Xabaringiz muvaffaqiyatli yuborildi",
      supportRequest,
    })
  } catch (error) {
    console.error("Support so'rovini yuborishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Barcha support so'rovlarini olish (manager uchun)
router.get("/requests", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { status = "", page = 1, limit = 10 } = req.query

    const query = {}
    if (status) {
      query.status = status
    }

    const requests = await SupportRequest.find(query)
      .populate("user", "firstName lastName companyName")
      .populate("assignedTo", "firstName lastName")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await SupportRequest.countDocuments(query)

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Support so'rovlarini olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Support so'rovini yangilash funksiyasini soddalashtiramiz
router.put("/requests/:requestId", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { requestId } = req.params
    const { status, priority } = req.body

    const updateData = {
      status,
      priority,
      updatedAt: new Date(),
    }

    // Agar status "resolved" yoki "closed" ga o'zgartirilsa, resolved date ni qo'yish
    if (status === "resolved" || status === "closed") {
      const currentRequest = await SupportRequest.findById(requestId)
      if (currentRequest && !currentRequest.resolvedDate) {
        updateData.resolvedDate = new Date()
        updateData.resolvedBy = req.user.userId
      }
    }

    const updatedRequest = await SupportRequest.findByIdAndUpdate(requestId, updateData, { new: true }).populate(
      "user assignedTo resolvedBy",
    )

    if (!updatedRequest) {
      return res.status(404).json({ message: "So'rov topilmadi" })
    }

    res.json({
      message: "Support so'rovi yangilandi",
      request: updatedRequest,
    })
  } catch (error) {
    console.error("Support so'rovini yangilashda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

export default router
