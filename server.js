// File: backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const mongoURI = 'mongodb://localhost:27017/quiz_platform';
const jwtSecret = 'your_jwt_secret';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    score: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Quiz Schema
const quizSchema = new mongoose.Schema({
    _id: Number,
    question: String,
    option_a: String,
    option_b: String,
    option_c: String,
    option_d: String,
    correct_option: String
});
const Quiz = mongoose.model('Quiz', quizSchema);

// User Registration
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Registration failed' });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
});

// Get Leaderboard
app.get('/leaderboard', async (req, res) => {
    const users = await User.find().sort({ score: -1 }).limit(10);
    res.json(users);
});

// Get Quizzes
app.get('/quizzes', async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

// Submit Quiz
app.post('/submit', async (req, res) => {
    const { token, answers } = req.body;
    try {
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.id;

        const quizzes = await Quiz.find();
        let score = 0;
        quizzes.forEach((quiz, index) => {
            if (answers[index] === quiz.correct_option) {
                score++;
            }
        });

        await User.findByIdAndUpdate(userId, { $inc: { score } });
        res.json({ message: 'Quiz submitted successfully', score });
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
