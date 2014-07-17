/*
 * Q-municate chat application
 *
 * Routes
 *
 */

module.exports = (function() {

  return {
    init: function() {
      var UserView = require('./user/UserView'),
          FriendlistView = require('./friendlist/FriendlistView');

      $(document).on('click', function(event) {
        clickBehaviour(event);
      });

      $('input:file').on('change', function() {
        changeInputFile($(this));
      });

      /* welcome buttons
      ----------------------------------------------------- */
      $('#signupFB, #loginFB').on('click', function(event) {
        if (QMCONFIG.debug) console.log('connect with FB');
        event.preventDefault();

        // NOTE!! You should use FB.login method instead FB.getLoginStatus
        // and your browser won't block FB Login popup
        FB.login(function(response) {
          if (QMCONFIG.debug) console.log('FB authResponse', response);
          if (response.status === 'connected') {
            UserView.connectFB(response.authResponse.accessToken);
          }
        }, {scope: QMCONFIG.fbAccount.scope});
      });

      $('#signupQB').on('click', function() {
        if (QMCONFIG.debug) console.log('signup with QB');
        UserView.signupQB();
      });

      $('#loginQB').on('click', function(event) {
        if (QMCONFIG.debug) console.log('login wih QB');
        event.preventDefault();
        UserView.loginQB();
      });

      $('#forgot').on('click', function(event) {
        if (QMCONFIG.debug) console.log('forgot password');
        event.preventDefault();
        UserView.forgot();
      });

      /* forms
      ----------------------------------------------------- */
      $('#signupForm').on('click', function(event) {
        if (QMCONFIG.debug) console.log('create user');
        event.preventDefault();
        UserView.signupForm();
      });

      $('#loginForm').on('click', function(event) {
        if (QMCONFIG.debug) console.log('authorize user');
        event.preventDefault();
        UserView.loginForm();
      });

      $('#forgotForm').on('click', function(event) {
        if (QMCONFIG.debug) console.log('send letter');
        event.preventDefault();
        UserView.forgotForm();
      });

      $('#resetForm').on('click', function(event) {
        if (QMCONFIG.debug) console.log('reset password');
        event.preventDefault();
        UserView.resetForm();
      });

      /* popovers
      ----------------------------------------------------- */
      $('#profile').on('click', function(event) {
        event.preventDefault();
        removePopover();
        UserView.profilePopover($(this));
      });

      $('.list:not(.list_contacts)').on('contextmenu', '.contact', function(event) {
        event.preventDefault();
        removePopover();
        UserView.contactPopover($(this));
      });

      /* popups
      ----------------------------------------------------- */
      $('.header-links-item').on('click', '#logout', function(event) {
        event.preventDefault();
        openPopup($('#popupLogout'));
      });

      $('#logoutConfirm').on('click', function() {
        UserView.logout();
      });

      $('.popup-control-button').on('click', function(event) {
        event.preventDefault();
        closePopup();
      });

      $('.search').on('click', function() {
        if (QMCONFIG.debug) console.log('global search');
        FriendlistView.globalPopup();
      });

      /* search
      ----------------------------------------------------- */
      $('#globalSearch').on('submit', function(event) {
        event.preventDefault();
        FriendlistView.globalSearch($(this));
      });

      $('.list_contacts').on('click', 'button.sent-request', function() {
        $(this).after('<span class="sent-request l-flexbox">Request Sent</span>');
        $(this).remove();
      });

      $('#searchContacts').on('keyup search submit', function(event) {
        event.preventDefault();
        var type = event.type,
            code = event.keyCode; // code=27 (Esc key), code=13 (Enter key)

        if ((type === 'keyup' && code !== 27 && code !== 13) || (type === 'search')) {
          UserView.localSearch($(this));
        }
      });

      /* temporary routes
      ----------------------------------------------------- */
      $('.list').on('click', '.contact', function(event) {
        event.preventDefault();
      });

      $('#home, #share, #contacts').on('click', function(event) {
        event.preventDefault();
      });

    }
  };
})();

/* Private
---------------------------------------------------------------------- */
// Checking if the target is not an object run popover
function clickBehaviour(e) {
  var objDom = $(e.target);

  if (objDom.is('#profile, #profile *') || e.which === 3) {
    return false;
  } else {
    removePopover();

    if (objDom.is('.popups') && !$('.popup.is-overlay').is('.is-open')) {
      closePopup();
    } else {
      return false;
    }
  }
}

function changeInputFile(objDom) {
  var URL = window.webkitURL || window.URL,
      file = objDom[0].files[0],
      src = file ? URL.createObjectURL(file) : QMCONFIG.defAvatar.url,
      fileName = file ? file.name : QMCONFIG.defAvatar.caption;
  
  objDom.prev().find('img').attr('src', src).siblings('span').text(fileName);
  if (typeof file !== 'undefined') URL.revokeObjectURL(src);
}

function removePopover() {
  $('.is-contextmenu').removeClass('is-contextmenu');
  $('.popover').remove();
}

var openPopup = function(objDom) {
  objDom.add('.popups').addClass('is-overlay');
};

var closePopup = function() {
  $('.is-overlay').removeClass('is-overlay');
};