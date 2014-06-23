// routes/link.js

// Object holding a link for the nav bar

function Link(activeLink, name, url) {
  // Get name with uppercase, if given
  this.name = name;
  // reset name and activeLink to lowercase for comparison
  name = name.toLowerCase();
  activeLink = activeLink.toLowerCase();
  
  // Get or guess at other varables
  this.url = url || '/' + name;
  this.active = (name === activeLink);
}
module.exports = Link;