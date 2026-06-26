import  Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  CORS_ORIGINS: Joi.string().default('http://localhost:3000,http://localhost:5173'),

  MYSQL_HOST: Joi.string().required(),
  MYSQL_PORT: Joi.number().default(3306),
  MYSQL_USER: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_DATABASE: Joi.string().required(),
  MYSQL_CONNECTION_LIMIT: Joi.number().default(10),

  ACCESS_TOKEN_JWT: Joi.string().required(),

  OPENROUTER_API_KEY: Joi.string().optional(),
  OPENROUTER_BASE_URL: Joi.string().uri().optional(),
  OPENROUTER_MODEL: Joi.string().optional(),
});
