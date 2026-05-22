const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Hostel = require("../models/Hostel");
const { protect } = require("../Middleware/authMiddleware");

router.post("/", protect, async (req, res) => {
  try {
    const { hostelId, customerName, phone, seatType, paymentMethod } = req.body;

    const hostel = await Hostel.findById(hostelId);

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    const seat = hostel.seatPricing[seatType];

    if (!seat || seat.available <= 0) {
      return res.status(400).json({ message: "Seat not available" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      hostel: hostel._id,
      hostelName: hostel.name,
      customerName,
      phone,
      seatType,
      seatLabel:
        seatType === "fourSeat"
          ? "4 Seat"
          : seatType === "threeSeat"
          ? "3 Seat"
          : seatType === "twoSeat"
          ? "2 Seat"
          : "Single Room",
      paymentMethod,
      paymentStatus: "Pending",
      price: seat.price,
    });

    hostel.seatPricing[seatType].available -= 1;
    await hostel.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Booking failed" });
  }
});

router.get("/mine", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.customerName = req.body.customerName || booking.customerName;
    booking.phone = req.body.phone || booking.phone;
    booking.seatType = req.body.seatType || booking.seatType;
    booking.paymentMethod = req.body.paymentMethod || booking.paymentMethod;

    const updated = await booking.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne();

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;