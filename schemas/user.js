const { model, Schema } = require('mongoose');

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
});

module.exports = model('users', userSchema);
