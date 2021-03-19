const db = require("../models");
const passport = require("passport");
var User = db.users;

module.exports = (app) => {
    app.post("/login", passport.authenticate("local", {
        failureRedirect: "/auth/failed"
    }), (req, res) => {
        res.redirect("/profile");
    });

    app.post('/register', (req, res, next) => {
        User.findOne({
            phone_number: req.body.username
        }, (err, user) => {
            if (err) {
                next(err);
            } else if (user) {
                return res.json({
                    error: "user exist"
                })
            } else {
                User.create({
                    phone_number: req.body.username,
                    password: req.body.password
                }, (err, newUser) => {
                    if (err) {
                        console.log(err)
                    } else {
                        next(null, newUser);
                    }
                })
            }
        }, passport.authenticate('local', {
            failureRedirect: '/auth/failed'
        }), (req, res, next) => {
            res.redirect('/profile');
        })
    });

    app.get('/auth/failed', (req, res) => {
        res.json({
            error: "authentication failed"
        })
    });
}