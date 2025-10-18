import ENV from '../validation/env.validation';

export const isDevelopment = ENV.NODE_ENV === 'development';
