const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 5000; // Use the PORT from .env or default to 5000

// Connect to MongoDB using the connection string from .env
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from the frontend
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type'],
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Root route to check if the API is running
app.get("/api", (req, res) => {
  res.json({ message: "API is running" });
});

// Define a Mongoose schema and model for requests
const requestSchema = new mongoose.Schema({
  referenceNumber: String,
  timestamp: String,
  email: String,
  name: String,
  typeOfClient: String,
  classification: String,
  projectTitle: String,
  philgepsReferenceNumber: String,
  productType: String,
  requestType: String,
  dateNeeded: String,
  specialInstructions: String,
  assignedTo: String,
  status: Number, // 0 = Pending, 1 = Ongoing, 2 = Completed
});

const Request = mongoose.model('Request', requestSchema);

// GET all requests or filter by assignedTo
app.get("/api/requests", async (req, res) => {
  try {
    const { assignedTo } = req.query;
    let filter = {};
    
    if (assignedTo) {
      filter = {
        assignedTo: {
          $eq: assignedTo,
          $ne: "",
          $exists: true
        }
      };
    }

    const requests = await Request.find(filter);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
});

// POST a new request
app.post("/api/requests", async (req, res) => {
  try {
    const newRequest = req.body;
    const newReferenceNumber = Math.floor(1000 + Math.random() * 9000).toString(); // Generate random reference number
    const timestamp = new Date().toLocaleString();

    const formattedRequest = {
      referenceNumber: newReferenceNumber,
      timestamp,
      ...newRequest,
    };

    const request = new Request(formattedRequest);
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error creating request" });
  }
});

// PUT request to update an existing request
app.put("/api/requests/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    const updateData = req.body;

    const updatedRequest = await Request.findByIdAndUpdate(requestId, updateData, { new: true });

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: "Error updating request" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
