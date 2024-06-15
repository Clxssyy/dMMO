const { model, Schema } = require('mongoose');
const userSchema = require('./user');

const serverSchema = new Schema({
  serverID: String,
  users: [userSchema.schema],
});

module.exports = model('servers', serverSchema);
