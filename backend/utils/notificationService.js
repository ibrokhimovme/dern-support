import { Notification } from "../models/Notification.js"

export const createNotification = async (type, title, message, relatedId, relatedModel, targetRoles = ["manager"]) => {
  try {
    const notification = new Notification({
      type,
      title,
      message,
      relatedId,
      relatedModel,
      targetRoles,
    })

    await notification.save()
    return notification
  } catch (error) {
    console.error("Notification yaratishda xatolik:", error)
    return null
  }
}
