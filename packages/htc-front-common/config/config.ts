import { extendParentConfig } from '@hzerojs/plugin-micro'
// const path = require('path');
// import routes from '../src/config/routers';
export default extendParentConfig({
    webpack5: {},
    devServer: {
        port: 8887               //为了微前端本地启动，和主模块microService配置的端口对应
    },
    extraBabelPlugins: [       //原/packages/xxx/.babelrc.js--plugins
        [
            'module-resolver',
            {
                root: ['./'],
                "alias": {
                    '@components': 'htc-components-front/lib/components',
                    '@utils': 'htc-components-front/lib/utils',
                    '@services': 'htc-components-front/lib/services',
                    '@assets': 'htc-components-front/lib/assets',
                }
            },
        ],
    ],

    presets: [
        // require.resolve('@hzerojs/preset-hzero'),根目录下已经配置过了
    ],
    hzeroMicro: {
        microConfig: {
            // "registerRegex": "(\\/aps)|(\\/orderPerfomace)|(\\/pub/aps)"
            //原先在.hzerorc.json使用的是"initLoad": true,现在使用的模块加载规则：当匹配到对应的路由后，才加载对应的模块。
            //主模块下microServices下registerRegex优先级最高
        }
    },
});