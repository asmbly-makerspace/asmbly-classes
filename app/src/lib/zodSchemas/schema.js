import { z } from 'zod';


export const schema = z.object({
    firstName: z.string().regex(new RegExp(/^[a-zA-Z\-]{2,20}$/), 'First name must be between 2 and 20 characters and only inlcude letters and hyphens.'),
    lastName: z.string().regex(new RegExp(/^[a-zA-Z\-]{2,20}$/), 'Last name must be between 2 and 20 characters and only inlcude letters and hyphens.'),
    email: z.string({
      required_error: 'Email is required'
    }).email()
  });

export const privateRequestSchema = z.object({
    firstName: z.string().regex(new RegExp(/^[a-zA-Z\-]{2,20}$/), 'First name must be between 2 and 20 characters and only inlcude letters and hyphens.'),
    lastName: z.string().regex(new RegExp(/^[a-zA-Z\-]{2,20}$/), 'Last name must be between 2 and 20 characters and only inlcude letters and hyphens.'),
    email: z.string().email(),
    sessionType: z.enum(['Private', 'Checkout'])
  });