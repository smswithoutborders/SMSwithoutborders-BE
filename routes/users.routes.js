module.exports = (app) => {
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login/fail');
    };

    app.get("/profile", ensureAuthenticated, (req, res) => {
        res.json({
            user: req.user
        });
    })
}