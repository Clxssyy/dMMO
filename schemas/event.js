const { model, Schema } = require("mongoose");

const eventSchema = new Schema({
  title: String,
  description: String,
  date: Date, // Date of the event
  expires: Date, // Expiration date of the event
  rate: Number, // Rate of experience points
  type: String, // Type of the event
});

module.exports = model("events", eventSchema);
