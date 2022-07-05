import { IConfig } from 'umi'; // ref: https://umijs.org/config/
export default {
    define: {
        // 'process.env': {
        //     NODE_PROFILE: 'test',
        //     BASE_PATH: "BASE_PATH",
        //     PUBLIC_URL: "PUBLIC_URL",
        //     PLATFORM_VERSION: 'SASS',
        //     CLIENT_ID: "CLIENT_ID",
        //     GENERATE_SOURCEMAP: 'false',
        //     SKIP_TS_CHECK_IN_START: 'false', // yarn start 时, 是否跳过 ts 语法检查
        //     SKIP_ESLINT_CHECK_IN_START: 'true', // yarn start 时, 是否跳过 eslint 语法检查
        //     SKIP_NO_CHANGE_MODULE: 'false', // 是否跳过未变更的子模块编译
        //     ADDITIONAL: process.env.ADDITIONAL, //c7n特异性包的环境变量
        //     API_HOST: "BUILD_API_HOST",
        //     NO_PROXY: 'true',

        //     MY_ROUTE: "GOTO_INVOICE_CHECK_ROUTE",
        //     CHECK_API: "INVOICE_CHECK_API_SERVER",
        //     EMPLOYEE_API: "BUILD_PLATFORM_VERSION",


        //     WEBSOCKET_HOST: 'BUILD_WEBSOCKET_HOST',

        //     IM_WEBSOCKET_HOST: "IM_WEBSOCKET_HOST",
        //     TRACE_LOG_ENABLE: "TRACE_LOG_ENABLE",  // TraceLog日志追溯分析是否启用，true/false
        //     CUSTOMIZE_ICON_NAME: "CUSTOMIZE_ICON_NAME",
        //     MULTIPLE_SKIN_ENABLE: 'true', // UED配置是否启用，true / false
        // },
    },
} as IConfig;