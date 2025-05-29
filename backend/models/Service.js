import mongoose from "mongoose"

// Service Types Schema
const serviceTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  estimatedDuration: {
    type: String, // masalan: "2-3 soat"
    required: true,
  },
  category: {
    type: String,
    enum: ["hardware", "software", "network", "security", "maintenance", "other"],
    default: "other",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  icon: {
    type: String, // Icon nomi yoki URL
  },
  requirements: [
    {
      type: String, // Xizmat uchun kerakli narsalar
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Service Request Schema
const serviceRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  serviceType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceType",
    required: true,
  },
  deviceType: {
    type: String,
    enum: ["desktop", "laptop", "server", "printer", "network", "other"],
    required: true,
  },
  deviceBrand: {
    type: String, // Dell, HP, Lenovo, etc.
  },
  deviceModel: {
    type: String,
  },
  problemDescription: {
    type: String,
    required: true,
  },
  urgencyLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  // Location info
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  // Scheduling
  preferredDate: {
    type: Date,
    required: true,
  },
  preferredTime: {
    type: String,
    required: true,
  },
  // Contact preferences
  contactMethod: {
    type: String,
    enum: ["phone", "email", "both"],
    required: true,
  },
  additionalInfo: {
    type: String,
  },
  // Status tracking
  status: {
    type: String,
    enum: ["pending", "approved", "assigned", "in_progress", "completed", "cancelled", "on_hold"],
    default: "pending",
  },
  // Assignment
  assignedMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  assignedDate: {
    type: Date,
  },
  // Pricing
  fixedPrice: {
    type: Number,
    required: true,
  },
  finalPrice: {
    type: Number, // Actual price after completion
  },
  // Notes
  managerNotes: {
    type: String,
  },
  masterNotes: {
    type: String,
  },
  customerFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  // Tracking
  isAutoCreatedUser: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  estimatedCompletionDate: {
    type: Date,
  },
  actualStartDate: {
    type: Date,
  },
  // Files/Images
  attachments: [
    {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
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
serviceRequestSchema.index({ user: 1 })
serviceRequestSchema.index({ assignedMaster: 1 })
serviceRequestSchema.index({ status: 1 })
serviceRequestSchema.index({ createdAt: -1 })

// Pre-save middleware
serviceRequestSchema.pre("save", function (next) {
  this.updatedAt = new Date()

  // Set completion date when status changes to completed
  if (this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date()
  }

  // Set assignment date when master is assigned
  if (this.assignedMaster && !this.assignedDate) {
    this.assignedDate = new Date()
  }

  // Set start date when status changes to in_progress
  if (this.status === "in_progress" && !this.actualStartDate) {
    this.actualStartDate = new Date()
  }

  next()
})

export const ServiceType = mongoose.model("ServiceType", serviceTypeSchema)
export const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema)
