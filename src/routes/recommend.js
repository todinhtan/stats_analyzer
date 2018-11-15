import { get } from '../controllers/recommend';

export default (api) => {
  // api.route('/recommended/mockup').get(mockup);
  api.route('/recommended/:vendorId/:dateType').get(get);
};
