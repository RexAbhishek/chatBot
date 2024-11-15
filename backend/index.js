import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // Add this import
import colors from 'colors';
import Chatbot from './models/chatbot.model.js';
import stringSimilarity from 'string-similarity';
import stopword from 'stopword';

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors()); // Add this line

// Connect to MongoDB
mongoose.connect("mongodb+srv://amar:P6h-uZ$PWD36X8Y@cluster0.kbxzr.mongodb.net/userDatabase?retryWrites=true&w=majority&appName=Cluster0P6h-uZ$PWD36X8Y")
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('Failed to connect to MongoDB', err));

// Middleware to parse JSON
app.use(express.json());

const findBestMatch = (userQuestion, rows) => {
  const bestMatch = { answer: null, matchRating: 0 };
  rows.forEach(row => {
    const questionLower = row.question.toLowerCase();
    const matchRating = stringSimilarity.compareTwoStrings(userQuestion, questionLower);
    if (matchRating > bestMatch.matchRating) {
      bestMatch.answer = row.answer;
      bestMatch.matchRating = matchRating;
    }
  });
  return bestMatch;
};

const findKeywordMatches = (userQuestion, rows) => {
  const userQuestionCleaned = stopword.removeStopwords(userQuestion.split(' ')).join(' ');
  const bestMatches = [];
  rows.forEach(row => {
    const keywords = row.keywords.join(' ').toLowerCase();
    const matchRating = stringSimilarity.compareTwoStrings(userQuestionCleaned, keywords);
    if (matchRating > 0.25) {
      if (bestMatches.length < 3) {
        bestMatches.push({ answer: row.answer, question: row.question, matchRating });
      } else {
        let minIndex = 0;
        for (let i = 1; i < bestMatches.length; i++) {
          if (bestMatches[i].matchRating < bestMatches[minIndex].matchRating) {
            minIndex = i;
          }
        }
        if (matchRating > bestMatches[minIndex].matchRating) {
          bestMatches[minIndex] = { answer: row.answer, question: row.question, matchRating };
        }
      }
    }
  });
  return bestMatches;
};

// Endpoint to handle chat requests
app.post('/chat', async (req, res) => {
  const userInput = req.body.message.toLowerCase();

  if (userInput === 'exit') {
    return res.send({ message: 'Thank you!' });
  }

  try {
    const rows = await Chatbot.find();
    const bestMatch = findBestMatch(userInput, rows);

    if (bestMatch.matchRating >= 0.9) {
      return res.send({ message: bestMatch.answer });
    } else {
      const bestMatches = findKeywordMatches(userInput, rows);
      if (bestMatches.length > 0) {
        return res.send({
          message: 'Here are the top 3 matches:',
          matches: bestMatches.map((match, index) => ({
            index: index + 1,
            question: match.question,
          })),
        });
      } else {
        return res.send({ message: "Sorry, I don't have an answer for your current question, let's connect you to support" });
      }
    }
  } catch (error) {
    console.error(colors.red(error));
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
