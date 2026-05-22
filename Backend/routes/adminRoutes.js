const express = require("express");
const Hostel = require("../models/Hostel");
const { protect } = require("../Middleware/authMiddleware");
const { adminOnly } = require("../Middleware/adminMiddleware");

const router = express.Router();

router.use(protect, adminOnly);

router.post("/hostels", async (req, res) => {
  try {
    const hostel = await Hostel.create(req.body);
    res.status(201).json(hostel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create hostel" });
  }
});

router.put("/hostels/:id", async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    res.json(hostel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update hostel" });
  }
});

router.delete("/hostels/:id", async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    await hostel.deleteOne();
    res.json({ message: "Hostel removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete hostel" });
  }
});

module.exports = router;