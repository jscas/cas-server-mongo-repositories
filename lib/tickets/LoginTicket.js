'use strict';

const name = 'jsCasLoginTicket';
let schema;

/* eslint quote-props: "off" */
function createSchema(mongoose) {
  if (schema) {
    return schema;
  }
  return new mongoose.Schema({
    tid: {type: String, required: true, index: true, unique: true},
    created: {type: Date, required: true, default: new Date()},
    expires: {type: Date, required: true, default: new Date()},
    valid: {type: Boolean, required: true, default: true}
  });
}

module.exports = function LoginTicket(mongoose) {
  schema = createSchema(mongoose);
  const model = mongoose.model(name, schema);
  return {model, schema, name};
};
