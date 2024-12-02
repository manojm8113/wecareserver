const jwt = require('jsonwebtoken');

const verifyDoctor = (req, res, next) => {
    console.log('jsonwebtoken', req.headers.authorization);
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
        const doctorToken = authHeader.split(' ')[1];
        
        jwt.verify(doctorToken, process.env.JWTSECRET, (err, doctor) => { // Assuming JWTSECRET is your env var
            if (err) return res.status(403).json("Token is not valid");
            
            console.log("Decoded doctor data:", doctor); // Logging the decoded token
            
            if (doctor.id === req.params.id) { // Check if the doctor ID matches the request param
                req.doctor = doctor; // Assign decoded token details to the request object
                next(); // Proceed to the next middleware or route
            } else {
                return res.status(403).json("Your ID and token do not match");
            }
        });
    } else {
        return res.status(401).json("You are not authenticated");
    }
};

module.exports = verifyDoctor;
