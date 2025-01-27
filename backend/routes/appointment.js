const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/appointment');
const Prescription = require('../models/prescription');

// Get appointment details
router.get('/:appointmentId', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('doctorId')
      .populate('patientId');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save prescription for an appointment
router.post('/:appointmentId/prescription', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const prescription = new Prescription({
      appointmentId: req.params.appointmentId,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      medications: req.body.medications,
      diagnosis: req.body.diagnosis,
      notes: req.body.notes
    });

    await prescription.save();
    
    // Update appointment with prescription reference
    appointment.prescriptionId = prescription._id;
    await appointment.save();

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router
