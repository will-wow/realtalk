// app/models/user.js
// load the things we need
var mongoose = require('mongoose'),
    bcrypt   = require('bcrypt-nodejs'),

// define the schema for our user model
    userSchema = mongoose.Schema({
      username: String,
      email: String,
      firstName: String,
      middleName: String,
      lastName: String,
      nameSuffix:     String,
      
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
userSchema.methods.buildFullName = function(firstFirst, middleType) {
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
    name = this.firstName;
    // middle name
    if (mi) name = name + " " + mi;
    // last name
    name = name + ' ' + this.lastName;
    // suffix
    if (this.nameSuffix) name = name + ' ' + this.nameSuffix;
    // Last name first
  }
  else {
    // last name, first name
    name = this.lastName + ', ' + this.firstName;
    // middle name
    if (mi) name = name + " " + mi;
    // suffix
    if (this.nameSuffix) name = name + ' ' + this.nameSuffix;
  }
};

/**
 * Split a full name, and assign it to the name attributes
 * @param: {String} 
 */
userSchema.virtual('fullName')
  .get(function () {
    return this.buildFullName(true, 'MIDDLE');
  })
  .set(function (name) {
    // Regex to split name into first, optional middle, last, optional 3 char suffix
    var re = /^(\S+)(?: (?:(\S+)(?= (?!\S{1,3}$)) )?(\S+)(?: |$)(?:(\S{1,3})$)?)?/,
        regexName = name.match(re);
    
    // If the user has anything other than a first name, they probably are happy
    // with their name. Leave it.
    if (this.middleName || this.familyName || this.suffix) {
      // Update blank fields
      this.firstName  = this.firstName || regexName[1];
      this.middleName  = this.middleName || regexName[2].replace('.','');
      this.lastName  = this.lastName || regexName[3];
      this.nameSuffix  = this.nameSuffix || regexName[4];
    }
  });

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);