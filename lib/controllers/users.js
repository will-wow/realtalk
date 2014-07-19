// Load required packages
var User = require('../models/user');

function updateUserField(req, field) {
  var user = req.user,
      userVal = user[field],
      formVal = req.body[field];
  
  // If it does not match the existing value
  if (userVal !== formVal) {
    user[field] = formVal;
  }
}

//==================
//  NEW USER =======
// (/api/new) ======
//==================
// GET  see if a username is taken
exports.getNew = function(req, res) {
    User.findOne({
        'username': req.params.username
    }, function(err, user) {
        res.send(!!user);
    });
};

// create a user
exports.postNew = function(req, res) {
    // Set up user
    var user = new User();
    
    user.username = req.body.username;
    user.password = user.generateHash(req.body.password);

    // Try to save user
    user.save(function(err) {
        // Return error if failed
        if (err) {
            res.send(err);
        // return true if success
        } else {
            res.json({
                'success': true
            });
        }
    });
};

//==================
//  LOGGED IN USER =
//  (/api/me) ======
//==================
// GET  get info
exports.getMe = function(req, res) {
    var user = req.user,
        resUser = {};
    
    // pull out non-password info
    resUser.username    = user.username;
    resUser.email       = user.email;
    resUser.firstName   = user.firstName;
    resUser.middleName  = user.middleName;
    resUser.lastName    = user.lastName;
    resUser.nameSuffix  = user.nameSuffix;
    
    // send as JSON
    res.json(resUser);
};
// POST to update
exports.postMe = function(req, res) {
    var user = req.user,
        reqUser = req.body;
    
    user.username   = reqUser.username      || user.username;
    user.email      = reqUser.email         || user.email;
    user.firstName  = reqUser.firstName     || user.firstName;
    user.middleName = reqUser.middleName    || user.middleName;
    user.lastName   = reqUser.lastName      || user.lastName;
    user.nameSuffix = reqUser.nameSuffix    || user.nameSuffix;
    
    user.save(function (err) {
        res.send(!err);
    });
};
// DELETE
exports.deleteMe = function(req, res) {
    req.user.remove(function (err, user) {
        res.send(true);
    });
};

//==================
//  CONTACTS =======
//  (/api/contacts/:contacts?)=
//==================
// GET contact list
exports.getContacts = function (req, res) {
    // hold the user, with populated contact usernames
    var user = req.user,
        promise;
    
    if (req.params.contacts) {
        // specificed contacts
        promise = User.populate(user, {
            path: 'contacts',
            select: 'username email -_id',
            match: { username: new RegExp(req.params.contacts,'i')},
        });
    } else {
        // All contacts
        promise = User.populate(user, {
            path: 'contacts',
            select: 'username email -_id'
        });
    }
    
    promise.then(function(user) {
        res.json(user.contacts);
    }).end();
    
};
// DELETE contact list
exports.deleteContacts = function(req, res) {
    req.user.contacts = [];
    
    req.user.save(function(err) {
        // Send true if no error
        res.send(!err);
    });
};
// POST new contact
exports.addContact = function(req, res) {
    var contactName = req.body.contacts,
        user = req.user,
        contacts;
    
    if (contactName) {
        // Find the requested contact's user profile
        User.findOne({
            'username': contactName
        }, function(err, contact) {
            // User not found
            if (err || !contact) {
                res.send(false);
            }
            // Add contact to user's contact list
            else {
                contacts = user.contacts;
                
                // Contact already listed
                if (contacts.indexOf(contact._id) !== -1) {
                    res.json({
                        'added': false
                    });
                // Contact not listed already
                } else {
                    // Add contact
                    contacts.push(contact);
                    user.save(function (err) {
                        // Send success message
                        res.json({
                            'added': !err
                        });
                    });
                }
            }
        });
    // respond with false if no user specified
    } else {
        res.send(false);
    }
};
// DELETE contact
exports.deleteContact = function (req, res) {
    var contactName = req.params.contact,
        user = req.user,
        contacts = user.contacts;
    
    // Find the requested contact's user profile
    User.findOne({
        'username': contactName
    }, function(err, contact) {
        // User not found
        if (err) {
            res.send(false);
        }
        // Remove contact from user's contact list
        else {
            // Contact already listed
            if (contacts.indexOf(contact._id)) {
                res.json({
                    'removed': false
                });
                // Contact not listed already
            }
            else {
                // Add contact
                contacts.splice(contacts.indexOf(contact._id),1);
                user.save(function (err) {
                    // Send success message
                    res.json({
                        'removed': !err
                    });
                });
            }
        }
    });
};

//==================
//  OTHER USERS ====
//  (/api/users) ===
//==================
// Get a filtered userlist
exports.getUsers = function(req, res) {
    // hold the user, with populated contact usernames
    var users;
    
    if (req.params.users) {
        // specificed contacts
        users = User.find({ username: '/' + req.params.users + '/'},
            'username email -_id');
    } else {
        // All contacts
        users = User.find({}, 'username email -_id');
    }
    
    // Send usernames
    users
    .exec(function (err, users) {
        if (err) {
            res.send(false);
        } else {
            // send list of usernames
            res.json(users);
        }
    });
};