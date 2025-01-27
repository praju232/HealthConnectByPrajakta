const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/appointment');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Get all consultations
router.get('/', auth, async (req, res) => {
  try {
    const consultations = await Appointment.find()
      .populate('doctorId')
      .populate('patientId')
      .sort({ dateTime: -1 });
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get consultation by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const consultation = await Appointment.findById(req.params.id)
      .populate('doctorId')
      .populate('patientId');
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Book new consultation
router.post('/', auth, async (req, res) => {
  try {
    const consultation = new Appointment({
      doctorId: req.body.doctorId,
      patientId: req.user.id, // Assuming auth middleware sets req.user
      dateTime: req.body.dateTime,
      reason: req.body.reason,
      notes: req.body.notes,
      status: 'scheduled'
    });

    await consultation.save();
    
    const populatedConsultation = await Appointment.findById(consultation._id)
      .populate('doctorId')
      .populate('patientId');

    res.status(201).json(populatedConsultation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update consultation
router.put('/:id', auth, async (req, res) => {
  try {
    const consultation = await Appointment.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Update allowed fields
    if (req.body.dateTime) consultation.dateTime = req.body.dateTime;
    if (req.body.reason) consultation.reason = req.body.reason;
    if (req.body.notes) consultation.notes = req.body.notes;
    if (req.body.status) consultation.status = req.body.status;

    await consultation.save();
    
    const updatedConsultation = await Appointment.findById(req.params.id)
      .populate('doctorId')
      .populate('patientId');

    res.json(updatedConsultation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel consultation
router.delete('/:id', auth, async (req, res) => {
  try {
    const consultation = await Appointment.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    consultation.status = 'cancelled';
    await consultation.save();

    res.json({ message: 'Consultation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update prescription
router.put('/:id/prescription', async (req, res) => {
    try {
        const { careToBeTaken, medicines } = req.body;
        const consultation = await Appointment.findById(req.params.id);
        
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        // Generate PDF
        const doc = new PDFDocument();
        const pdfPath = path.join('uploads', 'prescriptions', `${consultation._id}.pdf`);
        const writeStream = fs.createWriteStream(pdfPath);
        
        doc.pipe(writeStream);
        
        // Add content to PDF
        doc.fontSize(20).text('Prescription', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.text('Care to be taken:');
        doc.text(careToBeTaken);
        doc.moveDown();
        doc.text('Medicines:');
        doc.text(medicines);
        
        doc.end();

        // Update consultation
        consultation.prescription = {
            careToBeTaken,
            medicines,
            pdfUrl: pdfPath,
            updatedAt: new Date()
        };
        consultation.status = 'prescribed';
        
        await consultation.save();
        res.json(consultation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
