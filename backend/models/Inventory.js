import mongoose from "mongoose"

// Inventory/Parts Schema
const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["ram", "storage", "cpu", "gpu", "motherboard", "power_supply", "cooling", "case", "cable", "other"],
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  specifications: {
    type: String, // JSON string yoki text format
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  minQuantity: {
    type: Number,
    default: 5, // Minimum miqdor - ogohlantirish uchun
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalValue: {
    type: Number,
    default: 0,
  },
  location: {
    type: String, // Qayerda saqlanishi
    default: "Asosiy ombor",
  },
  condition: {
    type: String,
    enum: ["new", "used", "refurbished", "damaged"],
    default: "new",
  },
  supplier: {
    type: String,
  },
  purchaseDate: {
    type: Date,
  },
  warrantyExpiry: {
    type: Date,
  },
  notes: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Inventory Usage History Schema
const inventoryUsageSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
    required: true,
  },
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quantityUsed: {
    type: Number,
    required: true,
    min: 1,
  },
  usageType: {
    type: String,
    enum: ["service", "repair", "replacement", "testing", "other"],
    default: "service",
  },
  notes: {
    type: String,
  },
  usedAt: {
    type: Date,
    default: Date.now,
  },
})

// Indexes
inventorySchema.index({ name: 1 })
inventorySchema.index({ category: 1 })
inventorySchema.index({ brand: 1 })
inventorySchema.index({ quantity: 1 })
inventorySchema.index({ isActive: 1 })

inventoryUsageSchema.index({ inventoryItem: 1 })
inventoryUsageSchema.index({ usedBy: 1 })
inventoryUsageSchema.index({ usedAt: -1 })

// Pre-save middleware
inventorySchema.pre("save", function (next) {
  this.updatedAt = new Date()
  this.totalValue = this.quantity * this.unitPrice
  next()
})

// Virtual for low stock warning
inventorySchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.minQuantity
})

export const Inventory = mongoose.model("Inventory", inventorySchema)
export const InventoryUsage = mongoose.model("InventoryUsage", inventoryUsageSchema)
