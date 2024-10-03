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
  origin: 'http://localhost:3000', // Update with your frontend URL
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
  assignedTo: String,
  status: { type: Number, default: 0 }, // Default to Pending
  fileUrl: String,  // URL to the uploaded file
  fileName: String   // Original file name
});

const Request = mongoose.model('Request', requestSchema);

// Define a Mongoose schema and model for files
const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  filePath: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

const FileModel = mongoose.model('File', fileSchema);

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
    const updatedRequest = await Request.findByIdAndUpdate(requestId, req.body, { new: true });

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

// Existing file upload route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    console.log('No file received');
    return res.status(400).json({ message: "No file uploaded" });
  }

  console.log('File received:', req.file);
  const filePath = `/uploads/${req.file.filename}`;

  try {
    const requestId = req.body.requestId;

    // Update the request with file path and file name
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

// File upload route
app.post('/api/upload/file', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = `/uploads/${req.file.filename}`;

  try {
    const newFileRecord = new FileModel({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      filePath,
    });

    await newFileRecord.save(); // Save to the database

    res.status(201).json({
      message: "File uploaded successfully",
      file: newFileRecord,
    });
  } catch (error) {
    console.error("Error saving file information:", error);
    res.status(500).json({ message: "Error saving file information" });
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
