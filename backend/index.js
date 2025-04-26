const express = require("express");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Database connections
// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Connect to Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Define Mongoose Schema
const dogSchema = new mongoose.Schema({
  imageUrl: String,
  type: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  age: String,
  email: String,
  phone: String,
  timestamp: Date,
});

// Create geospatial index
dogSchema.index({ location: "2dsphere" });
const Dog = mongoose.model("Dog", dogSchema);

app.use(cors());
app.use(express.json());

// Existing file upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { data, error } = await supabase.storage
      .from("bucket1")
      .upload(
        `uploads/${Date.now()}-${req.file.originalname}`,
        req.file.buffer,
        {
          contentType: req.file.mimetype,
          cacheControl: "3600",
        }
      );

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({ error: "File upload failed" });
    }

    const { data: urlData } = supabase.storage
      .from("bucket1")
      .getPublicUrl(data.path);

    res.json({ downloadUrl: urlData.publicUrl });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New route to save dog data
app.post("/api/dogs", async (req, res) => {
  try {
    const dogData = {
      ...req.body,
      location: {
        type: "Point",
        coordinates: [req.body.location.lng, req.body.location.lat],
      },
      timestamp: new Date(),
    };

    const newDog = new Dog(dogData);
    await newDog.save();

    res.status(201).json(newDog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add near the bottom, before app.listen()
app.get("/api/dogs/nearby", async (req, res) => {
  try {
    const { lat, lng, maxDistance = 100000, type } = req.query;

    const query = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(maxDistance),
        },
      },
    };

    if (type) query.type = type;

    const dogs = await Dog.find(query);
    res.json(dogs);
  } catch (error) {
    console.error("Error fetching dogs:", error);
    res.status(500).json({ message: "Error fetching nearby dogs" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
