const express = require("express");
const Hostel = require("../models/Hostel");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      search = "",
      location = "",
      payment = "",
      seat = "",
      sort = "",
    } = req.query;

    let hostels = await Hostel.find();

    hostels = hostels.filter((h) => {
      const text = `${h.name} ${h.location}`.toLowerCase();
      const searchOk =
        text.includes(search.toLowerCase()) &&
        text.includes(location.toLowerCase());

      let seatOk = true;
      if (seat) {
        const map = {
          fourSeat: h.seatPricing?.fourSeat?.available || 0,
          threeSeat: h.seatPricing?.threeSeat?.available || 0,
          twoSeat: h.seatPricing?.twoSeat?.available || 0,
          singleRoom: h.seatPricing?.singleRoom?.available || 0,
        };
        seatOk = map[seat] > 0;
      }

      let paymentOk = true;
      if (payment) {
        paymentOk = ["Cash", "eSewa", "Khalti"].includes(payment);
      }

      return searchOk && seatOk && paymentOk;
    });

    if (sort === "priceLow") {
      hostels.sort(
        (a, b) =>
          (a.seatPricing?.fourSeat?.price || 0) -
          (b.seatPricing?.fourSeat?.price || 0)
      );
    }

    if (sort === "ratingHigh") {
      hostels.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    res.json(hostels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch hostels" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    res.json(hostel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch hostel" });
  }
});

module.exports = router;