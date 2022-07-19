import { extendParentConfig } from '@hzerojs/plugin-micro'
// const path = require('path');
// import routes from './routers';
const automaticCollectionManageRouterConfig = [
    {
        path: '/htc-front-mdm/automatic-collection-manage',
        routes: [
            {
                path: '/htc-front-mdm/automatic-collection-manage/list',
                component: '@/pages/automatic-collection-manage/list/AutomaticCollectionManagePage',
            },
            {
                path: '/htc-front-mdm/automatic-collection-manage/remindDetail',
                component: '@/pages/automatic-collection-manage/detail/RemindDetailPage',
            },
        ],
    },
];
const automaticCollectionRulesRouterConfig = [
    {
        path: '/htc-front-mdm/automatic-collection-rules',
        component: '@/pages/automatic-collection-rules/list/AutomaticCollectionRulesPage',
    },
]
const companyListRouterConfig = [
    {
        path: '/htc-front-mdm/company',
        // component: () => import('./list/CompanyListPage'),
        // title: '公司列表维护',
        routes: [
            {
                path: '/htc-front-mdm/company/list',
                component: '@/pages/company-list/list/CompanyListPage',
            },
            {
                path: '/htc-front-mdm/company/detail/:companyId',
                component: '@/pages/company-list/detail/CompanyDetailPage',
            },
        ],
    },
];
const employeeDefendRouterConfig = [
    {
        path: '/htc-front-mdm/employee-define',
        routes: [
            {
                // 员工信息维护
                path: '/htc-front-mdm/employee-define/list',
                component: '@/pages/employee-define/list/EmployeeDefinePage',
            },
            {
                // 修改员工手机号
                path: '/htc-front-mdm/employee-define/mobile/:companyId/:mobile',
                component: '@/pages/employee-define/list/EmployeePhoneModifyPage',
            },
        ],
    },
];
const tenantAgreementRouterConfig = [
    {
        path: '/htc-front-mdm/tenant-agreement',
        routes: [
            {
                path: '/htc-front-mdm/tenant-agreement/list',
                component: '@/pages/tenant-agreement/list/TenantAgreementPage',
            },
            {
                path: '/htc-front-mdm/tenant-agreement/detail/:tenantId/:agreementId',
                component: '@/pages/tenant-agreement/detail/TenantAgreementDetailPage',
            },
        ],
    },
];
const outageNoticeRouterConfig = [
    {
        path: '/htc-front-mdm/outage-notice',
        routes: [
            {
                path: '/htc-front-mdm/outage-notice/detail',
                component: '@/pages/outage-notice/detail/OutageNoticePage',
            },
        ],
    },
];
const billStatementRouterConfig = [
    {
        path: '/htc-front-mdm/bill-statement',
        routes: [
            {
                path: '/htc-front-mdm/bill-statement/list',
                component: '@/pages/bill-statement/list/BillStatementPage',
            },
            {
                path: '/htc-front-mdm/bill-statement/billViewPage',
                component: '@/pages/bill-statement/detail/BillViewPage',
            },
        ],
    },
];
const projectApplicationRouterConfig = [
    {
        path: '/htc-front-mdm/project-application',
        routes: [
            {
                path: '/htc-front-mdm/project-application/list',
                component: '@/pages/project-application/list/ProjectApplicationPage',
            },
            // 租户明细
            {
                path: '/htc-front-mdm/project-application/tenant-detail/:tenantId/:uniqueCode',
                component: '@/pages/project-application/detail/TenantApplyDetailPage',
            },
        ],
    },
    {
        path: '/public/htc-front-mdm/apply/items-tenant',
        component: '@/pages/apply-tenant/list/ApplyTenantPage',
        authorized: true,
    },
];
const applicationInfoRouterConfig = [
    {
        path: '/public/htc-front-mdm/apply/invalid-result',
        component: '@/pages/apply-tenant/list/ResultPage',
        authorized: true,
    },
    {
        path: '/public/htc-front-mdm/apply/success-result',
        component: '@/pages/apply-tenant/list/SuccessPage',
        authorized: true,
    },
];
const projectCostSharingRouterConfig = [
    {
        path: '/htc-front-mdm/project-cost-sharing',
        routes: [
            {
                path: '/htc-front-mdm/project-cost-sharing/list',
                component: '@/pages/project-cost-sharing/list/ProjectCostSharingPage',
            },
            //   {
            //     path: '/htc-front-mdm/project-cost-sharing/detail/:tenantId/:agreementId',
            //     component: () => import('./detail/TenantAgreementDetailPage'),
            //   },
        ],
    },
];
const projectTenantMaintenanceRouterConfig = [
    {
        path: '/htc-front-mdm/project-tenant-maintenance',
        routes: [
            {
                path: '/htc-front-mdm/project-tenant-maintenance/list',
                component: '@/pages/project-tenant-maintenance/list/ProjectTenantMaintenancePage',
            },
        ],
    },
];
export default extendParentConfig({
    webpack5: {},
    devServer: {
        port: 8887               //为了微前端本地启动，和主模块microService配置的端口对应
    },
    routes: [
        ...companyListRouterConfig,
        ...employeeDefendRouterConfig,
        ...tenantAgreementRouterConfig,
        ...outageNoticeRouterConfig,
        ...billStatementRouterConfig,
        ...projectApplicationRouterConfig,
        ...applicationInfoRouterConfig,
        ...automaticCollectionManageRouterConfig,
        ...automaticCollectionRulesRouterConfig,
        ...projectCostSharingRouterConfig,
        ...projectTenantMaintenanceRouterConfig,
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
