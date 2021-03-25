const db = require("../models");
var User = db.users;
const {
    v4: uuidv4
} = require('uuid');

module.exports = (app) => {
    app.post("/users/profile", async (req, res, next) => {
        if (req.body.phone_number) {
            let user = await User.findOne({
                where: {
                    phone_number: req.body.phone_number
                }
            });

            if (!user) {
                const error = new Error("phone number doesn't exist");
                error.httpStatusCode = 401;
                return next(error);
            }

            // console.log(uuidv4());
            await user.update({
                auth_key: uuidv4()
            });

            return res.status(200).json({
                auth_key: user.auth_key
            });
        }

        const error = new Error("phone number cannot be empty");
        error.httpStatusCode = 400;
        return next(error);
    });

    
}