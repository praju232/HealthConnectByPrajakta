const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Consultation = require('../models/consultation');
const Appointment = require('../models/appointment');


// Ensure uploads/doctors directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'doctors');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for profile pictures
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

// Doctor signup
router.post('/signup', upload.single('profilePicture'), async (req, res) => {
    try {
        const { name, specialty, email, phoneNumber, yearsOfExperience, consultationFee, password ,upiId} = req.body;
        
        // Check if email or phone already exists
        const existingDoctor = await Doctor.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingDoctor) {
            return res.status(400).json({ message: 'Email or phone number already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new doctor with relative path for profile picture
        const doctor = new Doctor({
            name,
            specialty,
            email,
            phoneNumber,
            yearsOfExperience: Number(yearsOfExperience),
            consultationFee: Number(consultationFee),
            password: hashedPassword,
            upiId,
            profilePicture: req.file ? '/uploads/doctors/' + path.basename(req.file.path) : '/uploads/doctors/default-doctor.png'
        });

        await doctor.save();

        // Generate JWT token
        const token = jwt.sign(
            { doctorId: doctor._id, email: doctor.email },
            'your_jwt_secret',  
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'Doctor registered successfully',
            token,
            doctorId: doctor._id
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error registering doctor', error: error.message });
    }
});

// Doctor signin
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const doctor = await Doctor.findOne({ email });
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const validPassword = await bcrypt.compare(password, doctor.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: doctor._id }, 'your_jwt_secret');
        res.json({ token, doctorId: doctor._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all doctors
router.get('/', auth, async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .select('-password')
            .lean()
            .exec();
         // Debug: Check if files exist
         doctors.forEach(doctor => {
            const filePath = path.join(__dirname, '..', doctor.profilePicture);
            console.log(`Checking file: ${filePath}`);
            console.log(`File exists: ${fs.existsSync(filePath)}`);
        });
   
        // Add full URL for profile pictures
        const doctorsWithFullUrls = doctors.map(doctor => ({
            ...doctor,
            profilePicture: doctor.profilePicture ? `http://localhost:3000${doctor.profilePicture}` : null
        }));
        
        res.json(doctorsWithFullUrls);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get doctor stats
router.get('/stats', auth, async (req, res) => {
  try {
    const doctorId = req.user.id;  // Get ID from auth token
    
    if (!doctorId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get total appointments
    const totalAppointments = await Appointment.countDocuments({ doctorId });

    // Get unique patients count
const totalPatients = await Consultation.distinct('patientId');
const totalPatientsCount = totalPatients.length;
    // Calculate total earnings (you may need to adjust this based on your schema)
    const consultations = await Doctor.findById(req.user.id)
    console.log(consultations,"consultations");
const totalEarnings = totalAppointments*consultations.consultationFee
    res.json({
      totalPatientsCount,
      totalAppointments,
      totalEarnings
    });

  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get appointments by doctor ID - Move this BEFORE /:id route
router.get('/appointments', auth, async (req, res) => {
    try {
        const doctorId = req.query.doctorId;
        if (!doctorId) {
            return res.status(400).json({ message: 'Doctor ID is required' });
        }

        const consultations = await Appointment.find({ doctorId })
            .populate('patientId')
            .sort({ createdAt: -1 });

        res.json(consultations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// get appointment by patient id
router.get('/appointments/:patientId', auth, async (req, res) => {
    try {
        const patientId = req.params.patientId;
        if (!patientId) {
            return res.status(400).json({ message: 'Patient ID is required' });
        }

        const consultations = await Consultation.find({ patientId })
            .populate('doctorId')
            .sort({ createdAt: -1 });
        
        res.json(consultations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get doctor profile
router.get('/profile', auth, async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.user.id)
        .select('-password')
        .lean()
        .exec();
      
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      // Add full URL for profile picture
      const doctorWithFullUrl = {
        ...doctor,
        profilePicture: doctor.profilePicture ? `http://localhost:3000${doctor.profilePicture}` : null
      };
  
      res.json(doctorWithFullUrl);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
// Get doctor by ID - Keep this LAST
router.get('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select('-password')
      .lean();
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Add full URL for profile picture
    const doctorWithFullUrl = {
      ...doctor,
      profilePicture: doctor.profilePicture ? 
        `http://localhost:3000${doctor.profilePicture}` : 
        'http://localhost:3000/uploads/doctors/default-doctor.png'
    };

    res.json(doctorWithFullUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
