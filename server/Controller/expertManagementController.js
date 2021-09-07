const db = require('../Config/databaseConfig')
const bcrypt = require('bcrypt')
const roundSalt = 10 //regular method as 10 is generating hashing

//fetch expert data
function fetchExpertData(req, res) {
    if (req.session.user) {
        const role = req.session.user[0].permission_role
        if (role === 'admin') {
            const sql = "SELECT * from expert_info ORDER BY expert_id desc"

            db.db.query(sql, (err, result) => {
                if (result) {
                    res.status(200).json({
                        role: role,
                        success: true,
                        data: result
                    })
                }
            })
        } else {
            res.status(400).json({
                authPage: false,
                msg: "You permission is denied"
            })
        }
    } else {
        res.status(400).json({ loggedIn: false, msg: "Your session is expired, Please relogin" })
    }
}


//create expert data (admin)
function createExpertData(req, res) {
    const { title, first_name, last_name, gender, nationality, date_of_birth, email, phoneNo, linkedin, skype, twitter, expertise, category, sourceRef, eduOrganization, fieldSpeciality, education, employment, membership_of_professional, scientific_contribution_and_research_leadership, awarded_grants_and_funded_activities, awards, patents, publication, collaborative_project_proposal, password } = req.body

    if (req.session.user) {
        const role = req.session.user[0].permission_role;
        if (role === 'admin') {
            const sql = "SELECT * from user_credential WHERE account_name=?"

            db.db.query(sql, [email], (err, result) => {
                if (result.length > 0) {
                    res.status(400).json({
                        success: false,
                        msg: 'Username has existed'
                    })
                } else {
                    const sql = "INSERT INTO expert_info(title,first_name,last_name,gender,nationality,date_of_birth,email,phone_no,linkedin,skype,twitter, expertise, category,source_references,edu_organization,field_of_speciality,education,employment,membership_of_professional_bodies,scientific_contribution_and_research_leadership,awarded_grants_and_funded_activities,awards,patents,publications,collaborative_project_proposal) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"

                    db.db.query(sql, [title, first_name, last_name, gender, nationality, date_of_birth, email, phoneNo, linkedin, skype, twitter, expertise, category, sourceRef, eduOrganization, fieldSpeciality, education, employment, membership_of_professional, scientific_contribution_and_research_leadership, awarded_grants_and_funded_activities, awards, patents, publication, collaborative_project_proposal], (err, result) => {
                        if (err) {
                            res.status(400).json({
                                success: false,
                                msg: err
                            })
                        } else {
                            const sql = "SELECT expert_id from expert_info WHERE first_name=? AND last_name=? AND email=?"

                            db.db.query(sql, [first_name, last_name, email], (err, response) => {
                                const expertID = response[0].expert_id;
                                bcrypt.hash(password, roundSalt, (err, hashed) => {
                                    if (hashed) {
                                        const sql = "INSERT INTO user_credential (foreign_user_id, account_name, account_password, permission_role) VALUES (?,?,?,?)"

                                        db.db.query(sql, [expertID, email, hashed, 'expert'], (err, result) => {
                                            if (result) {
                                                res.status(200).json({
                                                    insert: true,
                                                    msg: 'Expert has inserted'
                                                })
                                            } else {
                                                res.status(400).json({
                                                    hashed: false,
                                                    msg: err
                                                })
                                            }
                                        })
                                    }
                                })
                            })
                        }
                    })
                }
            })
        } else {
            res.status(400).json({
                authPage: false,
                msg: "You are not an admin"
            })
        }
    } else {
        res.status(400).json({
            loggedIn: false,
            msg: 'Your session is expired, Please relogin.'
        })
    }
}

