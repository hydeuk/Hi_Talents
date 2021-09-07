const db = require('../Config/databaseConfig')

//fetch project data
function fetchProjectData(req, res) {
    if (req.session.user) {
        const role = req.session.user[0].permission_role
        if (role === 'admin') {
            const sql = "SELECT * FROM project_info ORDER BY project_id desc"

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

// job list home page
function jobList(req, res) {
    const sql = "SELECT * FROM project_info ORDER BY project_id desc"

    db.db.query(sql, (err, result) => {
        if (result) {
            res.status(200).json({
                success: true,
                data: result
            })
        } else {
            res.status(400).json({
                success: false,
                msg: 'Failed to grab job list from database'
            })
        }
    })
}

function jobListId(req, res) {
    jobId = req.params.jobId;
    const sql = "SELECT * from project_info where project_id = ?"
    db.db.query(sql, [jobId], (err, result) => {
        if (result) {
            res.status(200).json({
                success: true,
                data: result
            })
        } else {
            res.status(400).json({
                success: false,
                message: "Job ID is not valid"
            })
        }
    })
}

//create expert data (admin)
function createProjectData(req, res) {
    const { start_date, close_date, job_title, job_type, organization_info, responsibility, essential_skills, professional_field, job_description, required_expertise, employer, show_employer_name, location, distance, salary, currency, featured } = req.body

    if (req.session.user) {
        const role = req.session.user[0].permission_role;
        if (role === 'admin') {
            const sql = `INSERT INTO project_info (start_date, close_date, job_title, job_type, organization_info, show_employer_name,featured, responsibility, essential_skills, professional_field, job_description, required_expertise, employer,  location, distance, salary, currency) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`

            db.db.query(sql, [start_date, close_date, job_title, job_type, organization_info, show_employer_name, featured, responsibility, essential_skills, professional_field, job_description, required_expertise, employer, location, distance, salary, currency], (err, result) => {
                if (result) {
                    res.status(200).json({
                        projectInsert: true,
                        msg: "Project inserted"
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

//edit or update
function editProject(req, res) {
    const { start_date, close_date, job_title, job_type, organization_info, responsibility, essential_skills, professional_field, job_description, required_expertise, employer, show_employer_name, location, distance, salary, currency, featured, project_id } = req.body

    if (req.session.user) {
        const role = req.session.user[0].permission_role;
        if (role === 'admin') {
            const sql = `UPDATE project_info 
            SET start_date=?,
            close_date=?,
            job_title=?,
            job_type=?,
            organization_info=?,
            show_employer_name=?,
            featured=?,
            responsibility=?,
            essential_skills=?,
            professional_field=?,
            job_description=?,
            required_expertise=?,
            employer=?,       
            location=?,
            distance=?,
            salary=?,
            currency=?
            WHERE project_id=?`;

            db.db.query(sql, [start_date, close_date, job_title, job_type, organization_info, show_employer_name, featured, responsibility, essential_skills, professional_field, job_description, required_expertise, employer, location, distance, salary, currency, project_id], (err, result) => {
                if (result) {
                    res.status(200).json({
                        projectUpdate: true,
                        msg: "Project Updated"
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

//delete project
function deleteProject(req, res) {
    const projectId = req.params.projectId;
    if (req.session.user) {
        const role = req.session.user[0].permission_role

        if (role === 'admin') {
            const sql = `DELETE FROM project_info WHERE project_id=?`;

            db.db.query(sql, projectId, (err, result) => {
                if (result) {
                    res.status(200).json({
                        remove: true,
                        data: result,
                        msg: "remove"
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

//download project info
function downloadProjectDoc(req, res) {
    const projectId = req.params.projectID;
    console.log(projectId)
    if (req.session.user) {
        const role = req.session.user[0].permission_role

        if (role === 'admin') {
            const sql = "SELECT * from project_info WHERE project_id = ?"

            db.db.query(sql, [projectId], (err, result) => {
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

function sortByCategory(req, res) {
    const jobCategory = req.params.jobCategory
    const sql = "SELECT * FROM project_info WHERE category = ?"
    db.db.query(sql, [jobCategory], (err, result) => {
        if (result) {
            res.status(200).json({
                success: true,
                data: result
            })
        }
    })
}

module.exports = { fetchProjectData, createProjectData, deleteProject, editProject, jobList, jobListId, downloadProjectDoc, sortByCategory }