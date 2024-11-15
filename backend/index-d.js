import stringSimilarity from 'string-similarity';
import stopword from 'stopword';

const text = "tell me about swot";
const words = text.split(' ');
const cleanedText = stopword.removeStopwords(words);

console.log(cleanedText.join(' ')); // Outputs: "This sample sentence stop words."


const string1 = "tell swot";
const string2 = "swot analsysis";

const similarity = stringSimilarity.compareTwoStrings(string1.toLowerCase(), string2.toLowerCase());
console.log(similarity); // Outputs a similarity score, e.g., 0.87
