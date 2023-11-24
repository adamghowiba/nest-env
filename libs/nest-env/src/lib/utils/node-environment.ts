
export const NODE_ENV = process.env['NODE_ENV'];
export const APP_ENV = process.env['NODE_ENV'];

export const ENV = {
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
  nodeEnv: NODE_ENV,
  appEnv: APP_ENV,
};
