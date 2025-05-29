import mongoose from "mongoose"

// Admin Settings Schema
const adminSettingsSchema = new mongoose.Schema({
  // Company Information
  companyInfo: {
    name: {
      type: String,
      default: "Dern Support",
    },
    description: {
      type: String,
      default: "Professional kompyuter ta'mirlash xizmatlari",
    },
    logo: {
      type: String, // Logo file path
    },
    address: {
      type: String,
      default: "Toshkent, Chilonzor tumani",
    },
    phone: [
      {
        type: String,
      },
    ],
    email: [
      {
        type: String,
      },
    ],
    website: {
      type: String,
    },
    workingHours: {
      monday: { start: String, end: String, isOpen: Boolean },
      tuesday: { start: String, end: String, isOpen: Boolean },
      wednesday: { start: String, end: String, isOpen: Boolean },
      thursday: { start: String, end: String, isOpen: Boolean },
      friday: { start: String, end: String, isOpen: Boolean },
      saturday: { start: String, end: String, isOpen: Boolean },
      sunday: { start: String, end: String, isOpen: Boolean },
    },
  },

  // System Settings
  systemSettings: {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: "Tizim texnik ishlar olib borilmoqda",
    },
    allowRegistration: {
      type: Boolean,
      default: true,
    },
    autoAssignMasters: {
      type: Boolean,
      default: false,
    },
    defaultServiceDuration: {
      type: String,
      default: "2-3 soat",
    },
    maxRequestsPerDay: {
      type: Number,
      default: 100,
    },
  },

  // Notification Settings
  notificationSettings: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    notificationRetentionDays: {
      type: Number,
      default: 30,
    },
  },

  // Payment Settings
  paymentSettings: {
    acceptCash: {
      type: Boolean,
      default: true,
    },
    acceptCard: {
      type: Boolean,
      default: true,
    },
    acceptBankTransfer: {
      type: Boolean,
      default: true,
    },
    taxRate: {
      type: Number,
      default: 0.12, // 12% NDS
    },
    currency: {
      type: String,
      default: "UZS",
    },
    paymentTerms: {
      type: String,
      default: "To'lov xizmat tugagandan so'ng amalga oshiriladi",
    },
  },

  // Service Settings
  serviceSettings: {
    emergencyServiceAvailable: {
      type: Boolean,
      default: true,
    },
    emergencyServiceCharge: {
      type: Number,
      default: 50000, // 50,000 so'm qo'shimcha
    },
    homeServiceAvailable: {
      type: Boolean,
      default: true,
    },
    homeServiceCharge: {
      type: Number,
      default: 20000, // 20,000 so'm transport
    },
    warrantyPeriodDays: {
      type: Number,
      default: 30,
    },
  },

  // Email Templates
  emailTemplates: {
    welcomeEmail: {
      subject: String,
      body: String,
    },
    serviceRequestConfirmation: {
      subject: String,
      body: String,
    },
    serviceCompleted: {
      subject: String,
      body: String,
    },
    passwordReset: {
      subject: String,
      body: String,
    },
  },

  // Security Settings
  securitySettings: {
    passwordMinLength: {
      type: Number,
      default: 6,
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: 60,
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
    },
    lockoutDurationMinutes: {
      type: Number,
      default: 15,
    },
  },

  // Backup Settings
  backupSettings: {
    autoBackup: {
      type: Boolean,
      default: true,
    },
    backupFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "daily",
    },
    backupRetentionDays: {
      type: Number,
      default: 30,
    },
  },

  // Analytics Settings
  analyticsSettings: {
    trackUserActivity: {
      type: Boolean,
      default: true,
    },
    dataRetentionMonths: {
      type: Number,
      default: 12,
    },
  },

  // Metadata
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

// Pre-save middleware
adminSettingsSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

// System Logs Schema
const systemLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ["info", "warning", "error", "debug"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["auth", "service", "payment", "system", "user", "api"],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  requestData: {
    type: mongoose.Schema.Types.Mixed,
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed,
  },
  errorStack: {
    type: String,
  },
  duration: {
    type: Number, // milliseconds
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Indexes for logs
systemLogSchema.index({ level: 1 })
systemLogSchema.index({ category: 1 })
systemLogSchema.index({ userId: 1 })
systemLogSchema.index({ createdAt: -1 })

export const AdminSettings = mongoose.model("AdminSettings", adminSettingsSchema)
export const SystemLog = mongoose.model("SystemLog", systemLogSchema)
