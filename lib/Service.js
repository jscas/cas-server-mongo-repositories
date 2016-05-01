'use strict';

const name = 'jsCasService';
let schema;

/* eslint quote-props: "off" */
function createSchema(mongoose) {
  if (schema) {
    return schema;
  }
  schema = new mongoose.Schema({
    name: {type: String, required: true, index: true, unique: true},
    url: {type: Array, required: true, default: [mongoose.Schema.Types.String], index: true},
    comment: {type: String},
    slo: {type: Boolean, required: true, default: false},
    sloType: {type: Number, required: true, default: 0},
    sloUrl: {type: String}
  });
  return schema;
}

module.exports = function init(mongoose) {
  schema = createSchema(mongoose);
  const model = mongoose.model(name, schema);
  return {schema, model, name};
};
