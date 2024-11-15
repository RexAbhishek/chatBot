import mongoose from "mongoose";
const chatbotSchema = new mongoose.Schema({
    question: { type: String, required: true },
    keywords: { type: [String], required: true },
    answer: { type: String, required: true }
  }, {timestamps: true});
  
const Chatbot = mongoose.model('Chatbot', chatbotSchema);
export default Chatbot;

  


