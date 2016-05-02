'use strict';
/* eslint no-invalid-this: "off" */

const ty = require('then-yield');

const introduce = require('introduce')(__dirname);
const trackedLoginInit = introduce('tickets/TrackedLogin');
const serviceInit = require('./Service');
const tgen = require('./TicketGenerator');
let log;

function TicketRegistry(mongoose, model, LT, ST) {
  this.mongoose = mongoose;
  this.Service = serviceInit(mongoose);
  this.TrackedLogin = trackedLoginInit(mongoose);
  this.TGT = model;
  this.LT = LT;
  this.ST = ST;
}

TicketRegistry.prototype.close = function close() {
  // Server will handle it.
  return Promise.resolve();
};

TicketRegistry.prototype.genLT = function genLT(expires) {
  function* generator() {
    log.debug('generating lt');
    let lt;
    try {
      lt = yield this.LT.create({
        tid: `LT-${tgen()}`,
        expires: expires
      });
      if (!lt) {
        throw new Error('could not create login ticket');
      }
    } catch (e) {
      log.debug('generating lt failed: %s', e.message);
      throw e;
    }
    log.debug('generated lt: %s', lt.tid);
    return lt;
  }
  return ty.spawn(generator.bind(this));
};

TicketRegistry.prototype.genTGT = function genTGT(loginTicketId, userId, expires) {
  /* eslint max-statements: "off" */
  function* generator() {
    log.debug('validating lt: %s', loginTicketId);
    const lt = yield this.LT.findOne({tid: loginTicketId});
    if (!lt) {
      log.debug('could not find lt with id: %s', loginTicketId);
      throw new Error('no login ticket found');
    }
    log.debug('validated lt: %s', lt.tid);

    let tgt;
    try {
      log.debug('generating tgt');
      tgt = yield this.TGT.create({
        tid: `TGT-${tgen()}`,
        expires: expires,
        userId: userId,
        loginTicket: lt
      });
      if (!tgt) {
        throw new Error('could not generate tgt');
      }
    } catch (e) {
      log.debug('could not generate tgt: %s', e.message);
      throw e;
    }
    log.debug('generated tgt: %s', tgt.tid);
    return tgt;
  }

  return ty.spawn(generator.bind(this));
};

TicketRegistry.prototype.genST = function genST(ticketGrantingTicketId, expires, serviceId) {
  /* eslint max-statements: "off" */
  /* eslint complexity: "off" */
  function* generator() {
    log.debug('validating tgt: %s', ticketGrantingTicketId);
    let tgt;
    try {
      tgt = yield this.TGT.findOne({tid: ticketGrantingTicketId});
      if (!tgt) {
        throw new Error('could not find ticket granting ticket');
      }
      log.debug('validated tgt: %s', tgt.tid);
    } catch (e) {
      log.debug('could not find tgt: %s', e.message);
      throw e;
    }

    log.debug('validating service: %s', serviceId);
    let service;
    try {
      service = yield this.Service.model.findOne({name: serviceId});
      if (!service) {
        throw new Error('could not find service');
      }
      log.debug('validated service: %s', service.name);
    } catch (e) {
      log.debug('could not find service: %s', e.message);
      throw e;
    }

    log.debug('generating st');
    let st;
    try {
      st = yield this.ST.create({
        tid: `ST-${tgen()}`,
        expires: expires,
        service: service,
        ticketGrantingTicket: tgt
      });
      if (!st) {
        throw new Error('could not generate service ticket');
      }
    } catch (e) {
      log.debug('could not generate st: %s', e.message);
      throw e;
    }
    log.debug('generated st: %s', st.tid);
    return st;
  }

  return ty.spawn(generator.bind(this));
};

TicketRegistry.prototype.invalidateTicket = function* invalidate(type, id) {
  /* eslint max-statements: "off" */
  const T = this[type];
  log.debug(`invalidating ${type.toLowerCase()}: ${id}`);
  let ticket;
  try {
    ticket = yield T.findOneAndUpdate(
      {tid: id},
      {valid: false}
    );
    if (!ticket) {
      throw new Error('ticket not found: %s', id);
    }
  } catch (e) {
    log.debug('invalidation failed: %s', e.message);
    throw e;
  }
  log.debug(`invalidated ${type.toLowerCase()}: ${id}`);
  return ticket;
};

