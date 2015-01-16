/*
 * Q-municate chat application
 *
 * Person Model
 *
 */

define([
  'jquery',
  'underscore',
  'backbone',
  'config'
], function($, _, Backbone, QMCONFIG) {

  var App;

  var Person = Backbone.Model.extend({
    defaults: {
      full_name: null,
      email: null,
      phone: '',
      avatar: null,
      avatar_url: QMCONFIG.defAvatar.url,
      status: '',
      facebook_id: null
    },

    validate: function(attrs) {
      var MAX_SIZE = QMCONFIG.maxLimitFile * 1024 * 1024;

      // Field: full_name
      // mandatory; 3-50 characters; could contain everything except '<', '>' and ';'
      if (!attrs.full_name) {
        return 'Name is required';
      }
      if (attrs.full_name.length < 3) {
        return QMCONFIG.errors.shortName;
      }
      if (!/^[^><;]{0,}$/.test(attrs.full_name)) {
        return QMCONFIG.errors.invalidName;
      }

      // Field: phone
      // only valid phone number; 0-20 characters
      if (attrs.phone) {
        if (!/^[-0-9()+*#]{0,}$/.test(attrs.phone)) {
          return QMCONFIG.errors.invalidPhone;
        }
      }

      // Field: avatar
      // only image file; not more than 10 MB; filename not more than 100 characters
      if (attrs.avatar) {
        if (!/^image.{0,}$/.test(attrs.avatar.type)) {
          return QMCONFIG.errors.avatarType;
        }
        if (attrs.avatar.size > MAX_SIZE) {
          return QMCONFIG.errors.fileSize;
        }
        if (attrs.avatar.name.length > 100) {
          return QMCONFIG.errors.fileName;
        }
      }
      
    },

    parse: function(data, options) {
      if (typeof options === 'object') {
        App = options.app;
      }

      _.each(data, function(val, key) {
        var isHasKey = _.has(this.defaults, key);
        if (key !== 'id' && !isHasKey) {
          delete data[key];
        } else if (typeof val === 'string') {
          data[key] = val.trim();
        }
      }, this);

      return data;
    },

    initialize: function() {
      
    },

    update: function() {
      var currentUser = App.models.User.contact,
          QBApiCalls = App.service,
          data = this.changed,
          params = {},
          custom_data = currentUser.custom_data && JSON.parse(currentUser.custom_data) || {},
          self = this;

      if (Object.keys(data).length === 0 || (Object.keys(data).length === 1 && Object.keys(data)[0] === 'avatar' && !data.avatar)) return;
      
      if (data.full_name) {
        params.full_name = currentUser.full_name = data.full_name;
      }
      if (data.phone) {
        params.phone = currentUser.phone = data.phone;
      }
      if (data.status) {
        custom_data.status = currentUser.status = data.status;
        params.custom_data = currentUser.custom_data = JSON.stringify(custom_data);
      }
      if (data.avatar) {
        this.uploadAvatar(data.avatar, function(blob) {
          self.set('avatar_url', blob.path);

          params.blob_id = currentUser.blob_id = blob.id;
          custom_data.avatar_url = currentUser.avatar_url = blob.path;
          params.custom_data = currentUser.custom_data = JSON.stringify(custom_data);

          $('.profileUserName[data-id="'+currentUser.id+'"]').text(currentUser.full_name);
          $('.profileUserAvatar[data-id="'+currentUser.id+'"]').css('background-image', 'url('+currentUser.avatar_url+')');
          App.models.User.rememberMe();

          QBApiCalls.updateUser(currentUser.id, params, function(res) {
            if (QMCONFIG.debug) console.log('update of user', res);
          });
        });
      } else {
        $('.profileUserName[data-id="'+currentUser.id+'"]').text(currentUser.full_name);
        App.models.User.rememberMe();

        QBApiCalls.updateUser(currentUser.id, params, function(res) {
          if (QMCONFIG.debug) console.log('update of user', res);
        });
      }      
    },

    uploadAvatar: function(avatar, callback) {
      var QBApiCalls = App.service,
          Attach = App.models.Attach;

      Attach.crop(avatar, {w: 146, h: 146}, function(file) {
        QBApiCalls.createBlob({file: file, 'public': true}, function(blob) {
          callback(blob);
        });
      });
    }

  });

  return Person;

});