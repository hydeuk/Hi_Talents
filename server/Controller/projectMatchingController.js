const db = require("../Config/databaseConfig");

function expertJobApply(req, res) {
    if (!req.session.user) {
        res.status(400).json({
            loggedIn: false,
            err: `You've not logged in yet, Please Login.`
        })
    } else {
        const project_id = req.params.jobId
        // console.log(project_id)
        const role = req.session.user[0].permission_role;
        const expert_id = req.session.user[0].id

        if (role === 'expert') {
            const sql = "SELECT * from project_matching WHERE project_id = ? AND expert_id =?"
            db.db.query(sql, [project_id, expert_id], (err, result) => {
                if (result.length > 0) {
                    res.status(200).json({
                        apply: false,
                        msg: 'You have applied!'
                    })
                } else {
                    const sql = 'SELECT * FROM expert_info WHERE expert_id=?'
                    db.db.query(sql, [expert_id], (err, result) => {
                        if (result.length > 0) {
                            const education = result[0].education
                            const employment = result[0].employment
                            const field_of_speciality = result[0].field_of_speciality

                            if (education && employment && field_of_speciality) {
                                const sql = "INSERT INTO project_matching (project_id, expert_id, application_complete) VALUES (?, ?, ?)";

                                db.db.query(sql, [project_id, expert_id, "Y"], (err, result) => {
                                    if (result) {
                                        res.status(200).json({
                                            apply: true,
                                            msg: 'You have succesfully applied!',
                                            imcomplete: true
                                        })
                                    }
                                })
                            } else {
                                const sql = "INSERT INTO project_matching (project_id, expert_id, application_complete) VALUES (?, ?, ?)";

                                db.db.query(sql, [project_id, expert_id, "N"], (err, result) => {
                                    if (result) {
                                        res.status(200).json({
                                            apply: true,
                                            msg: 'Successfully applied. But you need to further complete the profile application.',
                                            incomplete: true
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            })
        } else {
            if (role === 'admin') {
                res.status(401).json({
                    apply: false,
                    msg: "You're not permitted to apply for job because you are ADMIN."
                })
            }
        }
    }
}

function fetcProjectMatching(req, res) {
    if (req.session.user) {
        const role = req.session.user[0].permission_role

        if (role === 'admin') {
            const sql = `SELECT * FROM (
                SELECT *, ROW_NUMBER() OVER (PARTITION BY project_matching.project_id ORDER BY project_matching.matching_id DESC) AS rn
                FROM project_matching 
            ) AS temp
            JOIN project_info
            ON project_info.project_id = temp.project_id 
            WHERE rn=1 AND temp.application_complete='Y'
            ORDER BY temp.matching_id DESC`;

            db.db.query(sql, (err, result) => {
                if (result) {
                    console.log(result)
                    res.status(200).json({
                        success: true,
                        data: result
                    })
                }
            })
        }
    } else {
        res.status(400).json({
            session: false,
            msg: 'You session has expired, Please re-login.'
        })
    }
}

function fetchProjectExpert(req, res) {
    if (req.session.user) {
        const role = req.session.user[0].permission_role
        const projectId = req.params.projectid;

        if (role === 'admin') {
            const sql = `SELECT * FROM project_matching
            JOIN expert_info
            ON expert_info.expert_id = project_matching.expert_id
            JOIN project_info
            ON project_info.project_id = project_matching.project_id
            WHERE project_matching.project_id=? AND project_matching.application_complete='Y'`;;

            db.db.query(sql, [projectId], (err, result) => {
                if (result) {
                    // console.log(result)
                    res.status(200).json({
                        success: true,
                        data: result
                    })
                }
            })
        }
    } else {
        res.status(400).json({
            session: false,
            msg: 'You session has expired, Please re-login.'
        })
    }
}

function deleteProjectMatching(req, res) {
    if (req.session.user) {
        const role = req.session.user[0].permission_role
        const expertid = req.params.expertId;
        const projectid = req.params.projectId;

        console.log(expertid)
        console.log(projectid)

        if (role === 'admin' || 'expert') {
            const sql = `DELETE FROM project_matching 
            WHERE expert_id=? AND project_id=?`;

            db.db.query(sql, [expertid, projectid], (err, result) => {
                if (result) {
                    res.status(200).json({
                        success: true,
                        data: result
                    })
                }
            })
        }
    } else {
        res.status(400).json({
            session: false,
            msg: 'You session has expired, Please re-login.'
        })
    }
}

function fetchExpertJob(req, res) {
    if (req.session.user) {
        const role = req.session.user[0].permission_role
        const expertId = req.session.user[0].id;

        if (role === 'expert') {
            const sql = `SELECT *  FROM project_matching 
            JOIN project_info
            ON project_info.project_id = project_matching.project_id
            WHERE project_matching.expert_id=?
            ORDER BY project_matching.matching_id desc`

            db.db.query(sql, [expertId], (err, result) => {
                if (result) {
                    res.status(200).json({
                        success: true,
                        data: result
                    })
                }
            })
        }
    } else {
        res.status(400).json({
            session: false,
            msg: 'You session has expired, Please re-login.'
        })
    }
}

module.exports = { expertJobApply, fetcProjectMatching, fetchProjectExpert, deleteProjectMatching, fetchExpertJob }