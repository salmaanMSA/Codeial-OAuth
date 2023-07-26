const mongoose = require('mongoose');


const PasswordResetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    access_token: {
        type: String,
        required: true
    },
    is_valid: {
        type: Boolean,
        default: false        
    }
}, {
    timestamps: true
});

const PasswordReset = mongoose.model('Password-Reset', PasswordResetSchema);
module.exports = PasswordReset;