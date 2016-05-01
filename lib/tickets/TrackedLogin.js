'use strict';

const name = 'jsCasTrackedLogin';
let schema;

function createSchema(mongoose) {
  if (schema) {
    return schema;
  }
  return new mongoose.Schema({
    serviceId: {type: String, required: true, index: true},
    logoutUrl: {type: String, require: true, index: true}
  });
}

module.exports = function TrackedLogin(mongoose) {
  schema = createSchema(mongoose);
  const model = mongoose.model(name, schema);
  return {schema, model, name};
};
