import { get } from '../controllers/click';

export default (api) => {
  // api.route('/frequencies_clicked/mockup').get(mockup);
  api.route('/frequencies_clicked/:vendorId/:dateType').get(get);
};
