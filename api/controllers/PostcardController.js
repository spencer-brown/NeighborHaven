var Lob = require('lob');
Lob = new Lob('test_f40738ecb229604550f62143181a6378d93');
/**
 * PostcardController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  send: function(req, res, next) {
    Lob.postcards.create({
      name: req.param('name'),
      to: {
        name: 'Event Invitee',
        address_line1: req.param('address'),
        address_city: 'New Haven',
        address_state: 'CT',
        address_zip: '06511',
        address_country: 'US'
      },
      from: {
        name: 'Neighbor Haven',
        address_line1: '300 Audubon Ct.',
        address_city: 'New Haven',
        address_state: 'CT',
        address_zip: '06511',
        address_country: 'US'
      },
      message: "You've been invited to an event in your neighborhood to rally behind the war on homelessness in New Haven",
      front: 'http://cl.ly/1x1r1E3B1D3S/download/pdfthing.pdf'
    }, function (err, foo) {
      console.log(err, foo);
      res.json({ message: foo });
    });
  },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to PostcardController)
   */
  _config: {}
};
