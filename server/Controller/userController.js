const db = require('../Config/databaseConfig') //database config
const bcrypt = require('bcrypt') //password hashing purpose
const { createToken } = require('./jwtTokens')
const nodemailer = require('nodemailer')
const { createTransportConfig } = require('../Config/mailerConfig')
const { welcomeSignupHTML } = require('../Config/emailTemplate')
const transporter = nodemailer.createTransport(createTransportConfig)

const roundSalt = 10 //regular method as 10 is generating hashing


// register
function register(req, res) {
    // input value 
    const fName = req.body.firstName;
    const lName = req.body.lastName;
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;
    const Cpassword = req.body.Cpassword;
    const phoneNo = req.body.phoneNo;
    const role = 'expert';

    //this process will only run if pass and Cpass is same
    if (password == Cpassword) {
        var sql = "SELECT * FROM user_credential WHERE account_name = ?" //to check the account name has existed or not 

        db.db.query(sql, [email], (err, result) => {
            if (result.length > 0) { //if the data has been found in db, error status will show up
                res.status(400).json({
                    insert: false,
                    msg: "Email has existed."
                })
            } else { // if not , insert the new data into table expert_info 
                var sql = "INSERT INTO expert_info (first_name, last_name,email,phone_no) VALUES (?,?,?,?)";
                db.db.query(sql, [fName, lName, email, phoneNo], (err, result) => {
                    if (result) { // matching process 
                        var sql = 'SELECT expert_id from expert_info WHERE first_name = ? AND last_name=? AND email=? AND phone_no=?'
                        db.db.query(sql, [fName, lName, email, phoneNo], (err, result) => {
                            if (result) { //if it is match with the exact info, insert the data into user_crendtial
                                const expertID = result[0].expert_id; //assign the id into a variable
                                console.log(expertID)

                                var sql = "INSERT INTO user_credential (foreign_user_id, account_name, account_password, permission_role) VALUES (?,?,?,?)"

                                //generate hash method to hash up the keys 
                                bcrypt.hash(password, roundSalt, (err, hashPassword) => {
                                    if (err) {
                                        res.status(400).json({
                                            error: err
                                        })
                                    }

                                    db.db.query(sql, [expertID, email, hashPassword, role], (err, result) => {
                                        if (result) { // if everything goes well, user will successfully registered .
                                            const mailOptions = {
                                                from: 'contact@hyde-china.com',
                                                to: `${email}`,
                                                subject: 'Welcome to HI TALENTS!',
                                                html: welcomeSignupHTML(fName)
                                            }
                                            transporter.sendMail(mailOptions, (err, response) => { });

                                            res.status(200).json({
                                                insert: true,
                                                role: role,
                                                msg: 'Successfully registered.'
                                            }
                                            );
                                        }
                                    })
                                })
                            }
                        })
                    }
                })
            }
        })
    }
}

//login
function login(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    var sql = "SELECT * FROM user_credential WHERE account_name=?"

    db.db.query(sql, [email, password], (err, result) => {
        if (result.length > 0) { //if there a result found, assign the following variable and process verification
            const dbPassword = result[0].account_password;
            bcrypt.compare(password, dbPassword).then((response) => {
                if (!response) {
                    res.status(400).json({
                        authenticate: false,
                        msg: 'Wrong password or username!'
                    })
                } else { //creating jwt token to for authentication process which allow the website recognise this user
                    req.session.user = result;
                    const toKen = createToken(result)
                    res.cookie('Hitalents.cookie', toKen, {
                        maxAge: 60 * 60 * 24 * 30 * 1000,
                        httpOnly: true
                    })
                    res.status(200).json({
                        authenticate: true,
                        role: result[0].permission_role,
                        msg: 'Logged In'
                    })
                }
            })
        } else {
            res.status(400).json({
                success: false,
                msg: 'Username does not exist.'
            })
        }

    })
}

//session check
function isloggedIn(req, res) {
    if (req.session.user) {
        res.status(200).json({ loggedIn: true, user: req.session.user })
    } else {
        res.status(400).json({ loggedIn: false })
    }
}

function profile(req, res) {
    if (req.session.user) {
        const role = req.session.user[0].permission_role
        const emailAcc = req.session.user[0].account_name
        if (role === 'expert') {
            const sql = `SELECT * FROM expert_info WHERE email=?`
            db.db.query(sql, [emailAcc], (err, result) => {
                if (result) {
                    res.status(200).json({
                        success: true,
                        msg: 'Welcome to Hyde International Talents Portal!',
                        data: result,
                        role: role
                    })
                } else {
                    res.status(400).json({
                        success: false,
                        msg: "Failed to get an account name"
                    })
                }
            })
        } else {
            res.status(400).json({
                authRole: false,
                msg: "You are not an user."
            })
        }
    } else {
        res.status(400).json({
            authRole: false,
            msg: "Your session has expired, Please login."
        })
    }
}


//Logout 
function logout(req, res) {
    res.cookie('userId', '', { maxAge: 1 })
    res.cookie('HydeToken', '', { maxAge: 1 })
    res.status(200).json({
        remove: true,
        msg: 'You have logout!'
    })
}

function updateProfile(req, res) {
    const { nationality, phoneNo, linkedin, twitter, education, employment, patents, publications, field_of_speciality, awards, scientific_contribution_and_research_leadership, collaborative_project_proposal } = req.body
    if (req.session.user) {
        const role = req.session.user[0].permission_role
        const emailAcc = req.session.user[0].account_name
        if (role === 'expert') {
            const mysql = `UPDATE expert_info SET nationality =?, phone_no =?, linkedin =? , twitter=?, education=?, employment=?, patents=?, publications=?, field_of_speciality=?, awards=?, scientific_contribution_and_research_leadership=?, collaborative_project_proposal=?  WHERE email = ?`;
            db.db.query(mysql, [nationality, phoneNo, linkedin, twitter, education, employment, patents, publications, field_of_speciality, awards, scientific_contribution_and_research_leadership, collaborative_project_proposal, emailAcc], (err, result) => {
                if (result) {
                    res.status(200).json({
                        update: true,
                        msg: "Your information have updated!"
                    })
                } else {
                    res.status(400).json({
                        update: false,
                        msg: "Failed to update."
                    })
                }
            })
        } else {
            res.status(400).json({
                authRole: false,
                msg: "You are not an user."
            })
        }
    } else {
        res.status(400).json({
            authRole: false,
            msg: "Your session has expired, Please login."
        })
    }
}






module.exports = { register, login, profile, logout, isloggedIn, updateProfile }

