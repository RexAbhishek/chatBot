import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

function sendMail(receiverMail,subject,text) {
const auth = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.PASSWORD

    }
});

const receiver = {
    from : "outlookmail",
    to : receiverMail,
    subject,
    text 
};

auth.sendMail(receiver, (error, response) => {
    if(error)
    throw error;
    console.log("success!");
    response.end();
});
}

sendMail("swastik.jha@finapsys.co.in","Test3","Send Mail functionality testing");
