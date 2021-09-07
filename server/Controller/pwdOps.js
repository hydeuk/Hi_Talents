const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../Config/databaseConfig');
const { forgotPasswordHTML } = require('../EmailTemplate/emailTemplate');
const { createTransportConfig } = require('../Config/mailerConfig')
const transporter = nodemailer.createTransport(createTransportConfig)
const bcrypt = require('bcrypt')
const roundSalt = 10 //regular method as 10 is generating hashing


function forgotPassword(req, res) {
    const email = req.body.email.trim().toLowerCase();

    if (email) {
        const sql = `SELECT expert_info.first_name, user_credential.id 
                    FROM user_credential
                    JOIN expert_info
                    ON user_credential.foreign_user_id = expert_info.expert_id
                    WHERE user_credential.account_name=?`;

        db.db.query(sql, [email], (err, rows) => {
            if (rows.length > 0) {
                const token = crypto.randomBytes(20).toString('hex');
                const sql = `UPDATE user_credential 
                                 SET reset_password_token=?
                                 WHERE id=?`;

                db.db.query(sql, [token, rows[0].id], (err, feedback) => {
                    if (feedback) {
                        const mailOptions = {
                            from: 'contact@hyde-china.com',
                            to: `${email}`,
                            subject: 'Link To Reset Password',
                            html: forgotPasswordHTML(rows[0].first_name, `http://localhost:3000/resetpassword/${token}`)
                        };

                        transporter.sendMail(mailOptions, (err, response) => {
                            if (response) {
                                res.status(200).json({
                                    success: true,
                                    data: 'recovery email sent'
                                });
                            }
                        });
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    msg: 'email is not registered'
                });
            }
        });
    } else {
        res.status(400).json({
            success: false,
            msg: 'email should not be empty'
        })
    }
}

function resetPassword(req, res) {
    const token = req.params.token;

    if (token) {
        const sql = `SELECT id, foreign_user_id, account_name, permission_role 
                    FROM user_credential 
                    WHERE reset_password_token=?`;

        db.db.query(sql, [token], function (err, rows) {
            if (err) {
                res.status(400).json({
                    success: false,
                    msg: err.sqlMessage
                });
            } else {
                if (rows.length > 0) {
                    res.status(200).json({
                        success: true,
                        data: rows[0]
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        msg: 'reset token not found in db'
                    });
                }
            }
        });

    } else {
        res.status(400).json({
            success: false,
            msg: 'reset token should not be empty'
        });
    }
}

function updatePassword(req, res) {
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;


    if (email && password) {
        const sql = `SELECT id FROM user_credential 
        WHERE account_name=?`;

        db.db.query(sql, [email], function (err, rows) {
            if (err) {
                res.status(400).json({
                    success: false,
                    msg: err.sqlMessage
                });
            } else {
                if (rows.length > 0) {
                    const sql = `UPDATE user_credential 
                                SET reset_password_token=?,
                                account_password=?
                                WHERE id=?`;

                    bcrypt.hash(password, roundSalt, (err, hashPassword) => {
                        if (err) {
                            res.status(400).json({
                                error: err
                            })
                        }

                        db.db.query(sql, ['', hashPassword, rows[0].id], function (err, rows) {
                            if (err) {
                                res.status(400).json({
                                    success: false,
                                    msg: err.sqlMessage
                                });
                            } else {
                                res.status(200).json({
                                    success: true,
                                    data: 'password is updated'
                                });
                            }
                        });
                    })
                } else {
                    res.status(400).json({
                        success: false,
                        msg: 'email is not registered'
                    });
                }
            }
        });
    } else {
        res.status(400).json({
            success: false,
            msg: 'email or password should not be empty'
        });
    }
}

module.exports = {
    forgotPassword,
    resetPassword,
    updatePassword
}