import mongoose from "mongoose"

// Support/Contact Schema
const supportRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // Contact info (for non-registered users)
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
  },
  // Request details
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["technical", "billing", "general", "complaint", "suggestion", "other"],
    default: "general",
  },
  // Status and priority
  status: {
    type: String,
    enum: ["open", "in_progress", "resolved", "closed", "escalated"],
    default: "open",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Manager or support staff
  },
  assignedDate: {
    type: Date,
  },
  // Response
  adminResponse: {
    type: String,
  },
  responseDate: {
    type: Date,
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // Resolution
  resolutionNotes: {
    type: String,
  },
  resolvedDate: {
    type: Date,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // Customer satisfaction
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  satisfactionComment: {
    type: String,
  },
  // Related service request
  relatedServiceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
  },
  // Attachments
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
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false,
  },
  followUpDate: {
    type: Date,
  },
  followUpNotes: {
    type: String,
  },
  // Tracking
  isEscalated: {
    type: Boolean,
    default: false,
  },
  escalationReason: {
    type: String,
  },
  escalatedDate: {
    type: Date,
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
supportRequestSchema.index({ user: 1 })
supportRequestSchema.index({ assignedTo: 1 })
supportRequestSchema.index({ status: 1 })
supportRequestSchema.index({ priority: 1 })
supportRequestSchema.index({ createdAt: -1 })

// Pre-save middleware
supportRequestSchema.pre("save", function (next) {
  this.updatedAt = new Date()

  // Set response date when admin response is added
  if (this.adminResponse && !this.responseDate) {
    this.responseDate = new Date()
  }

  // Set resolved date when status changes to resolved
  if (this.status === "resolved" && !this.resolvedDate) {
    this.resolvedDate = new Date()
  }

  // Set assignment date when assigned
  if (this.assignedTo && !this.assignedDate) {
    this.assignedDate = new Date()
  }

  next()
})

export const SupportRequest = mongoose.model("SupportRequest", supportRequestSchema)
