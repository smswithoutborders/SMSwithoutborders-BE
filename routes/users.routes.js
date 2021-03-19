module.exports = (app) => {
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/auth/failed');
    };

    app.get("/profile", ensureAuthenticated, (req, res) => {
        res.json({
            phone_number: req.user
        });
    })
}