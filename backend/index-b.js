import express from 'express';
import Chatbot from './models/chatbot.model.js';
import mongoose from 'mongoose';

const app = express();
const port = 3000;

app.use(express.json());

mongoose.connect("mongodb+srv://amar:P6h-uZ$PWD36X8Y@cluster0.kbxzr.mongodb.net/userDatabase?retryWrites=true&w=majority&appName=Cluster0P6h-uZ$PWD36X8Y")
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('Failed to connect to MongoDB', err));



app.listen(port, () => {
    console.log(`Chatbot running at http://localhost:${port}`);
});

app.post('/add-question', async (req, res) => {
    const { question, keywords, answer } = req.body;
    try {
        // Convert all inputs to lowercase
        const lowerCaseQuestion = question.toLowerCase();
        const lowerCaseKeywords = keywords.map(keyword => keyword.toLowerCase());
        const lowerCaseAnswer = answer.toLowerCase();

        // Insert the new question into the database using Mongoose
        const newQuestion = new Chatbot({
            question: lowerCaseQuestion,
            keywords: lowerCaseKeywords, // Store as an array
            answer: lowerCaseAnswer
        });
        await newQuestion.save();

        res.json({ message: 'Question added successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add question' });
    }
});
