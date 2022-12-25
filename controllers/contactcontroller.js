import catchAsyncErr from '../middleware/catchAsyncErr.js';
import { contactModel } from '../models/contactModel.js';

export const newContact = catchAsyncErr(async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  const contact = await contactModel.create({
    contactDetails: {
      firstName,
      lastName,
      email,
      message,
    },
  });

  res.status(201).json({
    success: true,
    contact,
  });
});
