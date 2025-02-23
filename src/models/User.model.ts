import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Add your username'],
        minlength: [3, 'The username must be at least 3 characters long'],
        match: [/^\w+$/, 'The username must be one word and contain only letters, numbers and underscores']
    },
    email: {
        type: String,
        required: [true, 'Add your email'],
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Add your password'],
        minlength: [8, 'The password must be at least 8 characters long'],
        match: [/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, 'Password must contain at least one number and one special character']
    },
    favoriteRestaurants: [{
        type: Schema.Types.ObjectId,
        ref: 'Restaurant'
    }]
}, { timestamps: true });

const User = model('User', userSchema);

export default User;
