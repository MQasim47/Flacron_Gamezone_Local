import axios from 'axios';
import { config } from '../config/index.js';

export const emailService = {
   async send(opts: {
      to: { email: string; name?: string };
      subject: string;
      htmlContent: string;
      textContent: string;
      fromEmail: string;
      fromName: string;
   }) {
      if (!config.brevo.apiKey) {
         throw Object.assign(
            new Error('Email service is not configured on the server.'),
            {
               status: 500,
            }
         );
      }

      await axios.post(
         'https://api.brevo.com/v3/smtp/email',
         {
            sender: { name: opts.fromName, email: opts.fromEmail },
            to: [{ email: opts.to.email, name: opts.to.name }],
            subject: opts.subject,
            htmlContent: opts.htmlContent,
            textContent: opts.textContent,
         },
         {
            headers: {
               'api-key': config.brevo.apiKey,
               'Content-Type': 'application/json',
            },
         }
      );
   },
};
