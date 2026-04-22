import Notification from "../models/Notification.js";

/** ✅ Get all notifications (User or Company) */
export const getAllNotifications = async (req, res) => {
  try {
    const query =
      req.accountType === "company"
        ? { companyId: req.accountData._id }
        : { userId: req.accountData._id };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate("companyId", "name image email")
      .populate("userId", "name image email");

    res.status(200).json({
      success: true,
      count: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      notifications,
    });
  } catch (error) {
    console.error("❌ Fetch Notifications:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch notifications." });
  }
};

/** ✅ Mark one notification as read */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.body;
    const updated = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ success: false, message: "Notification not found." });

    res.json({ success: true, message: "Marked as read", updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark as read." });
  }
};

/** ✅ Mark all as read */
export const markAllRead = async (req, res) => {
  try {
    const query =
      req.accountType === "company"
        ? { companyId: req.accountData._id }
        : { userId: req.accountData._id };

    await Notification.updateMany(query, { $set: { read: true } });

    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark all as read." });
  }
};
