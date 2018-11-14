import { mockup, get } from '../controllers/dau';

export default (api) => {
  api.route('/dau/mockup').get(mockup);
  api.route('/dau').get(get);
};
