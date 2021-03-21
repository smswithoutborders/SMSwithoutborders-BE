module.exports = (app) => {
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login/fail');
    };

    function checkTokenExist(req, res, next) {
        if (req.user.token.length > 0) {
            return next();
        }
        const error = new Error("Please get a tokens");
        error.httpStatusCode = 403;
        return next(error)
    }

    let checks = [ensureAuthenticated, checkTokenExist];
    app.get("/profile", checks, (req, res) => {
        res.json({
            user: req.user
        });
    })
}