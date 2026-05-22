const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./Middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const hostelRoutes = require("./routes/hostelRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const Hostel = require("./models/Hostel");
const { protect } = require("./Middleware/authMiddleware");
const { adminOnly } = require("./Middleware/adminMiddleware");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/seed-hostels", async (req, res) => {
  try {
    await Hostel.deleteMany();

    const data = [
  {
    name: "Hamro Swarnim Sansar Girls Hostel",
    location: "Buddhanagar",
    image: "/assets/hostel3.jpg",
    description: "Safe and secure girls hostel.",
    rating: 4.8,
    facilities: ["WiFi", "Food", "Laundry", "CCTV"],
    seatPricing: {
      fourSeat: { price: 10500, available: 5 },
      threeSeat: { price: 12000, available: 4 },
      twoSeat: { price: 13500, available: 3 },
      singleRoom: { price: 19000, available: 2 },
    },
  },
  {
    name: "Peace Hostel",
    location: "Lalitpur",
    image: "/assets/hostel2.png",
    description: "Comfortable and student-friendly hostel in Lalitpur.",
    rating: 4.0,
    facilities: ["WiFi", "Food", "Laundry", "CCTV"],
    seatPricing: {
      fourSeat: { price: 10000, available: 5 },
      threeSeat: { price: 11000, available: 4 },
      twoSeat: { price: 12000, available: 3 },
      singleRoom: { price: 18000, available: 2 },
    },
  },
  {
    name: "Everest Hostel",
    location: "Kathmandu",
    image: "/assets/hostel4.jpg",
    description: "Affordable hostel near city center.",
    rating: 4.2,
    facilities: ["WiFi", "Food", "Laundry", "Parking"],
    seatPricing: {
      fourSeat: { price: 9500, available: 6 },
      threeSeat: { price: 11000, available: 5 },
      twoSeat: { price: 12500, available: 3 },
      singleRoom: { price: 17000, available: 2 },
    },
  },
  {
    name: "Student Stay Hub",
    location: "Pokhara",
    image: "/assets/hero.png",
    description: "Peaceful environment for students.",
    rating: 4.4,
    facilities: ["WiFi", "Food", "Laundry", "Parking"],
    seatPricing: {
      fourSeat: { price: 9000, available: 7 },
      threeSeat: { price: 10500, available: 5 },
      twoSeat: { price: 12000, available: 4 },
      singleRoom: { price: 16500, available: 2 },
    },
  },
];
    const hostels = await Hostel.insertMany(data);
    res.json(hostels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to seed hostels" });
  }
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});