var userlist = {};
var statusCodes = exports.statusCodes = Object.freeze({
  'AVAILABLE':0,
  'BUSY':1
});

/**
 * Check for an existing name
 * @param name - The username to check for
 * @returns True if the name does not exist
 */
function nameOkay(name) {
 if (userlist[name])
  return false;
else
  return true;  
}

/**
 * Add a user
 * @param name - The username to create
 * @returns The user's new ID, or -1
 */
exports.addUser = function(name) {
 if (nameOkay(name)) {
   userlist[name] = statusCodes['AVAILABLE'];
   return true;
 }
 else {
    return false;
 }
};
 
/**
* Remove a user
* @param name - The username to delete
*/
exports.removeUser = function (name) {
  delete userlist[name];
};

/**
* Return the userlist, minus a given username
* @param name - The username to remove
*/
exports.userList = function (name) {
  var userArray = [];
  
  // Loop through userlist
  for (var user in userlist) {
    if(userlist.hasOwnProperty(user)){
      // add each username to the array to return
      if (name) {
        if (user !== name)
          userArray.push(user);
      }
      else
        userArray.push(user);
    }
  }
  return userArray;
};


