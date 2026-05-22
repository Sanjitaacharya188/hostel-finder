const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, default: "Safe and affordable student hostel." },
    rating: { type: Number, default: 4.2 },
    facilities: {
      type: [String],
      default: ["WiFi", "Food", "Laundry", "CCTV"]
    },
    seatPricing: {
      fourSeat: { price: { type: Number, default: 10000 }, available: { type: Number, default: 5 } },
      threeSeat: { price: { type: Number, default: 11000 }, available: { type: Number, default: 4 } },
      twoSeat: { price: { type: Number, default: 12000 }, available: { type: Number, default: 3 } },
      singleRoom: { price: { type: Number, default: 18000 }, available: { type: Number, default: 2 } }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hostel", hostelSchema);