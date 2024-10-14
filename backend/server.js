const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB using the connection string from .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Ensure the uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors({
  origin: 'http://localhost:3003', // Update with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve uploaded files statically from the uploads folder
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Add timestamp to filename
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf/; // Allowed file types
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File type not supported!"), false);
  }
});

// Define a Mongoose schema and model for requests
const requestSchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true },
  timestamp: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  typeOfClient: String,
  classification: String,
  projectTitle: String,
  philgepsReferenceNumber: String,
  productType: String,
  requestType: String,
  dateNeeded: String,
  specialInstructions: String,
  assignedTo: String,  // Add this to store the assigned team member
  status: { type: Number, default: 0 }, // Default to Pending
  fileUrl: String,  // URL to the evaluator's uploaded file
  fileName: String, // Original evaluator file name
  requesterFileUrl: String,  // URL to the requester's uploaded file
  requesterFileName: String,  // Original requester file name
  completedAt: Date // New field to store the date when the request is marked as completed
});

const Request = mongoose.model('Request', requestSchema);

// Define a Mongoose schema and model for team members
const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  openTasks: { type: Number, required: true },
  closedTasks: { type: Number, required: true },
  completionRate: { type: Number, required: true },
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

// API routes

// Root route to check if the API is running
app.get("/api", (req, res) => {
  res.json({ message: "API is running" });
});

// GET all requests or filter by assignedTo
app.get("/api/requests", async (req, res) => {
  try {
    const { assignedTo } = req.query;
    const filter = assignedTo ? { assignedTo } : {};
    const requests = await Request.find(filter);
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
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
    console.error("Error creating request:", error);
    res.status(500).json({ message: "Error creating request" });
  }
});

// PUT request to update an existing request
app.put("/api/requests/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status, completedAt, assignedTo } = req.body; // Get status, completedAt, and assignedTo from the request body

    // If the status is marked as "Completed", store the completedAt field
    const updateData = { status, assignedTo };
    if (status === 2 && completedAt) {
      updateData.completedAt = completedAt;
    }

    const updatedRequest = await Request.findByIdAndUpdate(requestId, updateData, { new: true });

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ message: "Error updating request" });
  }
});

// DELETE a request by ID
app.delete("/api/requests/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    const deletedRequest = await Request.findByIdAndDelete(requestId);

    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ message: "Error deleting request" });
  }
});

// GET all team members
app.get("/api/teamMembers", async (req, res) => {
  try {
    const teamMembers = await TeamMember.find(); // Fetch all team members from the database
    res.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ message: "Error fetching team members" });
  }
});

// New endpoint to calculate and send task stats for team members
app.get("/api/teamMembers/stats", async (req, res) => {
  try {
    // Fetch all requests
    const requests = await Request.find();

    // Create a map to hold the task stats for each team member
    const memberStats = {};

    requests.forEach((request) => {
      const assignedMember = request.assignedTo;
      if (assignedMember) {
        if (!memberStats[assignedMember]) {
          memberStats[assignedMember] = { openTasks: 0, closedTasks: 0 };
        }
        
        // Increment open or closed tasks based on the request status
        if (request.status === 0) {
          memberStats[assignedMember].openTasks += 1; // Pending
        } else if (request.status === 2) {
          memberStats[assignedMember].closedTasks += 1; // Completed
        }
      }
    });

    // Format the response data
    const response = Object.keys(memberStats).map(name => ({
      name,
      openTasks: memberStats[name].openTasks,
      closedTasks: memberStats[name].closedTasks,
      completionRate: memberStats[name].closedTasks + memberStats[name].openTasks > 0
        ? Math.round((memberStats[name].closedTasks / (memberStats[name].closedTasks + memberStats[name].openTasks)) * 100)
        : 0,
    }));

    res.json(response);
  } catch (error) {
    console.error("Error fetching team member stats:", error);
    res.status(500).json({ message: "Error fetching team member stats" });
  }
});

// File upload route for evaluator
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    console.log('No file received');
    return res.status(400).json({ message: "No file uploaded" });
  }

  console.log('File received:', req.file);
  const filePath = `/uploads/${req.file.filename}`;

  try {
    const requestId = req.body.requestId;

    // Update the request with file path and file name for evaluator
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { 
        fileUrl: filePath,
        fileName: req.file.originalname 
      },
      { new: true }
    );
    
    if (!updatedRequest) {
      console.log('Request not found');
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
});

// New File upload route for requester
app.post('/api/requester/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = `/uploads/${req.file.filename}`;

  try {
    const requestId = req.body.requestId;

    // Update the request with file path and file name for requester
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { 
        requesterFileUrl: filePath,
        requesterFileName: req.file.originalname 
      },
      { new: true }
    );
    
    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
});

// File download route
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, filename, (downloadError) => {
      if (downloadError) {
        console.error('Error downloading file:', downloadError);
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
