const nodemailer = require('nodemailer');
require('dotenv').config();
// create reusable transporter object 
const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
       user: process.env.mailUser || process.env.MAIL_USER,
       pass: process.env.mailPass || process.env.MAIL_PASS
   }
});

function sendMail(to, subject, bodyText, htmlText) {
   // setup email data with unicode symbols
   let mailOptions = {
       from: 'me@gmail.com', // sender address
       to: to, // list of receivers
       subject: subject, // Subject line
       text: bodyText, // plain text body
       html: htmlText // html body
   };

   // send mail with defined transport object
   transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
           //log error
           return console.log(error);
       }
       // log success
       console.log('Message sent: %s', info.messageId);
   });
}
module.exports = sendMail;