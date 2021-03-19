const db = require("../models");
const passport = require("passport");
var User = db.users;

module.exports = (app) => {
    app.post("/login", passport.authenticate("local", {
        successRedirect: '/profile',
        failureRedirect: '/auth/failed',
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

    app.get('/auth/failed', (req, res) => {
        res.json({
            error: "failed to auth"
        })
    });
}