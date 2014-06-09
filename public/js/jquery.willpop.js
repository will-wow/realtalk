/**
 * jQuery WillPop
 * @overview A library of pop-up related jQuery plugin functions
 * @version 1.0.0
 * @author Will Lee-Wagner <will@whentheresawill.net>
 * @license MIT <http://opensource.org/licenses/mit-license.php>
 */

/**
 * Copyright (C) 2014 Will Lee-Wagner
 *
 * MIT LICENSE
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 
;(function ($) {
/**
 * addCenterPop
 * A plug-in to generate responsive, centered pop-ups 
 * which can be cusomized, and returns the div to add elements to
 */
 (function () {
    /**
     * px greater than popWidth at which to switch to mobile view
     * @constant
     */
    const POP_RESPONSIVE_PADDING = 100;
    
    /**
     * Pop-up HTML
     */
    var pop$ = $('<div class="pop-overlay"><div class="pop-container"><div class="pop">'),
        settings;
    
    /**
     * Build the sytlesheet for the popup & add it to the page
     * This keeps the user from having to add in a seperate css file
     * But still allows for media queries
     */
    function addStyleSheet() {
      var sheet = '<style class="jquery-pop">\
      body {margin:0;}\
      .pop-overlay {\
          background-color:' + settings.overlayColorFallback + ';\
          background-color:' + settings.overlayColor + ';\
          position: fixed;\
          top:0;\
          left:0;\
          width: 100%;\
          height: 100%;\
          z-index: 99;\
          display: none;\
      }\
      .pop-container {\
          position: relative;\
          background-color:' + settings.containerColorFallback + ';\
          background-color:' + settings.containerColor + ';\
          top: 50%;\
          left:50%;\
          width: ' + settings.popWidth + 'px;\
          margin-left: -' + (settings.popWidth/2) + 'px;\
          overflow-x: hidden;\
          color:' + settings.textColor + ';\
          text-align: center;\
          font-family:' + settings.fontFamilies + ';\
      }\
      .pop {\
          width: 90%;\
          height:100%;\
          margin: 0 auto;\
      }\
      @media screen and (max-width: ' + (settings.popWidth+POP_RESPONSIVE_PADDING) + 'px) {\
        .pop-overlay {background-color: none;}\
        .pop-container {\
            background-color:' + settings.mobileColorFallback + ';\
            background-color:' + settings.mobileColor + ';\
            top: 0;\
            left:0;\
            width: 100%;\
            height: 100%;\
            margin-top: 0;\
            margin-left: 0;\
        .pop-container {\
          overflow-y: hidden;\
          height: inherit;\
          margin-top: 0;\
        }\
      }</style>';
      
      $('head').append(sheet);
    }
    
    
    // Functions for centering the popup
    
    /**
     * Set height of pop-up based on height of interior.
     * Then vertically center the popup
     */
    function setHeight() {
      // Show the popup to get the height to populate to the DOM
      pop$.show();
      // Grab the height info
      var height = pop$.find('.pop').height(),
      screen = $(window).height(),
      containerHeight, overflow;
      // Re-hide the pop (it will fade in later)
      pop$.hide();
      
      // Only put in a scroll bar if needed
      if (height > screen) {
        containerHeight = screen;
        overflow = 'overlay';
      }
      else if (height < 400) {
        containerHeight = 400;
        overflow = 'hidden';
      }
      else {
        containerHeight = height;
        overflow = 'hidden';
      }
      // Build the stylesheet & add it to the page
      // do it this way, instead of with jQuery.css(),
      // to be able to use media queries
      $('head style.jquery-pop').before(
        '<style class="jquery-pop-height">\
          .pop-container {\
            overflow-y: ' + overflow + ';\
            height: ' + containerHeight + 'px;\
            margin-top: ' + '-' + containerHeight/2 + 'px;\
          }\
        </style>'
      );
    }
    /**
     * Remove the pop-up's height style sheet.
     * Lets it reset for next time
     */
    function removeHeight() {
      $('head style.jquery-pop-height').remove();
    }
    
    
    // Open/Close callbacks
    
    /**
     * Open the popup
     */
    function popUp() {
      // set height. Do this every time, in case the window changed
      setHeight();
      // run the open callback (if any)
      if (settings.onOpen)
        settings.onOpen(this);
      pop$.fadeIn('fast');
    }
    /**
     * Close the popup
     */
    function popDown() {
      pop$.fadeOut('fast',function () {
        // remove the height of the inner pop
        removeHeight();
        // run the open function (if any)
        if (settings.onClose)
          settings.onClose(this);
      });
    }
    
    /**
     * Add the popUp to the DOM
     * With click handlers on the chained jQuery objects
     * @param {Object=} options - Options hash for the popup
     * @returns {jQuery} A reference to the interior of the popup
     */
    $.fn.addCenterPop = function(options) {
      // Merge defaults with given options
      settings = $.extend($.fn.addCenterPop.defaults,options||{});
      
      // append pop to DOM
      $('body').append(pop$);
      // append stylesheet
      addStyleSheet();
      
      
      // Add Listeners
      
      // click given wrapped set to bring up popup
      this.click(popUp);
      // click pop to bring it back down
      pop$.click(popDown);
      // stop clicks on the container from bringing down the popup
      if (!(settings.innerClickClose)) {
        pop$.find('.pop-container').click(function (e) {
          if ($(document).width() > (settings.popWidth+POP_RESPONSIVE_PADDING))
            e.stopPropagation();
        });
      }
      
      // return the internal div of the popup
      // users can append content to this div
      return pop$.find('.pop');
    };
    
    /**
     * Defaults for options hash
     */
    $.fn.addCenterPop.defaults = {
      // Colors for page overlay
      overlayColorFallback:   'rgb(100,100,100)',
      overlayColor:           'rgba(0,0,0,0.5)',
      // Colors for popup contianer
      containerColorFallback: 'rgb(30,30,30)',
      containerColor:         'rgba(0,0,0,0.9)',
      // Colors for popup container in mobile (which has no overlay)
      mobileColorFallback:    'rgb(70,70,70)',
      mobileColor:            'rgba(0,0,0,0.7)',
      // Pop-up text options
      textColor:              'white',
      fontFamilies:           'sans-serif',
      // Width in desktop view
      popWidth:               400,
      // Clicking the popup's interior closes it
      innerClickClose:        false,
      // Callback when popup opens (before fadeIn)
      onOpen:                 null,
      // Callback when popup closes (after fadeOut)
      onClose:                null
    };
    
  })();
  
