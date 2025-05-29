import mongoose from "mongoose"

// Notification Schema
const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "service_request",
      "support_request",
      "user_registration",
      "status_update",
      "payment_received",
      "assignment_update",
      "system_alert",
      "reminder",
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  // Related data
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  relatedModel: {
    type: String,
    enum: ["ServiceRequest", "SupportRequest", "User", "Payment"],
    required: true,
  },
  // Targeting
  targetRoles: [
    {
      type: String,
      enum: ["manager", "master", "user"],
    },
  ],
  targetUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // Read status
  isRead: {
    type: Boolean,
    default: false,
  },
  readBy: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Priority and category
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  category: {
    type: String,
    enum: ["info", "warning", "error", "success"],
    default: "info",
  },
  // Action data
  actionUrl: {
    type: String, // URL to navigate when notification is clicked
  },
  actionData: {
    type: mongoose.Schema.Types.Mixed, // Additional data for the action
  },
  // Scheduling
  scheduledFor: {
    type: Date, // For scheduled notifications
  },
  expiresAt: {
    type: Date, // When notification should be automatically removed
  },
  // Delivery
  isDelivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
  deliveryMethod: [
    {
      type: String,
      enum: ["in_app", "email", "sms", "push"],
      default: "in_app",
    },
  ],
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Additional metadata
  },
  createdBy: {
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

// Indexes
notificationSchema.index({ targetRoles: 1 })
notificationSchema.index({ targetUsers: 1 })
notificationSchema.index({ isRead: 1 })
notificationSchema.index({ createdAt: -1 })
notificationSchema.index({ type: 1 })
notificationSchema.index({ priority: 1 })
notificationSchema.index({ expiresAt: 1 })

// Pre-save middleware
notificationSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

// Method to mark as read by user
notificationSchema.methods.markAsReadBy = function (userId) {
  const existingRead = this.readBy.find((read) => read.user.toString() === userId.toString())

  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date(),
    })
  }

  // Check if all target users have read it
  if (this.targetUsers.length > 0) {
    const allRead = this.targetUsers.every((targetUser) =>
      this.readBy.some((read) => read.user.toString() === targetUser.toString()),
    )
    if (allRead) {
      this.isRead = true
    }
  } else {
    // For role-based notifications, mark as read if at least one person read it
    this.isRead = true
  }

  return this.save()
}

export const Notification = mongoose.model("Notification", notificationSchema)
