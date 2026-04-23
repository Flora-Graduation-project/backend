import Joi from 'joi';

export const createPaymentSchema = Joi.object({
        amount: Joi.number().required().min(1), 
    
});