const paths = require('hzero-webpack-scripts/config/paths');
const path = require('path');

module.exports = {
  '@htccommon': path.resolve(paths.appRootPath, 'packages', 'htc-front-common/lib'),
  'hzero-boot-customize-init-config': path.resolve(
    __dirname,
    '../../packages/htc-front-common/src/config/customize'
  ),
  '@/assets': path.resolve(paths.appRootPath, 'src/assets'),
  '@': path.resolve(paths.appPath, 'src'),
  'hzero-front/lib/utils/getConvertRouter': 'hzero-boot/lib/utils/getConvertRouter',
  'utils/getConvertRouter': 'hzero-boot/lib/utils/getConvertRouter',
  components: 'hzero-front/lib/components/',
  utils: 'hzero-front/lib/utils/',
  services: 'hzero-front/lib/services/',
};
