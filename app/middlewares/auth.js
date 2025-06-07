const jwt = require('jsonwebtoken');
const { HTTP_STATUS_CODES, respond } = require('../utils/responseHelper');

/** 
 * * Middleware to authenticate user using JWT
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * */
const auth = (req, res, next) => {
    // Extracting token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    // If no token is provided, return unauthorized error
    if (!token) {
        return respond(res, false, HTTP_STATUS_CODES.UNAUTHORIZED, 'No token provided');
    }

    try {
        // Verifying the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attaching user information to the request object
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // If token verification fails, return unauthorized error
        return respond(res, false, HTTP_STATUS_CODES.UNAUTHORIZED, 'Invalid token');
    }
}

module.exports = auth;