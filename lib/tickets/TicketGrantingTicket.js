'use strict';

const introduce = require('introduce')(__dirname);

const name = 'jsCasTicketGrantingTicket';
let schema;

/* eslint quote-props: "off" */
function createSchema(mongoose, tlName, ltName) {
  if (schema) {
    return schema;
  }
  return new mongoose.Schema({
    tid: {type: String, required: true, index: true, unique: true},
    created: {type: Date, required: true, default: new Date()},
    expires: {type: Date, required: true, default: new Date()},
    userId: {type: String, required: true, index: true},
    valid: {type: Boolean, required: true, default: true},
    services: [{type: mongoose.Schema.Types.ObjectId, ref: tlName}],
    loginTicket: {type: mongoose.Schema.Types.ObjectId, ref: ltName}
  });
}

module.exports = function init(mongoose) {
  const TrackedLogin = introduce('./TrackedLogin')(mongoose);
  const LoginTicket = introduce('./LoginTicket')(mongoose);

  schema = createSchema(mongoose, TrackedLogin.name, LoginTicket.name);
  const model = mongoose.model(name, schema);
  return {schema, model, name};
};
