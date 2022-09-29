var jwt = require("jsonwebtoken");
module.exports = {
    verifyToken: async(req, res, next) => {
        var token = req.headers.authorization;
        try {
            if (token) {
                let payload = await jwt.verify(token, process.env.SECRET);
                req.user = payload;
                return next();
            } else {
                return res.json({ er: "token is required" });
            }
        } catch (error) {
            return error;
        }
    }
}