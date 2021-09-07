const { sign, verify } = require('jsonwebtoken');

const createToken = (result) => {
    const userToken = sign({ userID: result.foreign_user_id, role: result.permission_role }, "testingDev")

    return userToken;
}

const validateToken = (req, res, next) => {
    // if statement to ensure the token has been assigned
    const accessToken = req.cookies['HydeToken']

    if (!accessToken) {
        return res.status(401).json({
            error: "User not authenticated"
        })
    }

    try {
        const validToken = verify(accessToken, "testingDev")
        if (validToken) {
            req.authenticated = true
            return next()
        }
    } catch (err) {
        return res.status(401).json({
            error: err
        })
    }
}

module.exports = { createToken, validateToken }


