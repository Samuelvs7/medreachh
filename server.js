import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import colors from 'colors';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
import authRoutes from './routes/authRoutes.js';
app.use('/api/auth', authRoutes);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB Atlas
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(colors.cyan.underline(`MongoDB Connected: ${conn.connection.host}`));
        return conn;
    } catch (error) {
        console.error(colors.red.underline.bold(`Error: ${error.message}`));
        process.exit(1);
    }
};

// Start the server only after MongoDB connection is established
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`.yellow.bold);
    });
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});
