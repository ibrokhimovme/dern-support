import mongoose from "mongoose"

// Payment Schema
const paymentSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: "UZS",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "bank_transfer", "online", "other"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "refunded", "cancelled"],
    default: "pending",
  },
  transactionId: {
    type: String, // Bank yoki payment gateway transaction ID
  },
  paymentDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  // Payment details
  paymentDetails: {
    cardNumber: String, // Last 4 digits only
    bankName: String,
    accountNumber: String, // Masked
    receiptNumber: String,
  },
  // Discount and fees
  discountAmount: {
    type: Number,
    default: 0,
  },
  discountReason: {
    type: String,
  },
  serviceCharge: {
    type: Number,
    default: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  // Refund info
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundReason: {
    type: String,
  },
  refundDate: {
    type: Date,
  },
  // Notes
  notes: {
    type: String,
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Manager who processed the payment
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

// Indexes
paymentSchema.index({ serviceRequest: 1 })
paymentSchema.index({ user: 1 })
paymentSchema.index({ paymentStatus: 1 })
paymentSchema.index({ paymentDate: -1 })

// Pre-save middleware
paymentSchema.pre("save", function (next) {
  this.updatedAt = new Date()

  // Set payment date when status changes to completed
  if (this.paymentStatus === "completed" && !this.paymentDate) {
    this.paymentDate = new Date()
  }

  next()
})

// Virtual for formatted amount
paymentSchema.virtual("formattedAmount").get(function () {
  return `${this.totalAmount.toLocaleString()} ${this.currency}`
})

export const Payment = mongoose.model("Payment", paymentSchema)
