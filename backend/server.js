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
  origin: 'http://localhost:3000', // Allow requests from frontend
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type'],
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Root route to check if the API is running
app.get("/api", (req, res) => {
  res.json({ message: "this is for backend" });
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
  status: Number,
});

const Request = mongoose.model('Request', requestSchema);


// GET all requests
app.get("/api/requests", async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
});

// POST a new request
app.post("/api/requests", async (req, res) => {
  try {
    const newRequest = req.body;
    const newReferenceNumber = Math.floor(1000 + Math.random() * 9000).toString();
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

// PUT - Update the status or other fields of a request
app.put("/api/requests/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    let updatedFields = req.body;

    // Handle the status conversion if the 'status' field is provided
    if (updatedFields.status) {
      if (updatedFields.status === 'Pending') {
        updatedFields.status = 0;
      } else if (updatedFields.status === 'Ongoing') {
        updatedFields.status = 1;
      } else if (updatedFields.status === 'Complete') {
        updatedFields.status = 2;
      }
    }

    // Log the incoming update for debugging purposes
    console.log(`Updating request ${requestId} with data:`, updatedFields);

    // Find the request by ID and update the specified fields
    const request = await Request.findByIdAndUpdate(
      requestId,
      { $set: updatedFields }, // Update the status field and any other provided fields
      { new: true, runValidators: true } // Return the updated document
    );

    if (request) {
      res.json(request); // Send back the updated request
    } else {
      res.status(404).json({ message: "Request not found" });
    }
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ message: "Error updating request" });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
