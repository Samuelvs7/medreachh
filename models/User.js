import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    photoURL: {
        type: String,
        default: ''
    },
    userType: {
        type: String,
        enum: ['beneficiary', 'volunteer', 'admin'],
        default: 'beneficiary'
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create a compound index for faster queries
userSchema.index({ email: 1, uid: 1 });

// Add a method to get user profile (without sensitive data)
userSchema.methods.getProfile = function() {
    return {
        uid: this.uid,
        email: this.email,
        name: this.name,
        photoURL: this.photoURL,
        userType: this.userType,
        phoneNumber: this.phoneNumber,
        address: this.address,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

const User = mongoose.model('User', userSchema);

export default User;
