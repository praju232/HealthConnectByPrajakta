const express = require('express');
const router = express.Router();
const Patient = require('../models/patient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Multer configuration for profile pictures
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/patients');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Patient signup
router.post('/signup', upload.single('profilePicture'), async (req, res) => {
    try {
        const { name, age, email, phoneNumber, surgeryHistory, illnessHistory, password } = req.body;
        
        // Check if email or phone already exists
        const existingPatient = await Patient.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingPatient) {
            return res.status(400).json({ message: 'Email or phone number already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const patient = new Patient({
            name,
            age,
            email,
            phoneNumber,
            surgeryHistory,
            illnessHistory,
            password: hashedPassword
        });

        // Add profile picture path if a file was uploaded
        if (req.file) {
            patient.profilePicture = req.file.path.replace(/\\/g, '/');
        }

        await patient.save();
        res.status(201).json({ message: 'Patient registered successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Patient signin
router.post('/signin', express.json(), async (req, res) => {
    try {
        console.log('Signin request body:', req.body);
        const { email, password } = req.body;

        // Find patient by email only
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, patient.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate token
        const token = jwt.sign({ id: patient._id }, 'your_jwt_secret');
        
        // Send success response
        res.json({
            token,
            patientId: patient._id,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get patient by ID - only match if ID is a valid ObjectId
router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).select('-password');
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
//update patient profile
router.put('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        const { name, email, phoneNumber, surgeryHistory, illnessHistory, password } = req.body;
        patient.name = name;
        patient.email = email;
        patient.phoneNumber = phoneNumber;
        patient.surgeryHistory = surgeryHistory;
        patient.illnessHistory = illnessHistory;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            patient.password = hashedPassword;
        }
        if (req.file) {
            patient.profilePicture = req.file.path.replace(/\\/g, '/');
        }
        await patient.save();
        res.json({ message: 'Patient profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
