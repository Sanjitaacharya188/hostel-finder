const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const Booking = require("../models/Booking");
const Hostel = require("../models/Hostel");
const { protect } = require("../Middleware/authMiddleware");

const router = express.Router();

const seatLabels = {
  fourSeat: "4 Seat",
  threeSeat: "3 Seat",
  twoSeat: "2 Seat",
  singleRoom: "Single Room",
};

function createEsewaForm(booking) {
  const total_amount = String(booking.price);
  const transaction_uuid = booking._id.toString();
  const product_code = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
  const signed_field_names = "total_amount,transaction_uuid,product_code";

  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

  const signature = crypto
    .createHmac("sha256", process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q")
    .update(message)
    .digest("base64");

  return {
    action: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    fields: {
      amount: total_amount,
      tax_amount: "0",
      total_amount,
      transaction_uuid,
      product_code,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${process.env.FRONTEND_URL}/payment-success?gateway=esewa&bookingId=${booking._id}`,
      failure_url: `${process.env.FRONTEND_URL}/payment-failure?bookingId=${booking._id}`,
      signed_field_names,
      signature,
    },
  };
}

async function createKhaltiPayment(booking) {
  const secretKey = process.env.KHALTI_SECRET_KEY;

  const { data } = await axios.post(
    "https://a.khalti.com/api/v2/epayment/initiate/",
    {
      return_url: `${process.env.FRONTEND_URL}/payment-success?gateway=khalti`,
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
        Authorization: `Key ${secretKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  booking.pidx = data.pidx;
  await booking.save();

  return data.payment_url;
}

router.post("/", protect, async (req, res) => {
  try {
    const { hostelId, customerName, phone, seatType, paymentMethod } = req.body;

    if (!customerName || customerName.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

    const duplicate = await Booking.findOne({
      user: req.user._id,
      hostel: hostelId,
      paymentStatus: { $in: ["Paid", "Pending"] },
    });

    if (duplicate) {
      return res.status(400).json({
        message: "You already booked this hostel",
      });
    }

    const hostel = await Hostel.findById(hostelId);

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    const seat = hostel.seatPricing[seatType];

    if (!seat || seat.available <= 0) {
      return res.status(400).json({ message: "Seat not available" });
    }

    seat.available -= 1;
    await hostel.save();

    const booking = await Booking.create({
      user: req.user._id,
      hostel: hostel._id,
      hostelName: hostel.name,
      customerName,
      phone,
      seatType,
      seatLabel: seatLabels[seatType] || seatType,
      price: seat.price,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash" ? "Pending" : "Pending",
    });

    if (paymentMethod === "eSewa") {
      return res.status(201).json({
        booking,
        esewaForm: createEsewaForm(booking),
      });
    }

    if (paymentMethod === "Khalti") {
      if (
        !process.env.KHALTI_SECRET_KEY ||
        process.env.KHALTI_SECRET_KEY.includes("YOUR_")
      ) {
        return res.status(400).json({
          message: "Khalti secret key missing in .env",
        });
      }

      const redirectUrl = await createKhaltiPayment(booking);

      return res.status(201).json({
        booking,
        redirectUrl,
      });
    }

    res.status(201).json({ booking });
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/mine", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { customerName, phone, seatType, paymentMethod } = req.body;

    if (!customerName || customerName.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking || booking.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const hostel = await Hostel.findById(booking.hostel);

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    if (seatType && seatType !== booking.seatType) {
      if (hostel.seatPricing[booking.seatType]) {
        hostel.seatPricing[booking.seatType].available += 1;
      }

      const newSeat = hostel.seatPricing[seatType];

      if (!newSeat || newSeat.available <= 0) {
        if (hostel.seatPricing[booking.seatType]) {
          hostel.seatPricing[booking.seatType].available -= 1;
        }

        return res.status(400).json({
          message: "New seat not available",
        });
      }

      newSeat.available -= 1;

      booking.seatType = seatType;
      booking.seatLabel = seatLabels[seatType] || seatType;
      booking.price = newSeat.price;
    }

    booking.customerName = customerName;
    booking.phone = phone;

    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
    }

    await hostel.save();
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
});

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
    console.error(error);
    res.status(500).json({ message: "Delete failed" });
  }
});

router.post("/esewa/mark-paid", async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.paymentStatus = "Paid";
    booking.transactionId = "ESEWA-" + Date.now();

    await booking.save();

    res.json({
      message: "eSewa payment successful",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "eSewa payment verification failed",
    });
  }
});

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
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
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

    booking.paymentStatus =
      data.status === "Completed" ? "Paid" : "Failed";

    booking.transactionId = data.transaction_id || "";

    await booking.save();

    res.json({
      message: "Khalti payment verified",
      booking,
    });
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({
      message: "Khalti verification failed",
    });
  }
});

module.exports = router;