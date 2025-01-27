const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    profilePicture: {
        type: String,
        default: '/uploads/doctors/default-doctor.png'
    },
    name: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    yearsOfExperience: {
        type: Number,
        required: true
    },
    consultationFee: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    upiId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
