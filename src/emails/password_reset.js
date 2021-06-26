const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log();
const sendPasswordResetEmail = (email, name, url) =>{
    sgMail.send({
        to:email,
        from:'hungerdemons@gmail.com',
        subject:'Hunger Demons Password Reset',
        text:`Hi ${name}, Here is your password reset email. You can click on the following link to reset your password. This link is valid only for 15 minutes.
        ${url}`
    })
}

module.exports = {
    sendPasswordResetEmail
}