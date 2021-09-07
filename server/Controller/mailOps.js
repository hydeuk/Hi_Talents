const nodemailer = require('nodemailer');

function mailSending(req, res) {

    const fName = req.body.firstName;
    const lName = req.body.lastName;
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;


    let transporter = nodemailer.createTransport({
        service: "smtpw.263.net", //replace with your email provider
        port: 465,
        auth: {
            user: "contact@hyde-china.com", //replace with the email address
            pass: "Cmm2020cm107" //replace with the password
        }
    })

    const mailBody = "<b>First Name: </b>" + fName + "<br/>" +
        "<b>Last Name: </b>" + lName + "<br/>" +
        "<b>Email: </b>" + email + "<br/>" +
        "<b>Message: </b>" +
        "<p>" + message + "</p>"

    const mailOptions = {
        from: 'contact@hyde-china.com',
        to: 'contact@hyde-china.com',
        subject: subject,
        html: mailBody
    }

    transporter.sendMail(mailOptions, (err, sent) => {
        if (err) {
            res.status(400).json({
                success: false,
                msg: 'Something has went wrong'
            })
        } else {
            res.status(200).json({
                success: true,
                msg: 'Email Sent!'
            })
        }
    })

}

module.exports = { mailSending }