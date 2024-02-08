const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  urlId: {
    type: String,
    required: true,
  },
  origUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  date: {
    type: String,
    default: Date.now,
  },
  regionClickedOn: {
    type: [
      {
        country: {
          type: String,
        },
        city: {
          type: String,
        },
      },
    ],
  },
  expiryDateTime: {
    type: Date,
    required: false, // Make it required or not based on your needs
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});


module.exports = mongoose.model('Url', UrlSchema);
