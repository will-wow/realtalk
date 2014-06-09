exports.app = function(req, res){
  res.render('chat', {username: req.session.user});
};