import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  contactDetails: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
});

let contactModel = mongoose.model('contact', contactSchema);

export { contactModel };
