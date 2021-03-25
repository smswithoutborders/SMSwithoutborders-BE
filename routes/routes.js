const db = require("../models");
var User = db.users;
const {
    v4: uuidv4
} = require('uuid');
const {
    Op
} = require("sequelize");

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

    app.post("/users/stored_tokens", async (req, res, next) => {
        let user = await User.findOne({
            where: {
                [Op.and]: [{
                    auth_key: req.body.auth_key
                }, {
                    id: req.body.user_id
                }]
            }
        })

        if (!user) {
            const error = new Error("Invalid user");
            error.httpStatusCode = 401;
            return next(error);
        }

        let token = await user.getOauth2s();
        let userData = {
            token: {
                access_token: token[0].accessToken,
                refresh_token: token[0].refreshToken,
                expiry_date: token[0].expiry_date,
                scope: token[0].scope
            }
        };

        return res.status(200).json(userData);
    })

    app.post("/users/tokens", async (req, res, next) => {
        let user = await User.findOne({
            where: {
                auth_key: req.body.auth_key
            }
        })

        if (!user) {
            const error = new Error("Invalid user");
            error.httpStatusCode = 401;
            return next(error);
        }

        // req.session.userId = user.id

        return res.redirect("/oauth2/google/Tokens/?iden=" + user.id);
    });
}