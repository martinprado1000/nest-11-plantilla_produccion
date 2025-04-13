import * as Joi from 'joi';

export const envSchema = Joi.object({ 
  PORT: Joi.number().default(3000),
  HOST_API: Joi.string().required(),
  NODE_ENV: Joi.string().default('dev'),
  JWT_SECRET: Joi.string().required(),
  DATABASE_URI: Joi.string().required(),
  DATABASE_PORT: Joi.string(),
  DATABASE_NAME: Joi.string(),
  DATABASE_USERNAME: Joi.string().allow('', null),
  DATABASE_PASSWORD: Joi.string().allow('', null),
  PAGINATIONS_DEFAULT_LIMIT: Joi.number().default(20), 
  MAILER_HOST: Joi.string().required(),
  MAILER_PORT: Joi.number().required(),
  MAILER_USER: Joi.string().required(),
  MAILER_PASS: Joi.string().required(),
  PASSWORD_SEED_USERS: Joi.string().required(),
  AUDIT: Joi.boolean().default(false),
});
