const { model, Schema } = require("mongoose");
const userSchema = require("./user");
const eventSchema = require("./event");

const serverSchema = new Schema({
  serverID: String,
  users: [userSchema.schema],
  events: [eventSchema.schema],
});

module.exports = model("servers", serverSchema);
