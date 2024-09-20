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
  res.json({ message: "API is running" });
});

// Define a Mongoose schema and model for requests
const requestSchema = new mongoose.Schema({
  referenceNumber: String,
  timestamp: String,
  email: String, // Email of the client making the request
  name: String, // Name of the client making the request
  typeOfClient: String,
  classification: String,
  projectTitle: String,
  philgepsReferenceNumber: String,
  productType: String,
  requestType: String,
  dateNeeded: String,
  specialInstructions: String,
  assignedTo: String, // Name of the evaluator, e.g., 'Caryl Apa'
  status: Number, // 0 = Pending, 1 = Ongoing, 2 = Completed
});

const Request = mongoose.model('Request', requestSchema);

// GET all requests or filter by assignedTo (e.g., for CarylDashboard)
// GET all requests or filter by assignedTo (e.g., for CarylDashboard)
app.get("/api/requests", async (req, res) => {
  try {
    const { assignedTo } = req.query; // Extract 'assignedTo' from query params
    
    let filter = {};
    if (assignedTo) {
      // Filter requests assigned to the given team member, exclude unassigned ones (null, empty string)
      filter = {
        assignedTo: { 
          $eq: assignedTo, 
          $ne: "", // Exclude empty strings
          $exists: true // Exclude null values
        }
      };
    }

    const requests = await Request.find(filter); // Fetch filtered or all requests
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
});

// POST a new request (for request creation)
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
    await request.save(); // Save the new request to the database
    res.status(201).json(request); // Respond with the created request
  } catch (error) {
    res.status(500).json({ message: "Error creating request" });
  }
});

// PUT request to update an existing request (for updating status or assignedTo)
app.put("/api/requests/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    const updateData = req.body;

    const updatedRequest = await Request.findByIdAndUpdate(requestId, updateData, { new: true });

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(updatedRequest); // Respond with the updated request
  } catch (error) {
    res.status(500).json({ message: "Error updating request" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
