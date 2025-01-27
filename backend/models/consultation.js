const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    currentIllness: {
        type: String,
        required: true
    },
    recentSurgery: {
        type: String
    },
    surgeryTimespan: {
        type: String
    },
    isDiabetic: {
        type: Boolean,
        required: true
    },
    allergies: {
        type: String
    },
    otherConditions: {
        type: String
    },
    transactionId: {
        type: String,
        required: true
    },
    prescription: {
        careToBeTaken: String,
        medicines: String,
        pdfUrl: String,
        updatedAt: Date
    },
    status: {
        type: String,
        enum: ['pending', 'prescribed', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Consultation', consultationSchema);