/**
 * showCenteredMessage
 * A function to display temporary messages in the middle of a div
 */
 (function () {
    var msg$, padding = 5, msgHeight, msgWidth, containerWidth, css, settings;
    
    /** 
    * Run a callback, if included in the options
    */
    function runCallback() {
      if (settings.callback)
        settings.callback();
    }
    
    /**
     * Build the HTML for the message
     @param {string} message - The message text
     */
    // Build the HTML for the message
    function msgHTML(message) {
      // add class if specified. This is good for refering to the message later,
      // or styleing it further
      var msg;
      
      if (settings.className)
        msg = '<div class="' + settings.className + '">' + message + '</div>';
      else
        msg = '<div>' + message + '</div>';
      
      return msg;
    }
    
    /**
     * Add the message to the specified div
     * @param {Object=} options - Options hash
     * @returns {jQuery} this - The previous jQuery object
     */
    $.fn.showCenteredMessage = function(message, options) {
      settings = $.extend($.fn.showCenteredMessage.defaults,options||{});
      // Get width of containing div
      containerWidth = this.width();
      
      // build and style the message
      msg$ = $(msgHTML(message)).css({
        'background-color': settings.backColor,
        'color': settings.textColor,
        'font-family': settings.fontFamilies,
        'text-align': 'center',
        'border-radius': '20px',
        'position': 'absolute',
        'padding': padding + 'px',
        'min-width': '100px',
        'max-width': containerWidth - padding*4 + 'px'
      });
      // Append the message to the given element
      // this will calculate the size of the message
      // Since it's set to fixed width, the size will not be affected by
      // surrounding margins
      this.append(msg$);
      
      // Get dimensions, now that the message has them from being appended
      msgWidth = msg$.width();
      msgHeight = msg$.height();
      
      // Adjust the placement of the message to center it exactly
      // This includes setting it to position: absolute
      // Do this now, after the message has dimensions from the DOM
      css = {
        'margin-top': '-' + msgHeight/2 + 'px',
        'top': '50%',
        'left': '50%'
      };
      // conditional, depending on size
      if (msgWidth >= containerWidth) {
        css['margin-left'] = '0';
        css['width']= containerWidth + 'px';
      }
      else {
        css['margin-left'] = '-' + (msgWidth/2 + padding) + 'px';
      }
      // Add css to msg
      msg$.css(css)
      // hide, so the message can fade in
      .hide()
      
      // fade in
      .fadeIn(settings.fadeSpeed,function() {
        // If fadeout requested:
        if (settings.fadeOut) {
          // After specified timeout:
          window.setTimeout(function () {
            // Fade back out
            msg$.fadeOut(settings.fadeSpeed,function () {
              // After fadeout, run given callback
              runCallback();
              // remove the popup from the DOM
              msg$.remove();
            });
          }, settings.fadeWait);
        }
        // If no fadeOut, just run the callback
        else {
          runCallback();
        }
      });
      
      // Return the original element
      return this;
    };
    
    /**
     * Defaults for settings hash
     */
    $.fn.showCenteredMessage.defaults = {
      // Color of message background
      backColorFallback:  'rgb(30,30,30)',
      backColor:          'rgba(0,0,0,0.5)',
      // Text options
      textColor:          'white',
      fontFamilies:       'sans-serif',
      // Time to wait before fading out
      fadeWait:           '1000',
      // Speed of fade in/out
      fadeSpeed:          'slow',
      // Add a class to the message
      className:          null,
      // False to leave the message (to be taken out later)
      fadeOut:            true,
      // Callback to run after fadeOut
      callback:           null
    };
    
  })();

