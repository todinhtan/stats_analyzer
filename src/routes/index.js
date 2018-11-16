/* eslint-disable global-require */
export default (api) => {
  require('./dau').default(api);
  require('./recommend').default(api);
  require('./click').default(api);
};
