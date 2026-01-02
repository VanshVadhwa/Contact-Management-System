require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (Replace string with your local or Atlas URI)
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/contact-app')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Schema Definition
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// API Routes

// 1. GET: Fetch all contacts
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 }); // Sorting (Bonus)
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. POST: Add new contact
app.post('/api/contacts', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        // Basic backend validation
        if (!name || !email || !phone) {
            return res.status(400).json({ error: "Please fill required fields" });
        }
        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();
        res.status(201).json(newContact);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. DELETE: Remove contact (Bonus)
app.delete('/api/contacts/:id', async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: "Contact deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add this before app.listen
app.put('/api/contacts/:id', async (req, res) => {
    try {
        const updatedContact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedContact);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));