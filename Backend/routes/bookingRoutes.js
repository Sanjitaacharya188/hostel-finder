const express = require("express");
const axios = require("axios");
const router = express.Router();

const Booking = require("../models/Booking");
const Hostel = require("../models/Hostel");
const { protect } = require("../Middleware/authMiddleware");

const seatLabelMap = {
  fourSeat: "4 Seat",
  threeSeat: "3 Seat",
  twoSeat: "2 Seat",
  singleRoom: "Single Room",
};

async function createKhaltiPayment(booking) {
  const { data } = await axios.post(
    "https://a.khalti.com/api/v2/epayment/initiate/",
    {
      return_url: `${process.env.FRONTEND_URL}/payment-success`,
      website_url: process.env.KHALTI_WEBSITE_URL || process.env.FRONTEND_URL,
      amount: booking.price * 100,
      purchase_order_id: booking._id.toString(),
      purchase_order_name: booking.hostelName,
      customer_info: {
        name: booking.customerName,
        phone: booking.phone,
      },
    },
    {
      headers: {
        Authorization: process.env.KHALTI_SECRET_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  booking.pidx = data.pidx;
  await booking.save();

  return data.payment_url;
}

// CREATE BOOKING
router.post("/", protect, async (req, res) => {
  try {
    const { hostelId, customerName, phone, seatType, paymentMethod } = req.body;

    if (!customerName || customerName.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

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
      seatLabel: seatLabelMap[seatType] || seatType,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash" ? "Pending" : "Pending",
      price: seat.price,
    });

    hostel.seatPricing[seatType].available -= 1;
    await hostel.save();

    if (paymentMethod === "Khalti") {
      const paymentUrl = await createKhaltiPayment(booking);

      return res.status(201).json({
        booking,
        paymentUrl,
      });
    }

    res.status(201).json({ booking });
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ message: "Booking failed" });
  }
});

// GET MY BOOKINGS
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

// VERIFY KHALTI PAYMENT
router.get("/khalti/verify", protect, async (req, res) => {
  try {
    const { pidx } = req.query;

    if (!pidx) {
      return res.status(400).json({ message: "pidx is required" });
    }

    const { data } = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: process.env.KHALTI_SECRET_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const booking = await Booking.findOne({
      pidx,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.paymentStatus = data.status === "Completed" ? "Paid" : "Pending";
    booking.transactionId = data.transaction_id || "";

    await booking.save();

    res.json({
      message: "Khalti payment verified",
      booking,
    });
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ message: "Khalti verification failed" });
  }
});

// UPDATE BOOKING
router.put("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking || booking.user.toString() !== req.user._id.toString()) {
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

// DELETE BOOKING
router.delete("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking || booking.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const hostel = await Hostel.findById(booking.hostel);

    if (hostel && hostel.seatPricing[booking.seatType]) {
      hostel.seatPricing[booking.seatType].available += 1;
      await hostel.save();
    }

    await booking.deleteOne();

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;