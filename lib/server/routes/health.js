'use strict';
const Router = require('./index');
const inherits = require('util').inherits;
const log = require('../../logger');

function HealthRouter(options) {
  if (!(this instanceof HealthRouter)) {
    return new HealthRouter(options);
  }
  Router.apply(this, arguments);
}

inherits(HealthRouter, Router);

HealthRouter.prototype.healthCheck = function(req, res) {
  if (this.storage.
}

HealthRouter.prototype._definitions = function () {
  return [
    ['GET', '/health', this.healthCheck]
  ]
}

module.exports = HealthRouter;
