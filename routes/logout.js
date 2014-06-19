exports.redirect = function(req, res) {
    req.session.destroy();
    res.redirect('/');
};