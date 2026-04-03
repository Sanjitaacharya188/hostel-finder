import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "hostel_finder_secret_key";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hostelDB")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const reviewSchema = new mongoose.Schema({
  userName: String,
  comment: String,
  rating: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const hostelSchema = new mongoose.Schema({
  name: String,
  location: String,
  price: Number,
  rating: {
    type: Number,
    default: 0,
  },
  image: String,
  mapLink: String,
  reviews: [reviewSchema],
});

const bookingSchema = new mongoose.Schema({
  userId: String,
  hostelName: String,
  studentName: String,
  phone: String,
  paymentMethod: String,
  paymentStatus: String,
  date: {
    type: String,
    default: () => new Date().toLocaleString(),
  },
});

const User = mongoose.model("User", userSchema);
const Hostel = mongoose.model("Hostel", hostelSchema, "hostels");
const Booking = mongoose.model("Booking", bookingSchema, "bookings");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/api", (req, res) => {
  res.send("Backend running");
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.trim() });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    await User.create({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
    });

    res.json({ message: "Registration successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/hostels", async (req, res) => {
  try {
    const hostels = await Hostel.find().sort({ price: 1 });
    res.json(hostels);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to load hostels" });
  }
});

app.post("/api/hostels", upload.single("image"), async (req, res) => {
  try {
    const { name, location, price, mapLink } = req.body;

    if (!name || !location || !price) {
      return res.status(400).json({ message: "Name, location and price are required" });
    }

    const image = req.file
      ? `/uploads/${req.file.filename}`
      : "https://via.placeholder.com/800x500?text=No+Image";

    const hostel = await Hostel.create({
      name: name.trim(),
      location: location.trim(),
      price: Number(price),
      mapLink: mapLink?.trim() || "",
      image,
      reviews: [],
      rating: 0,
    });

    res.json({
      message: "Hostel added successfully",
      hostel,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add hostel" });
  }
});

app.get("/api/seed-hostels", async (req, res) => {
  try {
    const count = await Hostel.countDocuments();

    if (count > 0) {
      return res.json({ message: "Hostels already seeded" });
    }

    await Hostel.insertMany([
      {
        name: "Everest Hostel",
        location: "Kathmandu",
        price: 8000,
        rating: 4.2,
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=80",
        mapLink: "https://maps.google.com/?q=Kathmandu",
        reviews: [],
      },
      {
        name: "Peace Hostel",
        location: "Lalitpur",
        price: 7500,
        rating: 4.0,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
        mapLink: "https://maps.google.com/?q=Lalitpur",
        reviews: [],
      },
      {
        name: "Sunrise Hostel",
        location: "Bhaktapur",
        price: 9000,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
        mapLink: "https://maps.google.com/?q=Bhaktapur",
        reviews: [],
      },
    ]);

    res.json({ message: "Hostels seeded successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Seed failed" });
  }
});

app.post("/api/hostels/:id/reviews", verifyToken, async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    if (!comment?.trim() || !rating) {
      return res.status(400).json({ message: "Comment and rating are required" });
    }

    const numericRating = Number(rating);

    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const alreadyReviewed = hostel.reviews.find((r) => r.userName === req.user.name);
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You already reviewed this hostel" });
    }

    hostel.reviews.push({
      userName: req.user.name,
      comment: comment.trim(),
      rating: numericRating,
    });

    const avg =
      hostel.reviews.reduce((sum, r) => sum + r.rating, 0) / hostel.reviews.length;

    hostel.rating = Number(avg.toFixed(1));

    await hostel.save();

    res.json({
      message: "Review added successfully",
      hostel,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Review failed" });
  }
});

app.post("/api/book", verifyToken, async (req, res) => {
  try {
    const { hostelName, studentName, phone, paymentMethod, paymentStatus } = req.body;

    if (!hostelName || !studentName || !phone || !paymentMethod) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const cleanName = studentName.trim();
    const cleanPhone = phone.trim();

    if (!/^[A-Za-z\s]+$/.test(cleanName)) {
      return res.status(400).json({ message: "Name must contain only letters" });
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    const hostelExists = await Hostel.findOne({ name: hostelName });

    if (!hostelExists) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    const alreadyBooked = await Booking.findOne({
      hostelName,
      phone: cleanPhone,
      userId: req.user.id,
    });

    if (alreadyBooked) {
      return res.status(400).json({
        message: "You already booked this hostel with this phone number",
      });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      hostelName,
      studentName: cleanName,
      phone: cleanPhone,
      paymentMethod,
      paymentStatus: paymentStatus || "Paid",
    });

    res.json({
      message: `${hostelName} booked successfully.`,
      booking,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Booking failed" });
  }
});

app.get("/api/bookings", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ _id: -1 });
    res.json(bookings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to load bookings" });
  }
});

app.put("/api/bookings/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, phone } = req.body;

    const booking = await Booking.findOne({ _id: id, userId: req.user.id });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const cleanName = studentName.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanPhone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!/^[A-Za-z\s]+$/.test(cleanName)) {
      return res.status(400).json({ message: "Name must contain only letters" });
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    const duplicateBooking = await Booking.findOne({
      _id: { $ne: id },
      hostelName: booking.hostelName,
      phone: cleanPhone,
      userId: req.user.id,
    });

    if (duplicateBooking) {
      return res.status(400).json({
        message: "Same phone already used for this hostel",
      });
    }

    booking.studentName = cleanName;
    booking.phone = cleanPhone;
    await booking.save();

    res.json({
      message: "Booking updated successfully",
      booking,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Update failed" });
  }
});

app.delete("/api/bookings/:id", verifyToken, async (req, res) => {
  try {
    const deletedBooking = await Booking.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

/* frontend build serve */
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});