import { extendParentConfig } from '@hzerojs/plugin-micro';

const taxInfoRouterConfig = [
  {
    path: '/htc-front-iop/tax-info',
    component: '@/pages/tax-info/list/TaxInfoListPage',
  },
];
const commodityInfoRouterConfig = [
  {
    path: '/htc-front-iop/commodity-info',
    component: '@/pages/commodity-info/list/CommodityInfoListPage',
  },
];
const invoiceRuleRouterConfig = [
  {
    path: '/htc-front-iop/invoice-rule',
    component: '@/pages/invoice-rule/list/InvoiceRuleListPage',
  },
];
const redInvoiceRouterConfig = [
  {
    path: '/htc-front-iop/red-invoice-requisition',
    routes: [
      {
        // 专用红字申请单列表
        path: '/htc-front-iop/red-invoice-requisition/list',
        component: '@/pages/red-invoice/list/RedInvoiceRequisitionListPage',
      },
      {
        // 新建专用红字申请单
        path: '/htc-front-iop/red-invoice-requisition/create/:companyId',
        component: '@/pages/red-invoice/list/RedInvoiceRequisitionPage',
      },
      {
        // 专用红字申请单详情
        path: '/htc-front-iop/red-invoice-requisition/detail/:companyId/:headerId',
        component: '@/pages/red-invoice/list/RedInvoiceRequisitionPage',
      },
    ],
  },
  {
    path: '/htc-front-iop/red-invoice-info',
    routes: [
      {
        // 专票红字信息表列表
        path: '/htc-front-iop/red-invoice-info/list',
        component: '@/pages/red-invoice/list/RedInvoiceInfoTableListPage',
      },
      {
        // 专票红字信息表列表-详情
        path: '/htc-front-iop/red-invoice-info/detail/:companyId/:headerId',
        component: '@/pages/red-invoice/detail/RedInvoiceInfoDetailPage',
      },
      {
        // 同步请求列表
        path: '/htc-front-iop/red-invoice-info/synchronize-red-info-list',
        component: '@/pages/red-invoice/detail/SynchronizeRedInfoPage',
      },
    ],
  },
];
const invoiceWorkbenchRouterConfig = [
  {
    path: '/htc-front-iop/invoice-workbench',
    routes: [
      // 开票订单工作台
      {
        path: '/htc-front-iop/invoice-workbench/list',
        component: '@/pages/invoice-workbench/list/InvoiceWorkbenchPage',
      },
      // 新建开票订单
      {
        path: '/htc-front-iop/invoice-workbench/invoice-order/:sourceType/:companyId',
        component: '@/pages/invoice-workbench/detail/InvoiceOrderPage',
      },
      // 编辑开票订单
      {
        path:
          '/htc-front-iop/invoice-workbench/edit/:sourceType/:companyId/:invoicingOrderHeaderId',
        component: '@/pages/invoice-workbench/detail/InvoiceOrderPage',
      },
      // 空白发票作废
      {
        path: '/htc-front-iop/invoice-workbench/invoice-void/:companyId',
        component: '@/pages/invoice-void/list/InvoiceVoidPage',
      },
      // 发票作废
      {
        path: '/htc-front-iop/invoice-workbench/invoice-line-void/:invoicingOrderHeaderId/:companyId',
        component: '@/pages/invoice-void/list/InvoiceVoidPage',
      },
      // 发票红冲
      {
        path: '/htc-front-iop/invoice-workbench/invoice-red-flush/:invoicingOrderHeaderId/:companyId',
        component: '@/pages/invoice-redFlush/list/InvoiceRedFlushPage',
      },
      // 发票预览
      {
        path: '/htc-front-iop/invoice-workbench/invoice-view/:sourceType/:headerId/:employeeId',
        component: '@/pages/invoice-view/InvoiceViewPage',
      },
    ],
  },
];
const invoiceReqRouterConfig = [
  {
    path: '/htc-front-iop/invoice-req',
    routes: [
      {
        path: '/htc-front-iop/invoice-req/list',
        component: '@/pages/invoice-req/list/InvoiceReqListPage',
      },
      {
        path: '/htc-front-iop/invoice-req/create/:companyId',
        component: '@/pages/invoice-req/detail/InvoiceReqDetailPage',
      },
      {
        path: '/htc-front-iop/invoice-req/detail/:companyId/:headerId/:billFlag',
        component: '@/pages/invoice-req/detail/InvoiceReqDetailPage',
      },
      {
        path: '/htc-front-iop/invoice-req/order/:headerId',
        component: '@/pages/invoice-req/list/InvoiceReqOrderListPage',
      },
      {
        path: '/htc-front-iop/invoice-req/invoice-view/:sourceType/:headerId/:invoiceSourceType',
        component: '@/pages/invoice-view/InvoiceViewPage',
      },
      // 空白废申请
      {
        path: '/htc-front-iop/invoice-req/invoice-void/:sourceType/:companyId',
        component: '@/pages/invoice-void/list/InvoiceVoidPage',
      },
      // 发票作废
      {
        path:
          '/htc-front-iop/invoice-req/invoice-void/:sourceType/:invoicingOrderHeaderId/:companyId',
        component: '@/pages/invoice-void/list/InvoiceVoidPage',
      },
      // 发票红冲
      {
        path:
          '/htc-front-iop/invoice-req/invoice-red-flush/:sourceType/:invoicingOrderHeaderId/:companyId',
        component: '@/pages/invoice-redFlush/list/InvoiceRedFlushPage',
      },
      // 申请单-发票作废
      {
        path:
          '/htc-front-iop/invoice-req/invoice-main-void/:sourceType/:invoicingReqHeaderId/:companyId',
        component: '@/pages/invoice-void/list/InvoiceVoidPage',
      },
      // 申请单-发票红冲
      {
        path:
          '/htc-front-iop/invoice-req/invoice-main-red-flush/:sourceType/:invoicingReqHeaderId/:companyId',
        component: '@/pages/invoice-redFlush/list/InvoiceRedFlushPage',
      },
    ],
  },
];
const permissionAssignRouterConfig = [
  {
    path: '/htc-front-iop/permission-assign/:sourceType/:companyId/:headerIds',
    component: '@/pages/permission-assign/list/PermissionAssignPage',
    authorized: true,
    title: '数据权限分配',
  },
];
const customerInfoRouterConfig = [
  {
    path: '/htc-front-iop/customer-info',
    routes: [
      // 客户信息维护
      {
        path: '/htc-front-iop/customer-info/list',
        component: '@/pages/customer-info/list/CustomerInfoPage',
      },
      // 商品信息
      {
        path: '/htc-front-iop/customer-info/commodity-info',
        component: '@/pages/customer-info/list/CommodityPage',
      },
      // 分配商品映射
      {
        path: '/htc-front-iop/customer-info/assign-commodity',
        component: '@/pages/customer-info/list/AssignCommodityListPage',
      },
    ],
  },
];
const tobeInvoiceRouterConfig = [
  {
    path: '/htc-front-iop/tobe-invoice',
    routes: [
      // 待开票数据勾选
      {
        path: '/htc-front-iop/tobe-invoice/list',
        component: '@/pages/tobe-invoice/list/TobeInvoicePage',
      },
      // 生成申请
      {
        path: '/htc-front-iop/tobe-invoice/generate-application/:companyId/:ids',
        component: '@/pages/tobe-invoice/detail/GenerateApplicationPage',
      },
      // 查看申请单
      {
        path: '/htc-front-iop/tobe-invoice/req-detail/:sourceType/:companyId/:headerId',
        component: '@/pages/invoice-req/detail/InvoiceReqDetailPage',
      },
    ],
  },
];
const invoiceOperationMaintenanceRouterConfig = [
  {
    path: '/htc-front-iop/invoice-operation-maintenance',
    component: '@/pages/invoice-operation-maintenance/list/InvoiceOperationMaintenancePage',
  },
];
const taxRateStatisticsReportRouterConfig = [
  {
    path: '/htc-front-iop/tax-rate-statistics-report',
    routes: [
      {
        path: '/htc-front-iop/tax-rate-statistics-report/list',
        component: '@/pages/tax-rate-statistics-report/list/TaxRateStatisticsReportPage',
      },
      {
        path: '/htc-front-iop/tax-rate-statistics-report/detail',
        component: '@/pages/tax-rate-statistics-report/detail/TaxRateStatisticDetailPage',
      },
    ],
  },
];
const monthlyQuarterlyYearlyReport = [
  {
    path: '/htc-front-iop/monthly-quarterly-yearly-report',
    routes: [
      {
        path: '/htc-front-iop/monthly-quarterly-yearly-report/list',
        component: '@/pages/monthly-quarterly-yearly-report/list/StatisticsTablePage',
      },
    ],
  },
];
const requestHistoryRouterConfig = [
  {
    path: '/htc-front-iop/request-history',
    routes: [
      {
        path: '/htc-front-iop/request-history/list',
        component: '@/pages/request-history/list/RequestHistoryListPage',
      },
    ],
  },
];
// const path = require('path');
// import routes from './routers'
export default extendParentConfig({
  webpack5: {},
  devServer: {
    port: 8887, // 为了微前端本地启动，和主模块microService配置的端口对应
  },
  routes: [
    ...invoiceReqRouterConfig,
    ...invoiceRuleRouterConfig,
    ...commodityInfoRouterConfig,
    ...taxInfoRouterConfig,
    ...redInvoiceRouterConfig,
    ...invoiceWorkbenchRouterConfig,
    ...permissionAssignRouterConfig,
    ...customerInfoRouterConfig,
    ...tobeInvoiceRouterConfig,
    ...invoiceOperationMaintenanceRouterConfig,
    ...taxRateStatisticsReportRouterConfig,
    ...requestHistoryRouterConfig,
    ...monthlyQuarterlyYearlyReport,
  ],

  extraBabelPlugins: [ // 原/packages/xxx/.babelrc.js--plugins
    [
      'module-resolver',
      {
        root: ['./'],
        'alias': {
          '@components': 'htc-components-front/lib/components',
          '@utils': 'htc-components-front/lib/utils',
          '@services': 'htc-components-front/lib/services',
          '@assets': 'htc-components-front/lib/assets',
        },
      },
    ],
  ],

  presets: [
    // require.resolve('@hzerojs/preset-hzero'),根目录下已经配置过了
  ],
  hzeroMicro: {
    microConfig: {
      // "registerRegex": "(\\/aps)|(\\/orderPerfomace)|(\\/pub/aps)"
      // 原先在.hzerorc.json使用的是"initLoad": true,现在使用的模块加载规则：当匹配到对应的路由后，才加载对应的模块。
      // 主模块下microServices下registerRegex优先级最高
    },
  },
});
