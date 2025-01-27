const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    profilePicture: {
        type: String,
        required: false 
    },
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    surgeryHistory: {
        type: String,
        required: false
    },
    illnessHistory: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
