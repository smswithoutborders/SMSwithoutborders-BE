const db = require("../models");
const passport = require("passport");
var User = db.users;

module.exports = (app) => {
    app.post("/login", passport.authenticate("local", {
        successRedirect: '/profile',
        // failureRedirect: '/login/fail'
    }));

    app.post('/register', async (req, res, next) => {
        let user = await User.findOne({
            where: {
                phone_number: req.body.username
            }
        });

        if (user) {
            return res.json("user exist");
        };

        await User.create({
            phone_number: req.body.username,
            password: req.body.password
        })

        res.send("user created successfully");
    });

    app.get('/login/fail', (req, res, next) => {
        const error = new Error("unauthorized please login");
        error.httpStatusCode = 401;
        next(error);
    });
}