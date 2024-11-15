import readlineSync from "readline-sync";
import colors from "colors";
import mongoose from 'mongoose';
import Chatbot from './models/chatbot.model.js';
import stringSimilarity from 'string-similarity';
import stopword from 'stopword';

await mongoose.connect("mongodb+srv://amar:P6h-uZ$PWD36X8Y@cluster0.kbxzr.mongodb.net/userDatabase?retryWrites=true&w=majority&appName=Cluster0P6h-uZ$PWD36X8Y")
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('Failed to connect to MongoDB', err));

async function main() {
    console.log(colors.bold.green('Welcome to the Chatbot'));
    console.log(colors.bold.green('You can start chatting with the bot'));

    while (true) {
        const userInput = readlineSync.question(colors.yellow('You: '));
        
        if (userInput.toLowerCase() === 'exit') {
            console.log(colors.bold.green('Thank you!'));
                process.exit(0);
                }

        try {
            const rows = await Chatbot.find(); // Correct collection reference
            // console.log("Database Rows: ", rows);
            const userQuestion = userInput.toLowerCase(); // Convert user input to lowercase
            
            const bestMatch = {
                answer: null,
                matchRating: 0
            };
            
            rows.forEach(row => {
                const questionLower = row.question.toLowerCase(); // Convert stored question to lowercase
                const matchRating = stringSimilarity.compareTwoStrings(userQuestion, questionLower);
            
                if (matchRating > bestMatch.matchRating) {
                    bestMatch.answer = row.answer;
                    bestMatch.matchRating = matchRating;
                }
            });
            
            // console.log("Best Match: ", bestMatch);
            if (bestMatch.matchRating >= 0.9) {
                console.log(colors.green("Bot: ", bestMatch.answer));
            } 
            else {
                const userQuestionk = stopword.removeStopwords(userQuestion.split(' '));
                const bestMatches = [];

                rows.forEach(row => {
                    let keywords = row.keywords.map(k => k.toLowerCase()).join(' '); // Convert keywords to lowercase and join into a single string
                
                   const matchRating = stringSimilarity.compareTwoStrings(userQuestionk, keywords);
                   if (matchRating > 0.4){
                        if (bestMatches.length < 3) {
                            bestMatches.push({ answer: row.answer, question: row.question, matchRating });
                        } else {
                            // Find the lowest match rating in the top 3
                            let minIndex = 0;
                            for (let i = 1; i < bestMatches.length; i++) {
                                if (bestMatches[i].matchRating < bestMatches[minIndex].matchRating) {
                                    minIndex = i;
                                }
                            }
                            // Replace the lowest match if the current match is better
                            if (matchRating > bestMatches[minIndex].matchRating) {
                                bestMatches[minIndex] = { answer: row.answer, question: row.question, matchRating };
                            }
                        }
                    }
                });
                
                // console.log("Top Matches: ", bestMatches);
                
                if (bestMatches.length > 0) {
                    // const userChoice = readlineSync.question(colors.yellow('Please choose your question & 0 for no choice: '));
                    console.log(colors.green("Bot: Here are the top 3 matches:"));
                    bestMatches.forEach((match, index) => {
                        console.log(colors.yellow(`${index + 1}: ${match.question}\n`));
                    });
                
                    const userChoice = readlineSync.question(colors.yellow('Please choose your question & 0 for no choice: '));
                    if (userChoice == 0){
                        console.log(colors.red("Bot: Sorry, I don't have an answer for your current question number, let's connect you to support"));
                    }
                    const chosenMatch = bestMatches[parseInt(userChoice) - 1];
                
                    console.log(colors.green("Bot: ", chosenMatch ? chosenMatch.answer : "Sorry, I don't have an answer for your current question, let's connect you to support"));
                } else {
                    console.log(colors.red("Sorry, I don't have an answer for your current question, let's connect you to support"));
                }
                
                
            }
        } catch (error) {
            console.error(colors.red(error));
        }
    }
}

main();
