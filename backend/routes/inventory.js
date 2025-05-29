import express from "express"
import { Inventory, InventoryUsage } from "../models/Inventory.js"
import { authenticateToken, authorizeRole } from "../middleware/auth.js"
import { createNotification } from "../utils/notificationService.js"

const router = express.Router()

// Barcha ehtiyot qismlarni olish (manager va master uchun)
router.get("/", authenticateToken, authorizeRole(["manager", "master"]), async (req, res) => {
  try {
    const { category = "", search = "", page = 1, limit = 20, lowStock = false } = req.query

    const query = { isActive: true }

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    if (lowStock === "true") {
      // Low stock items
      const items = await Inventory.find(query)
      const lowStockItems = items.filter((item) => item.quantity <= item.minQuantity)
      return res.json({
        items: lowStockItems,
        total: lowStockItems.length,
        totalPages: Math.ceil(lowStockItems.length / limit),
        currentPage: 1,
      })
    }

    const items = await Inventory.find(query)
      .populate("createdBy", "firstName lastName")
      .populate("lastUpdatedBy", "firstName lastName")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 })

    const total = await Inventory.countDocuments(query)

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Inventarni olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Yangi ehtiyot qism qo'shish (faqat manager)
router.post("/", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      model,
      specifications,
      quantity,
      minQuantity,
      unitPrice,
      location,
      condition,
      supplier,
      purchaseDate,
      warrantyExpiry,
      notes,
    } = req.body

    const inventoryItem = new Inventory({
      name,
      description,
      category,
      brand,
      model,
      specifications,
      quantity,
      minQuantity,
      unitPrice,
      location,
      condition,
      supplier,
      purchaseDate,
      warrantyExpiry,
      notes,
      createdBy: req.user.userId,
      lastUpdatedBy: req.user.userId,
    })

    await inventoryItem.save()

    // Notification yaratish
    await createNotification(
      "inventory_update",
      "Yangi ehtiyot qism qo'shildi",
      `${name} (${brand} ${model}) inventarga qo'shildi`,
      inventoryItem._id,
      "Inventory",
      ["manager"],
    )

    res.status(201).json({
      message: "Ehtiyot qism muvaffaqiyatli qo'shildi",
      item: inventoryItem,
    })
  } catch (error) {
    console.error("Ehtiyot qism qo'shishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Ehtiyot qismni yangilash (faqat manager)
router.put("/:itemId", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { itemId } = req.params
    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user.userId,
      updatedAt: new Date(),
    }

    const item = await Inventory.findByIdAndUpdate(itemId, updateData, { new: true, runValidators: true }).populate(
      "createdBy lastUpdatedBy",
      "firstName lastName",
    )

    if (!item) {
      return res.status(404).json({ message: "Ehtiyot qism topilmadi" })
    }

    res.json({
      message: "Ehtiyot qism muvaffaqiyatli yangilandi",
      item,
    })
  } catch (error) {
    console.error("Ehtiyot qismni yangilashda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Ehtiyot qismni o'chirish (faqat manager)
router.delete("/:itemId", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const { itemId } = req.params

    // Soft delete - isActive ni false qilish
    const item = await Inventory.findByIdAndUpdate(
      itemId,
      {
        isActive: false,
        lastUpdatedBy: req.user.userId,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!item) {
      return res.status(404).json({ message: "Ehtiyot qism topilmadi" })
    }

    res.json({
      message: "Ehtiyot qism muvaffaqiyatli o'chirildi",
    })
  } catch (error) {
    console.error("Ehtiyot qismni o'chirishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Ehtiyot qismni ishlatish (master uchun)
router.post("/:itemId/use", authenticateToken, authorizeRole(["master"]), async (req, res) => {
  try {
    const { itemId } = req.params
    const { quantityUsed, serviceRequest, usageType = "service", notes } = req.body

    const item = await Inventory.findById(itemId)
    if (!item) {
      return res.status(404).json({ message: "Ehtiyot qism topilmadi" })
    }

    if (item.quantity < quantityUsed) {
      return res.status(400).json({
        message: `Yetarli miqdor yo'q. Mavjud: ${item.quantity}, So'ralgan: ${quantityUsed}`,
      })
    }

    // Miqdorni kamaytirish
    item.quantity -= quantityUsed
    item.lastUpdatedBy = req.user.userId
    await item.save()

    // Usage history yaratish
    const usage = new InventoryUsage({
      inventoryItem: itemId,
      serviceRequest,
      usedBy: req.user.userId,
      quantityUsed,
      usageType,
      notes,
    })

    await usage.save()

    // Low stock notification
    if (item.quantity <= item.minQuantity) {
      await createNotification(
        "inventory_low_stock",
        "Ehtiyot qism tugab qolmoqda",
        `${item.name} (${item.brand} ${item.model}) miqdori kam: ${item.quantity} dona`,
        item._id,
        "Inventory",
        ["manager"],
      )
    }

    res.json({
      message: "Ehtiyot qism muvaffaqiyatli ishlatildi",
      item,
      usage,
    })
  } catch (error) {
    console.error("Ehtiyot qismni ishlatishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Usage history olish
router.get("/:itemId/usage", authenticateToken, authorizeRole(["manager", "master"]), async (req, res) => {
  try {
    const { itemId } = req.params
    const { page = 1, limit = 10 } = req.query

    const usageHistory = await InventoryUsage.find({ inventoryItem: itemId })
      .populate("usedBy", "firstName lastName")
      .populate("serviceRequest", "status")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ usedAt: -1 })

    const total = await InventoryUsage.countDocuments({ inventoryItem: itemId })

    res.json({
      usage: usageHistory,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Usage history olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Kategoriyalar ro'yxati
router.get("/categories", authenticateToken, authorizeRole(["manager", "master"]), async (req, res) => {
  try {
    const categories = [
      { value: "ram", label: "RAM" },
      { value: "storage", label: "Saqlash qurilmasi (SSD/HDD)" },
      { value: "cpu", label: "Protsessor" },
      { value: "gpu", label: "Video karta" },
      { value: "motherboard", label: "Ona plata" },
      { value: "power_supply", label: "Quvvat bloki" },
      { value: "cooling", label: "Sovutish tizimi" },
      { value: "case", label: "Korpus" },
      { value: "cable", label: "Kabellar" },
      { value: "other", label: "Boshqa" },
    ]

    res.json({ categories })
  } catch (error) {
    console.error("Kategoriyalarni olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

// Statistika (manager uchun)
router.get("/stats", authenticateToken, authorizeRole(["manager"]), async (req, res) => {
  try {
    const totalItems = await Inventory.countDocuments({ isActive: true })
    const totalValue = await Inventory.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: "$totalValue" } } },
    ])

    const lowStockItems = await Inventory.find({ isActive: true })
    const lowStockCount = lowStockItems.filter((item) => item.quantity <= item.minQuantity).length

    const categoryStats = await Inventory.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 }, totalValue: { $sum: "$totalValue" } } },
      { $sort: { count: -1 } },
    ])

    res.json({
      totalItems,
      totalValue: totalValue[0]?.total || 0,
      lowStockCount,
      categoryStats,
    })
  } catch (error) {
    console.error("Statistikani olishda xatolik:", error)
    res.status(500).json({ message: "Server xatoligi" })
  }
})

export default router
