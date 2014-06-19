exports.mw = function (req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.session.user)
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
};