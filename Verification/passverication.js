const jwt = require('jsonwebtoken');

const verifyPass = (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json("Authentication token is missing or invalid");
    }

    // Extract the token from the "Bearer" string
    const token = authHeader.split(" ")[1];

    // Verify the token
    jwt.verify(token, process.env.JWTSEKEY, (err, decoded) => {
      if (err) {
        return res.status(403).json("Invalid token");
      }

      // Attach the user information (decoded token) to the request object
      req.user = decoded;

      // Check if the user ID matches the one in the route parameter
      if (req.params.id && req.user.id !== req.params.id) {
        return res.status(403).json("Your ID and token do not match");
      }

      next(); // Call the next middleware/handler
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to authenticate" });
  }
};

module.exports = verifyPass;