//edit and update expert
function editExpertData(req, res) {
    const { title, first_name, last_name, gender, nationality, date_of_birth, email, phoneNo, linkedin, skype, twitter, expertise, category, sourceRef, eduOrganization, fieldSpeciality, education, employment, membership_of_professional, scientific_contribution_and_research_leadership, awarded_grants_and_funded_activities, awards, patents, publication, collaborative_project_proposal, expert_id } = req.body

    if (req.session.user) {
        const role = req.session.user[0].permission_role

        if (role === 'admin') {
            const sql = `UPDATE expert_info
            SET title=?,
            first_name=?,
            last_name=?,
            gender=?,
            nationality=?,
            date_of_birth=?,
            email=?,
            phone_no=?,
            linkedin=?,
            skype=?,
            twitter=?,
            expertise=?,
            category=?,
            source_references=?,
            edu_organization=?,
            field_of_speciality=?,
            education=?,
            employment=?,
            membership_of_professional_bodies=?,
            scientific_contribution_and_research_leadership=?,
            awarded_grants_and_funded_activities=?,
            awards=?,
            patents=?,
            publications=?,
            collaborative_project_proposal=?
            WHERE expert_id=?`;

            db.db.query(sql, [title, first_name, last_name, gender,
                nationality, date_of_birth, email.trim().toLowerCase(), phoneNo, linkedin, skype,
                twitter, expertise, category, sourceRef, eduOrganization,
                fieldSpeciality, education, employment, membership_of_professional,
                scientific_contribution_and_research_leadership, awarded_grants_and_funded_activities,
                awards, patents, publication, collaborative_project_proposal, expert_id], (err, result) => {
                    if (result) {
                        res.status(200).json({
                            update: true,
                            msg: 'Data updated'
                        })
                    } else {
                        res.status(400).json({
                            update: false,
                            error: err
                        })
                    }
                })
        } else {
            res.status(401).json({
                authPage: false,
                msg: 'You are not an admin'
            })
        }
    } else {
        res.status(400).json({
            loggedIn: false,
            msg: 'Your session is expired, Please relogin.'
        })
    }
}

//delete expert
function deleteExpert(req, res) {
    const expertID = req.params.expertId;
    console.log(expertID)
    if (req.session.user) {
        const role = req.session.user[0].permission_role

        if (role === 'admin') {
            const sql = `DELETE FROM user_credential WHERE foreign_user_id=? AND permission_role='expert'`;

            db.db.query(sql, [expertID], (err, result) => {
                if (result) {
                    const sql = `DELETE FROM expert_info WHERE expert_id=?`
                    db.db.query(sql, [expertID], (err, result) => {
                        if (result) {
                            const sql = `DELETE FROM project_matching WHERE expert_id=?`
                            db.db.query(sql, [expertID], (err, result) => {
                                res.status(200).json({
                                    remove: true,
                                    data: result,
                                    msg: "remove"
                                })
                            })
                        }
                    })
                } else {
                    res.status(400).json({
                        delete: false,
                        msg: err
                    })
                }
            })
        } else {
            res.status(401).json({
                authPage: false,
                msg: 'You are not an admin'
            })
        }
    } else {
        res.status(400).json({
            loggedIn: false,
            msg: 'Your session is expired, Please relogin.'
        })
    }
}

//download expert info
function downloadExpertDoc(req, res) {
    const expertId = req.params.expertID;
    console.log(expertId)
    if (req.session.user) {
        const role = req.session.user[0].permission_role

        if (role === 'admin') {
            const sql = `SELECT * FROM expert_info WHERE expert_id=?`;

            db.db.query(sql, [expertId], (err, result) => {
                if (result) {
                    res.status(200).json({
                        downloaded: true,
                        row: result
                    })
                } else {
                    res.status(400).json({
                        downloaded: false,
                        row: err
                    })
                }
            })
        } else {
            res.status(401).json({
                authPage: false,
                msg: 'You are not an admin'
            })
        }
    } else {
        res.status(400).json({
            loggedIn: false,
            msg: 'Your session is expired, Please relogin.'
        })
    }
}

module.exports = { fetchExpertData, createExpertData, editExpertData, deleteExpert, downloadExpertDoc }