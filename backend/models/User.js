import mongoose from "mongoose"

// User Schema
const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ["individual", "legal"],
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "master", "manager"],
    default: "user",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  // Jismoniy shaxslar uchun
  firstName: {
    type: String,
    required: function () {
      return this.userType === "individual"
    },
  },
  lastName: {
    type: String,
    required: function () {
      return this.userType === "individual"
    },
  },
  // Yuridik shaxslar uchun
  companyName: {
    type: String,
    required: function () {
      return this.userType === "legal"
    },
  },
  inn: {
    type: String,
    required: function () {
      return this.userType === "legal"
    },
  },
  contactPerson: {
    type: String,
    required: function () {
      return this.userType === "legal"
    },
  },
  website: {
    type: String,
    required: function () {
      return this.userType === "legal"
    },
  },
  // Qo'shimcha maydonlar
  avatar: {
    type: String, // File path yoki URL
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
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

// Index yaratish
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ userType: 1 })

// Virtual maydonlar
userSchema.virtual("fullName").get(function () {
  if (this.userType === "individual") {
    return `${this.firstName} ${this.lastName}`
  }
  return this.companyName
})

// Pre-save middleware
userSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export const User = mongoose.model("User", userSchema)
