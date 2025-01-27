const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
// Make sure the path is absolute
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const connectionString ="mongodb+srv://prajaktakamble232:prajaktakamble232@cluster0.q5yuc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(connectionString)
mongoose.set('strictQuery', true);

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');
const consultationRoutes = require('./routes/consultations');
const appointmentRoutes = require('./routes/appointment');
const prescriptionRoutes = require('./routes/prescription');
const router = require('./routes/patients');

// Mount routes - order matters for route matching
app.use('/api/doctors', doctorRoutes);  // This will handle all doctor routes including signup
app.use('/api/patients', patientRoutes);  // This will handle all patient routes
app.use('/api/consultations', consultationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const transporter = nodemailer.createTransport({
  // Configure your email service
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (emailData) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = router;
