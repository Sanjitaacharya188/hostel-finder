import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

const initialForm = {
  name: "",
  location: "",
  image: "",
  description: "",
  rating: 4.2,
  facilities: "WiFi,Food,Laundry,CCTV",
  seatPricing: {
    fourSeat: { price: 10000, available: 5 },
    threeSeat: { price: 11000, available: 4 },
    twoSeat: { price: 12000, available: 3 },
    singleRoom: { price: 18000, available: 2 },
  },
};

export default function AdminDashboard() {
  const [hostels, setHostels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    try {
      const { data } = await api.get("/hostels");
      setHostels(data);
    } catch (error) {
      toast.error("Failed to load hostels");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        facilities: form.facilities
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      };

      if (editingId) {
        await api.put(`/admin/hostels/${editingId}`, payload);
        toast.success("Hostel updated");
      } else {
        await api.post("/admin/hostels", payload);
        toast.success("Hostel added");
      }

      setForm(initialForm);
      setEditingId(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const edit = (h) => {
    setEditingId(h._id);
    setForm({
      name: h.name || "",
      location: h.location || "",
      image: h.image || "",
      description: h.description || "",
      rating: h.rating || 4.2,
      facilities: Array.isArray(h.facilities)
        ? h.facilities.join(",")
        : "WiFi,Food,Laundry,CCTV",
      seatPricing: h.seatPricing || {
        fourSeat: { price: 10000, available: 5 },
        threeSeat: { price: 11000, available: 4 },
        twoSeat: { price: 12000, available: 3 },
        singleRoom: { price: 18000, available: 2 },
      },
    });
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/hostels/${id}`);
      toast.success("Hostel deleted");
      load();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>

      <form className="card admin-form" onSubmit={submit}>
        <h2>{editingId ? "Edit Hostel" : "Add Hostel"}</h2>

        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <input
          type="text"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="number"
          step="0.1"
          placeholder="Rating"
          value={form.rating}
          onChange={(e) =>
            setForm({ ...form, rating: Number(e.target.value) })
          }
        />

        <input
          type="text"
          placeholder="Facilities comma separated"
          value={form.facilities}
          onChange={(e) => setForm({ ...form, facilities: e.target.value })}
        />

        <button type="submit">
          {editingId ? "Update Hostel" : "Add Hostel"}
        </button>
      </form>

      <div className="grid">
        {hostels.map((h) => (
          <div className="card hostel-card" key={h._id}>
            <img src={h.image} alt={h.name} />
            <h3>{h.name}</h3>
            <p>{h.location}</p>

            <div className="row gap">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => edit(h)}
              >
                Edit
              </button>

              <button
                type="button"
                className="danger-btn"
                onClick={() => remove(h._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}