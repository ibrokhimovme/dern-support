import express from "express"
import { Notification } from "../models/Notification.js"
import { authenticateToken, authorizeRole } from "../middleware/auth.js"

const router = express.Router()

// Notificationlarni olish (manager va master uchun)
router.get("/", authenticateToken, authorizeRole(["manager", "master"]), async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query

    const query = {
      targetRoles: { $in: [req.user.role] },
    }

    if (unreadOnly === "true") {
      query.isRead = false
    }

    const notifications = await Notification.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const unreadCount = await Notification.countDocuments({
      targetRoles: { $in: [req.user.role] },
      isRead: false,
    })

    res.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Notificationlarni olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Notificationni o'qilgan deb belgilash
router.put("/:notificationId/read", authenticateToken, authorizeRole(["manager", "master"]), async (req, res) => {
  try {
    const { notificationId } = req.params

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        $push: {
          readBy: {
            user: req.user.userId,
            readAt: new Date(),
          },
        },
      },
      { new: true },
    )

    if (!notification) {
      return res.status(404).json({ message: "Notification topilmadi" })
    }

    res.json({
      message: "Notification o'qilgan deb belgilandi",
      notification,
    })
  } catch (error) {
    console.error("Notificationni belgilashda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Barcha notificationlarni o'qilgan deb belgilash
router.put("/mark-all-read", authenticateToken, authorizeRole(["manager", "master"]), async (req, res) => {
  try {
    await Notification.updateMany(
      {
        targetRoles: { $in: [req.user.role] },
        isRead: false,
      },
      {
        isRead: true,
        $push: {
          readBy: {
            user: req.user.userId,
            readAt: new Date(),
          },
        },
      },
    )

    res.json({
      message: "Barcha notificationlar o'qilgan deb belgilandi",
    })
  } catch (error) {
    console.error("Barcha notificationlarni belgilashda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

export default router