TicketRegistry.prototype.invalidateLT = function invalidateLT(loginTicketId) {
  return ty.spawn(this.invalidateTicket.bind(this, 'LT', loginTicketId));
};

TicketRegistry.prototype.invalidateTGT = function invalidateTGT(ticketGrantingTicketId) {
  return ty.spawn(this.invalidateTicket.bind(this, 'TGT', ticketGrantingTicketId));
};

TicketRegistry.prototype.invalidateST = function invalidateST(serviceTicketId) {
  return ty.spawn(this.invalidateTicket.bind(this, 'ST', serviceTicketId));
};

TicketRegistry.prototype.getTicket = function* getTicket(type, id) {
  const T = this[type];
  log.debug(`finding ${type.toLowerCase()}: ${id}`);
  let ticket;
  try {
    ticket = yield T.findOne({tid: id});
    if (!ticket) {
      throw new Error(`could not find ${type.toLowerCase()}: ${id}`);
    }
  } catch (e) {
    log.debug('error finding ticket: %s', e.message);
    throw e;
  }
  log.debug(`found ${type.toLowerCase()}: ${id}`);
  return ticket;
};

TicketRegistry.prototype.getLT = function getLT(loginTicketId) {
  return ty.spawn(this.getTicket.bind(this, 'LT', loginTicketId));
};

TicketRegistry.prototype.getTGT = function getTGT(ticketGrantingTicketId) {
  return ty.spawn(this.getTicket.bind(this, 'TGT', ticketGrantingTicketId));
};

TicketRegistry.prototype.getST = function getST(serviceTicketId) {
  return ty.spawn(this.getTicket.bind(this, 'ST', serviceTicketId));
};

TicketRegistry.prototype.getSTbyTGT = function getSTbyTGT(ticketGrantingTicketId) {
  function* generator() {
    log.debug('getting st by tgt: %s', ticketGrantingTicketId);
    let st;
    try {
      st = yield this.ST
        .findOne()
        .populate({
          path: 'ticketGrantingTicket',
          select: 'tid',
          match: {tid: ticketGrantingTicketId}
        });
      if (!st) {
        throw new Error('could not find st by tgt: %s', ticketGrantingTicketId);
      }
    } catch (e) {
      log.debug('could not find st: %s', e.message);
      throw e;
    }
    return st;
  }
  return ty.spawn(generator.bind(this));
};

TicketRegistry.prototype.getTGTbyST = function getTGTbyST(serviceTicketId) {
  function* generator() {
    log.debug('getting tgt by st: %s', serviceTicketId);
    let tgt;
    try {
      const st = yield this.ST
        .findOne({tid: serviceTicketId})
        .populate({path: 'ticketGrantingTicket'});
      tgt = st.ticketGrantingTicket;
      if (!tgt) {
        throw new Error('could not find tgt by st: %s', serviceTicketId);
      }
      log.debug('got tgt: %s', tgt.tid);
    } catch (e) {
      log.debug('could not find tgt: %s', e.message);
      throw e;
    }
    return tgt;
  }
  return ty.spawn(generator.bind(this));
};

TicketRegistry.prototype.trackServiceLogin = function tsl(serviceTicket, ticketGrantingTicket, serviceUrl) {
  function* generator() {
    log.debug('tracking service login: (%s, %s)', serviceTicket.tid, serviceUrl);
    let tgt;
    try {
      const services = ticketGrantingTicket.services || [];
      const trackedLogin = yield this.TrackedLogin.create({
        serviceId: serviceTicket.tid,
        loginUrl: serviceUrl
      });
      services.push(trackedLogin);
      tgt = yield ticketGrantingTicket.update({services});
      if (!tgt) {
        throw new Error('did not get tgt after update');
      }
    } catch (e) {
      log.debug('error tracking login: %s', e.message);
      throw e;
    }
    return tgt;
  }
  return ty.spawn(generator.bind(this));
};

TicketRegistry.prototype.servicesLogForTGT = function slft(tid) {
  function* generator() {
    log.debug('getting services log for tgt: %s', tid);
    let services;
    try {
      const tgt = yield this.getTGT(tid);
      yield this.TGT.populate(tgt, { path: 'services' });
      services = tgt.services || [];
    } catch (e) {
      log.debug('error getting services log: %s', e.message);
      throw e;
    }
    return services;
  }
  return ty.spawn(generator.bind(this));
};

module.exports = function init($log) {
  log = $log;
  return TicketRegistry;
};
