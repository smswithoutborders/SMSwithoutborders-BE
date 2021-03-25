const db = require("../models");
const passport = require("passport");
var User = db.users;


module.exports = (app) => {
    app.post("/login", async (req, res, next) => {
        let user = await User.findOne({
            where: {
                phone_number: req.body.username
            }
        })

        if (!user) {
            const error = new Error("Invalid Phone number");
            error.httpStatusCode = 401;
            return next(error);
        }

        let token = await user.getOauth2s();
        let userData = {
            userProfile: {
                local: user,
                google: token[0].profile
            },
            token: {
                access_token: token[0].accessToken,
                refresh_token: token[0].refreshToken,
                expiry_date: token[0].expiry_date,
                scope: token[0].scope
            }
        };

        req.session.user = userData

        res.redirect("/profile")
    });

    app.post('/register', async (req, res, next) => {
        let user = await User.findOne({
            where: {
                phone_number: req.body.username
            }
        });

        if (user) {
            const error = new Error("Phone number already in use");
            error.httpStatusCode = 400;
            return next(error);
        };

        await User.create({
            phone_number: req.body.username,
            password: req.body.password
        })

        res.json({
            message: "user created successfully"
        });
    });

    app.get('/login/fail', (req, res, next) => {
        const error = new Error("unauthorized please login");
        error.httpStatusCode = 401;
        next(error);
    });
}