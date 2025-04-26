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
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      tls: true, // Add TLS for Atlas connection
      tlsAllowInvalidCertificates: false,
    });

    // Verify connection
    await mongoose.connection.db.admin().ping();
    console.log("✅ MongoDB connected and responsive");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Connection failed:", err);
    process.exit(1);
  }
};

startServer();
   

  

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
 

app.use(
  cors({
    origin: [
      "https://adoptindie.onrender.com", // Frontend (no hyphen)
      "http://localhost:5173", // For local development
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
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
    console.log(dogData);
    
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

    // Validate coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];

    const query = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coordinates,
          },
          $maxDistance: parseFloat(maxDistance),
        },
      },
    };

    if (type) query.type = type;

    console.log("Executing query:", JSON.stringify(query, null, 2));

    const dogs = await Dog.find(query).lean().exec();

    // Add transformation to fix _id and coordinates format
    const response = dogs.map((dog) => ({
      ...dog,
      _id: dog._id.toString(),
      location: {
        ...dog.location,
        coordinates: [dog.location.coordinates[0], dog.location.coordinates[1]],
      },
    }));

    res.json(response);
  } catch (error) {
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack,
      query: query, // Make sure to define query in the catch scope
    });
    res.status(500).json({
      message: "Error fetching nearby dogs",
      error: error.message,
    });
  }
});

 

const PORT = process.env.PORT || 5000;
 