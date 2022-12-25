import express from 'express';
import  {newContact}  from '../controllers/contactcontroller.js';

const route = express.Router();

route.post('/contact', newContact);

export const contactRoute = route;
