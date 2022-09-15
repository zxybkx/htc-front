import { IConfig } from 'umi'; // ref: https://umijs.org/config/
// const path = require('path');
import { join } from 'path';

export default {
    webpack5: {}, // 必须开启
    // 配置主题，实际上是配 less 变量。
    theme: {
        'input-height-base': '28px',
        'btn-height-base': '28px',
        'font-size-base': '12px',
        'text-color': '#333',
        'border-radius-base': '2px',
        'primary-color': '#29BECE',
        'layout-header-height': '48px',
        'modal-mask-bg': 'rgba(0, 0, 0, 0.288)',
        'pagination-item-size': '26px',
        'form-item-margin-bottom': '14px',
        'icon-url': '/assets/hzero-ui/font_148784_v4ggb6wrjmkotj4i',
        // 'iconfont-css-prefix': 'c7n', // 设置 c7n 图标 class 前缀
    },
    // 是否启用按需加载
    dynamicImport: {
        loading: '@hzerojs/plugin-layout/browsers/components/PageLoading',
    },
    // 配置环境变量
    define: {
        'process.env': {
            // BASE_PATH: "/",
            // PUBLIC_URL: "/",
            PLATFORM_VERSION: 'SASS',
            CLIENT_ID: "localhost",
            GENERATE_SOURCEMAP: 'false',
            SKIP_TS_CHECK_IN_START: 'false', // yarn start 时, 是否跳过 ts 语法检查
            SKIP_ESLINT_CHECK_IN_START: 'true', // yarn start 时, 是否跳过 eslint 语法检查
            SKIP_NO_CHANGE_MODULE: 'false', // 是否跳过未变更的子模块编译
            ADDITIONAL: process.env.ADDITIONAL, // c7n特异性包的环境变量
            API_HOST: "http://172.23.16.23:8080",
            NO_PROXY: 'true',
            MY_ROUTE: "htc-front-chan",
            CHECK_API: "/hcan",
            EMPLOYEE_API: "SAAS",
            WEBSOCKET_HOST: 'ws://172.23.16.23:8080/hpfm/websocket',
            IM_WEBSOCKET_HOST: "ws://192.168.16.150:9876",
            TRACE_LOG_ENABLE: "true", // TraceLog日志追溯分析是否启用，true/false
            CUSTOMIZE_ICON_NAME: "customize-icon ",
            MULTIPLE_SKIN_ENABLE: 'true', // UED配置是否启用，true / false
        },
    },
  hzeroUed: {},
    manifest: {
        basePath: '/',
    },
    presets: [
        '@hzerojs/preset-hzero',
    ],
    plugins: [
      'hzero-front',
    ],
    alias: {
        'components': 'hzero-front/lib/components',
        'utils': 'hzero-front/lib/utils',
        'services': 'hzero-front/lib/services',
        '@/assets': join(__dirname, '../src/assets'),
        // '@htccommon': path.resolve(__dirname, '../packages', 'hcmp-front-common/src'),
        '@htccommon': 'htc-front-common/src',

    },
    hzeroMicro: {
        commonMf: "cache",
        modifyMfRemotesArrayConfig(remoteArr, originPackageName) {

            if (process.env.ADDITIONAL !== 'true') {
                return remoteArr;
            }
            // c7n多版本的时候 ued的c7n也必须多版本 并且设置 mf-config
            const additionalArr = ['choerodon-ui', '@hzero-front-ui/c7n-ui'];

            return remoteArr.map(v => {
                if (additionalArr.includes(v)) {
                    return [v, '145_hotfix']
                }
                return v;
            });
        },
        modifyMfConfig(config, currentPackageName) {
            for (const k in config.exposes) {
                if (/\.\/lib\/routes\/MarketClient\/ServiceList\/SearchForm/.test(k)) {
                    delete config.exposes[k];
                }
            }
            return config;
        },
        packages: [
            // 子模块配置 在这里面配置后当执行build:ms的时候可以选择到对应的子模块
            // -- APPEND SUB MODULE ITEMS HERE --
            // {
            //     'name': 'hzero-front',
            // },
            {
                'name': 'hzero-front-hiam',
            },
            {
                'name': 'hzero-front-hpfm',
            },
            {
                'name': 'hzero-front-hcnf',
            },
            {
                'name': 'hzero-front-hmsg',
            },
            {
                'name': 'hzero-front-himp',
            },
            {
                'name': 'hzero-front-hfile',
            },
            {
                'name': 'hzero-front-hadm',
            },
            {
                'name': 'hzero-front-hchg',
            },
            {
                'name': 'hzero-front-hrpt',
            },
            {
                'name': 'hzero-front-hsdr',
            },
            {
                'name': 'hzero-front-hitf',
            },
            {
                'name': 'hzero-front-hivc',
            },
            {
                'name': 'hzero-front-hocr',
            },
            {
                'name': 'hzero-front-hwfp',
            },
            {
                "name": "htc-front-iop",
            },
            {
                "name": "htc-front-ivp",
            },
            {
                "name": "htc-front-chan",
            },
            {
                "name": "htc-front-mdm",
            },
        ],
        mfDepPresets: [
            '@hzerojs/mf-deps-preset',
        ],
        // 配置公共模块，在打包的时候会预先编译公共模块
        common: [
            {
                name: 'htc-front-common',
            },
        ],
        // 指定暴露出去的模块
        // mfExposes: {
        //   TestCom: '@/components/TestCom',
        // },
    },
    // 开启esbuild
    esbuild: {},
    // 同umi routes https://umijs.org/zh-CN/config#routes
    // routes,
} as IConfig;
