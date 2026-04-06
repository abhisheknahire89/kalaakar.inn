export const env = {
  isProd: import.meta.env.PROD === true,
  analyticsEndpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT || '',
};
