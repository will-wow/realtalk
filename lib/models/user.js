// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

/*
// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});
*/

// define the schema for our user model
var userSchema = mongoose.Schema({
    username: String,
    email: String,
    givenName: String,
    middleName: String,
    familyName: String,
    suffix:     String,
    
    local            : {
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
    },
    twitter          : {
        id           : String,
        token        : String,
    },
    google           : {
        id           : String,
        token        : String,
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};
/**
 * Return a user's full name
 * @param: {boolean} firstFirst - True if first name first
 * @param: {String} middleType - MIDDLE, MI, or none
 * @return: {String} The full name
 */
// Put a user's name together
userSchema.methods.fullName = function(firstFirst, middleType) {
  var mi, name;

  // Choose middle name type
  if (this.middleName) {
    switch (middleType) {
    case 'MIDDLE':
      mi = this.middleName;
      break;
    case 'MI':
      mi = this.middleName[0] + '.';
      break;
    default: 
      mi = '';
      break;
    }
  }

  // First name first
  if (firstFirst) {
    // first name
    name = this.givenName;
    // middle name
    if (mi) name = name + " " + mi;
    // last name
    name = name + ' ' + this.lastName;
    // suffix
    if (this.suffix) name = name + ' ' + this.suffix;
    // Last name first
  }
  else {
    // last name, first name
    name = this.lastName + ', ' + this.firstName;
    // middle name
    if (mi) name = name + " " + mi;
    // suffix
    if (this.suffix) name = name + ' ' + this.suffix;
  }
};
// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);