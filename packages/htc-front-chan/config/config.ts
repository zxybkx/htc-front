import { extendParentConfig } from '@hzerojs/plugin-micro';
const InvoiceCheckQueryRouterConfig = [
    {
        path: '/htc-front-chan/invoice-check',
        routes: [
            {
                path: '/htc-front-chan/invoice-check/query',
                component: '@/pages/invoice-check/list/InvoiceCheckQueryPage',
            },
            {
                path: '/htc-front-chan/invoice-check/detail/:invoiceHeaderId/:invoiceType',
                component: '@/pages/invoice-check/detail/InvoiceCheckDetailPage',
            },
        ],
    },
];
const invoiceFullRouterConfig = [
    {
        path: '/htc-front-chan/invoice-full',
        routes: [
            {
                path: '/htc-front-chan/invoice-full/list',
                component: '@/pages/invoice-full/list/InvoiceFullListPage',
            },
            {
                path: '/htc-front-chan/invoice-full/detail/:invoiceHeaderId/:invoiceType',
                component: '@/pages/invoice-full/detail/InvoiceFullDetailPage',
            },
        ],
    },
];
const invoiceCheckHistoryRouterConfig = [
    {
        path: '/htc-front-chan/invoice-check-history',
        routes: [
            {
                path: '/htc-front-chan/invoice-check-history/list',
                component: '@/pages/invoice-check-history/list/InvoiceCheckHistoryListPage',
            },
            {
                path: '/htc-front-chan/invoice-check-history/detail/:invoiceHeaderId/:invoiceType',
                component: '@/pages/invoice-check-history/detail/InvoiceCheckHistoryDetailPage',
            },
        ],
    },
];
const EnterpriseCertRequestHistoryRouterConfig = [
    {
        path: '/htc-front-chan/enterprise-cert-request-history/list',
        component: '@/pages/enterprise-cert-request-history/list/EnterpriseCertRequestHistoryListPage',
    },
];
const BasicInfoQueryHistoryRouterConfig = [
    {
        path: '/htc-front-chan/basic-info-query-history/list',
        component: '@/pages/basic-info-query-history/list/BasicInfoQueryHistoryListPage',
    },
];
const InvoiceMainQueryHistoryRouterConfig = [
    {
        path: '/htc-front-chan/invoice-main-query-history/list',
        component: '@/pages/invoice-main-query-history/list/InvoiceMainQueryHistoryListPage',
    },
];
const InvoiceStatusChangeHistoryRouterConfig = [
    {
        path: '/htc-front-chan/invoice-status-change-history/list',
        component: '@/pages/invoice-status-change-history/list/InvoiceStatusChangeHistoryListPage',
    },
];
const OfdInvoiceHistoryRouterConfig = [
    {
        path: '/htc-front-chan/ofd-invoice-history/list',
        component: '@/pages/ofd-invoice-history/list/OfdInvoiceHistoryListPage',
    },
];
const InvoiceOCRHistoryRouterConfig = [
    {
        path: '/htc-front-chan/invoice-ocr-history/list',
        component: '@/pages/invoice-ocr-history/list/InvoiceOCRHistoryListPage',
    },
];
const ApplyStatisticsHistoryRouterConfig = [
    {
        path: '/htc-front-chan/apply-statistics-history/list',
        component: '@/pages/apply-statistics-history/list/ApplyStatisticsHistoryListPage',
    },
];
const InvoiceStatisticsResultHistoryRouterConfig = [
    {
        path: '/htc-front-chan/invoice-statistics-result-history/list',
        component: '@/pages/invoice-statistics-result-history/list/InvoiceStatisticsResultHistoryListPage',
    },
];
const InvoiceRequestHistoryRouterConfig = [
    {
        path: '/htc-front-chan/invoice-request-history/list',
        component: '@/pages/invoice-request-history/list/InvoiceRequestHistoryListPage',
    },
];
const InvoiceAuthenticationHistoryRouterConfig = [
    {
        path: '/htc-front-chan/invoice-authentication-history/list',
        component: '@/pages/invoice-authentication-history/list/InvoiceAuthenticationHistoryListPage',
    },
];
const billPushHistoryRouterConfig = [
    {
        path: '/htc-front-chan/bill-push-history',
        routes: [
            {
                path: '/htc-front-chan/bill-push-history/list',
                component: '@/pages/bill-push-history/list/BillPushHistoryPage',
            },
            {
                path: '/htc-front-chan/bill-push-history/bill-view-page',
                component: '@/pages/bill-push-history/detail/BillViewPage',
            },
        ],
    },
];
const InvoiceAddinfoQueryRouterConfig = [
    {
        path: '/htc-front-chan/invoice-addinfo-query-status/list',
        component: '@/pages/invoice-addinfo-query-status/list/InvoiceAddinfoQueryStatusListPage',
    },
];
const linkGenerationHistoryRouterConfig = [
    {
        path: '/htc-front-chan/link-generation-history',
        component: '@/pages/link-generation-history/list/LinkGenerationHistoryPage',
    },
];
// import routes from './routers';
export default extendParentConfig({
    webpack5: {},
    devServer: {
        port: 8887               //为了微前端本地启动，和主模块microService配置的端口对应
    },
    routes: [
        ...InvoiceCheckQueryRouterConfig,
        ...invoiceFullRouterConfig,
        ...invoiceCheckHistoryRouterConfig,
        ...EnterpriseCertRequestHistoryRouterConfig,
        ...BasicInfoQueryHistoryRouterConfig,
        ...InvoiceMainQueryHistoryRouterConfig,
        ...InvoiceStatusChangeHistoryRouterConfig,
        ...OfdInvoiceHistoryRouterConfig,
        ...InvoiceOCRHistoryRouterConfig,
        ...ApplyStatisticsHistoryRouterConfig,
        ...InvoiceStatisticsResultHistoryRouterConfig,
        ...InvoiceRequestHistoryRouterConfig,
        ...InvoiceAuthenticationHistoryRouterConfig,
        ...billPushHistoryRouterConfig,
        ...InvoiceAddinfoQueryRouterConfig,
        ...linkGenerationHistoryRouterConfig,
    ],
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
