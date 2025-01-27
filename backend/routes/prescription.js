const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const Prescription = require('../models/prescription')
require('dotenv').config();
const nodemailer = require('nodemailer');
const multer = require('multer');

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // Use memory storage

/// Endpoint to send email with PDF attachment
router.post('/send', upload.single('pdf'), async (req, res) => {
  try {
      const { appointmentId, notes } = req.body;

      if (!req.file || !req.file.buffer) {
          return res.status(400).json({ message: 'No PDF file uploaded or file buffer is missing' });
      }
    console.log(req.file.buffer,"buffer");
    

      const prescription = await Prescription.findOne({ appointmentId }).populate('patientId doctorId');

      if (!prescription) {
          console.log(`Prescription not found for appointmentId: ${appointmentId}`);
          return res.status(404).json({ message: 'Prescription not found' });
      }

      // Email logic
      const emailData = {
          to: prescription.patientId.email,
          subject: 'Your Medical Prescription',
          text: `Dear ${prescription.patientId.name},\n\n` +
                `Your prescription from Dr. ${prescription.doctorId.name} is attached.\n\n` +
                `Notes: ${notes || 'No additional notes provided'}\n\n` +
                `Best regards,\nYour Healthcare Team`,
          attachments: [
              {
                  filename: req.file.originalname,
                  content: req.file.buffer, // Use the uploaded file
              },
          ],
      };

      await sendEmail(emailData); // Ensure sendEmail is implemented correctly

      res.json({ message: 'Prescription sent successfully!' });
  } catch (error) {
      console.error('Error sending prescription email:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});
  
// Download prescription
router.get('/:consultationId/download', async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ 
      appointmentId: req.params.consultationId 
    }).populate('doctorId patientId');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription._id}.pdf`);
    
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(16).text('Medical Prescription', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Doctor: ${prescription.doctorId.name}`);
    doc.text(`Patient: ${prescription.patientId.name}`);
    doc.moveDown();
    doc.text('Medications:');
    prescription.medications.forEach(med => {
      doc.text(`- ${med.name}: ${med.dosage}`);
    });
    doc.moveDown();
    // doc.text(`Diagnosis: ${prescription.diagnosis}`);
    // doc.text(`Notes: ${prescription.notes}`);
    
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send prescription to patient email
// router.post('/:consultationId/send', auth, async (req, res) => {
//   try {
//     const prescription = await Prescription.findOne({ 
//       appointmentId: req.params.consultationId 
//     }).populate('patientId doctorId');
    
//     if (!prescription) {
//       return res.status(404).json({ message: 'Prescription not found' });
//     }
//     console.log(prescription);

//     // Send email logic
//     const emailData = {
//       to: prescription.patientId.email,
//       subject: 'Your Medical Prescription',
//       text: `Dear ${prescription.patientId.name},\n\n` +
//             `Your prescription from Dr. ${prescription.doctorId.name} is attached.\n\n` +
//             `Care To Be Taken: ${prescription.patientId.careToBeTaken}\n` +
//             `Medications:\n${prescription.patientId.medicines}\n\n` +
//             // `Notes: ${prescription.notes}\n\n` +
//             `Best regards,\nYour Healthcare Team`
//     };
    
//     await sendEmail(emailData); // Implement sendEmail function using your preferred email service

//     res.json({ message: 'Prescription sent successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

async function sendEmail({ to, subject, text, attachments }) {
    console.log(process.env);
    
    try {
      const transporter = nodemailer.createTransport({
        service: 'Gmail', // or any other email service
        auth: {
          user: process.env.EMAIL_USER, // Your email
          pass: process.env.EMAIL_PASS  // Your email password or app-specific password
        },
        debug: true, // Enable debug output
        logger: true,
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER, // Sender email
        to,                             // Recipient email
        subject,                        // Email subject
        text,                           // Email body
        attachments         // Attachments
      };
  
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw error; // Re-throw error to handle it in the route
    }
  }
  
// Save or update prescription
router.post('/', auth, async (req, res) => {
    try {
      const {
        appointmentId,
        doctorId,
        patientId,
        careToBeTaken,
        medicines,
      } = req.body;
  
      // Validate required fields
      if (!appointmentId || !doctorId || !patientId || !careToBeTaken ) {
        return res.status(400).json({ message: 'Required fields are missing' });
      }
  
      // Check if a prescription already exists for the appointment
      let prescription = await Prescription.findOne({ appointmentId });
  
      if (prescription) {
        // Update the existing prescription
        prescription.careToBeTaken = careToBeTaken;
        prescription.medicines = medicines;
        // prescription.diagnosis = diagnosis;
        // prescription.notes = notes;
        prescription.updatedAt = Date.now();
  
        await prescription.save();
  
        return res.status(200).json({
          message: 'Prescription updated successfully',
          prescription,
        });
      } else {
        // Create a new prescription
        prescription = new Prescription({
          appointmentId,
          doctorId,
          patientId,
          careToBeTaken,
          medicines,
        //   diagnosis,
        //   notes,
        });
  
        await prescription.save();
  
        return res.status(201).json({
          message: 'Prescription created successfully',
          prescription,
        });
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
module.exports = router, sendEmail;
