import express from "express"
import { ServiceRequest } from "../models/Service.js"
import { authenticateToken, authorizeRole } from "../middleware/auth.js"

const router = express.Router()

// To'lov holatini yangilash
router.put("/requests/:requestId/payment", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { requestId } = req.params
    const { paymentStatus, finalPrice } = req.body

    const request = await ServiceRequest.findByIdAndUpdate(
      requestId,
      {
        paymentStatus,
        finalPrice,
        updatedAt: new Date(),
      },
      { new: true },
    ).populate("user serviceType assignedMaster")

    if (!request) {
      return res.status(404).json({ message: "So'rov topilmadi" })
    }

    res.json({
      message: "To'lov holati yangilandi",
      request,
    })
  } catch (error) {
    console.error("To'lov holatini yangilashda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Foydalanuvchining to'lov tarixi
router.get("/my-payments", authenticateToken, async (req, res) => {
  try {
    const payments = await ServiceRequest.find({
      user: req.user.userId,
      paymentStatus: { $in: ["paid", "refunded"] },
    })
      .populate("serviceType", "name")
      .select("serviceType finalPrice paymentStatus createdAt")
      .sort({ createdAt: -1 })

    res.json({ payments })
  } catch (error) {
    console.error("To'lov tarixini olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Umumiy to'lov statistikasi (manager uchun)
router.get("/statistics", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const totalRevenue = await ServiceRequest.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$finalPrice" } } },
    ])

    const pendingPayments = await ServiceRequest.aggregate([
      { $match: { paymentStatus: "pending", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$finalPrice" } } },
    ])

    const monthlyRevenue = await ServiceRequest.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$finalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ])

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingPayments: pendingPayments[0]?.total || 0,
      monthlyRevenue,
    })
  } catch (error) {
    console.error("Statistikani olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

export default router
