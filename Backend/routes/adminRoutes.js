const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Hostel = require("../models/Hostel");

const { protect } = require("../Middleware/authMiddleware");

// ADMIN ONLY CHECK
const adminOnly = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res
        .status(401)
        .json({ message: "Admin only" });
    }

    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Authorization failed" });
  }
};

// Protect all admin routes
router.use(protect, adminOnly);

// GET ALL BOOKINGS
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch bookings",
    });
  }
});

// ACCEPT / REJECT BOOKING
router.put("/bookings/:id/status", async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    booking.paymentStatus =
      req.body.status;

    await booking.save();

    res.json({
      message: "Booking updated",
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Failed to update booking",
    });
  }
});

// DELETE BOOKING
router.delete("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    await booking.deleteOne();

    res.json({
      message:
        "Booking deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Failed to delete booking",
    });
  }
});

// GET ALL HOSTELS
router.get("/hostels", async (req, res) => {
  try {
    const hostels = await Hostel.find();

    res.json(hostels);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Failed to fetch hostels",
    });
  }
});

module.exports = router;