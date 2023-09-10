const { model, Schema } = require('mongoose');

let userSchema = new Schema({
  userID: String,
  messagingLevel: Number,
  reactingLevel: Number,
  discussingLevel: Number,
  hostingLevel: Number,
  editingLevel: Number,
  cleaningLevel: Number,
  totalLevel: Number,
  messagingCD: Date,
  reactingCD: Date,
  discussingCD: Date,
  hostingCD: Date,
  editingCD: Date,
  cleaningCD: Date,
});

module.exports = model('users', userSchema);
