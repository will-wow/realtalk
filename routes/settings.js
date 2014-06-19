exports.form = function(req, res){
  res.render('settings', {username: req.session.user});
};