/**
 * addContactPop
 * Generates responsive, centered pop-ups with "contact me" content.
 * That can send AJAX email JSON files to a server
 */
  (function () {
    var pop$, settings;
    
    /**
     * Build the markup for the interior of the popup
     * @returns {string} The built HTML
     */
    function markup() {
      var pop = '';
      
      // set up email html
      if (settings.emailUrl) {
        pop += '<form class="email-form">';
        if (settings.emailMsg) {
          pop += ' <p class="email-label">' + settings.emailMsg + '</p>';
        }
        pop += '' +
            '<input type="test" name="emailfrom" id="email-from" placeholder="Your email address"/>' +
            '<textarea name="email" id="email"></textarea>' +
            '<input class="email-submit" type="submit" value="Submit"/>' +
          '</form>';
      }
      // set up social media html
      if (settings.socialUrls) {
        pop += '<div class="icon-container">';
        if (settings.socialMsg) {
          pop += '<p>' + settings.socialMsg + '</p>';
        }
        pop += '<div class="icons">';
        // add social buttons
        for (var i in settings.socialUrls) {
          var name = i,
            url, file;
          
          // Check if the user sent in an array with a filename or not
          if ($.isArray(settings.socialUrls[i])) {
            // get the filename and the url
            url = settings.socialUrls[i][0],
            file = settings.socialUrls[i][1];
          }
          else {
            // get the url and set the filename to the regular name
            url  = settings.socialUrls[i];
            file = name;
          }
          // set up the icon's HTML
          pop += '\
            <a class="icon" href="'+ url + '" target="_blank">\
              <img src="' + settings.socialDir + file + '.png" title="' + name + '">\
            </a>';
        }
        pop += '</div></div>';
      }
      
      return pop;
    }
    
    /**
     * Build and add the stylesheet to the page
     */
    function addStyleSheet() {
      var sheet = '<style class="jquery-contact">\
        .pop a {text-decoration: none;}\
        .pop {font-size: 1.2em;}\
        /* email form */\
        .pop form {padding: 10px 0;}\
        .pop #email-from {\
          width: 100%;\
          font-size: 0.9em;\
        }\
        .pop .contact-warning {\
          background-color: ' + settings.warningColor + ';\
        }\
        .pop .email-label {\
          padding: 10px 0;\
          margin: 0;\
        }\
        .pop textarea {\
          width: 100%;\
          max-width: 100%;\
          margin: 5px 0;\
          padding: 5px;\
          border:0;\
          height: 200px;\
          resize: none;\
          font-family: sans-serif;\
          font-size: 0.8em;\
          /* make padding internal */\
          -webkit-box-sizing: border-box;\
          -moz-box-sizing: border-box;\
          box-sizing: border-box;\
        }\
        .pop .submit {padding: 8px;}\
        .pop input {\
          border: 0;\
          padding: 3px;\
          margin: 5px auto;\
          display: block;\
          width: 100%;\
          font-size: 1.1em;\
          /* make padding internal */\
          -webkit-box-sizing: border-box;\
          -moz-box-sizing: border-box;\
          box-sizing: border-box;\
        }\
        /* Socail Media */\
        .pop .icon-container {\
          width: 100%;\
          padding-bottom: 10px;\
          text-align: center;\
        }\
        .pop .icons {\
          text-align: center;\
          width:100%;\
        }\
        .pop .icon {\
          display: inline-block;\
          zoom: 1;\
          *display: inline;\
          position: relative;\
          width:23%;\
          max-width:32px;\
          padding: 0 1%;\
        }\
        </style>';
        
      $('head').append(sheet);
    }
    
    /**
     * Mark incorrect email fields and display a warning message
     * @param {string} fields - The jQuery selector for the fields to mark
     */
    function showWarnings(fields) {
      if (fields) {
        pop$.find(fields).addClass('contact-warning');
        displayMessage('Please complete the email before sending.');
      }
    }
    /**
     * Mark email fields as correct
     * @param {string} fields - The jQuery selector for the fields to unmark
     */
    function hideWarnings(fields) {
      pop$.find(fields).removeClass('contact-warning');
    }
    
    /**
     * Display a message in the middle of the popup
     * @param {string} message - The message to display
     * @param {function=} callback - The callback to run after the msg fades
     */
    function displayMessage(message, callback) {
      pop$.showCenteredMessage(message, {'callback': callback});
    }
    
    /**
     * Validate an email message
     * @return {boolean} validated - If the email message was valid
     */
    function validateEmail() {
      var email, problemFields = '',
          okayFields = '',
          validated = true;
      
      // check email
      email = pop$.find('#email-from').val();
      if (!(email.match(/.+@.+\..+/))) {
        problemFields = '#email-from';
        validated = false;
      }
      else {
        okayFields = '#email-from';
      }
      
      // check message
      if (pop$.find('#email').val() === '') {
        if (problemFields !== '') problemFields += ', ';
        problemFields += '#email';
        validated = false;
      }
      else {
        if (okayFields !== '') okayFields += ', ';
        okayFields += '#email';
      }
      
      // update warnings
      showWarnings(problemFields);
      hideWarnings(okayFields);
      return validated;
    }
    
    /**
     * Send the email message as an AJAX request
     */
    function sendEmailRequest() {
      if (settings.testMode) {
        console.log('Url: ' + settings.emailUrl);
        console.log(pop$.find('.email-form').serialize());
        displayMessage('Email sent!', clearEmail);
      }
      else {
        $.post(
          settings.emailUrl,
          pop$.find('.email-form').serialize(),
          function(response){
            if (response.sent) {
              // Display success message
              displayMessage('Email sent!', clearEmail);
            }
            else {
              validateEmail();
              if (response.message) {
                // Display server's message
                displayMessage(response.message);
              }
              else {
                // DISPLAY DEFAULT MESSAGE
                displayMessage('A server error occured. Please try again.');
              }
            }
          },
          "json"
        );
      }
    }
    

    // Icon sizing callback functions
    
    /**
     * make an image bigger
     * @callback imgBig
     */
    function imgBig() {
      $(this).stop().animate({
        'width': '40px'
      }, 'fast');
    }
    /**
     * make an image smaller
     * @callback imgSml
     */
    function imgSml() {
      $(this).stop().animate({
        'width': '32px'
      }, 'fast');
    }
    
    // Email callback functions
    /**
     * Validate then send an email
     * @callback sendEmail
     * @param {Event} e
     */
    function sendEmail(e) {
      e.preventDefault();
      if (validateEmail()) {
        sendEmailRequest();
      }
    }
    /**
     * Clear the email fields
     * @callback clearEmail
     */
    function clearEmail() {
      var emailFields = '#email-from, #email';
      pop$.find(emailFields).val('');
      hideWarnings(emailFields);
    }
    
    /**
     * Add the Contact Me popup to the DOM, and set click handlers to show it
     * @param {Object=} options - Options hash
     * @returns {jQuery} this - The previous jQuery object
     */
    $.fn.addContactPop = function(options) {
      settings = $.extend($.fn.addContactPop.defaults,options||{});
      
      // Set up the addCenterPop popup with the given options
      pop$ = $('#contact').addCenterPop(options);
      // Append HMTL to popup object
      pop$.append(markup());
      // Append stylesheet
      addStyleSheet();
      
      
      // Add listeners
      
      // send email on submit
      pop$.find('form').submit(sendEmail);
      
      // enlarge icons on hover
      if (settings.socialAnimate)
        pop$.find('.icon img').hover(imgBig, imgSml);
      
      // return wrapped set
      return this;
    };
    
    /**
    * Default Options Hash
    */
    $.fn.addContactPop.defaults = $.extend($.fn.addCenterPop.defaults, {
      emailUrl:           null,
      emailMsg:           null,
      warningColor:       '#B20000',
      socialUrls:         {},
      socialDefaultIcon:  'link',
      socialAnimate:      true,
      socialMsg:          null,
      socialDir:          '',
      testMode:           false,
    });
      
  })();
})(jQuery);
