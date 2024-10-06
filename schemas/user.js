const { model, Schema, set } = require('mongoose');

const userSchema = new Schema({
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
  reputation: Number,
  profileViews: Number,
  cooldowns: [
    {
      user: String,
      time: Date,
    },
  ],
  settings: {
    color: String,
    title: String,
  },
});

module.exports = model('users', userSchema);
