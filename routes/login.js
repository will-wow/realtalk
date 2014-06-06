var users = require('../lib/users');

exports.form = function(req, res){
  res.render('login');
};

exports.submit = function(req, res){
  var username = req.body.username;
  
  // Add username & check for success
  if (users.addUser(username)) {
    // If successful, move to chat chooser
    req.session.user = username;
    res.redirect('/chat');
  }
  else {
    // If not successful, pass back "name taken"
    req.error(username + ' is already taken!');
    res.redirect('back');
  }
}; 