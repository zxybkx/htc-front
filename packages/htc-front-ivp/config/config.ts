import { extendParentConfig } from '@hzerojs/plugin-micro';
// const path = require('path');
// import routes from './routers';
const documentTypeRouterConfig = [
  {
    path: '/htc-front-ivp/document-type',
    routes: [
      {
        path: '/htc-front-ivp/document-type/list',
        component: '@/pages/document-type/list/DocumentTypePage',
      },
      {
        path: '/htc-front-ivp/document-type/interface-doc',
        component: '@/pages/document-type/list/InterfaceDocPage',
      },
    ],
  },
];
const invoicesRouterConfig = [
  {
    path: '/htc-front-ivp/invoices',
    routes: [
      {
        // 发票池
        path: '/htc-front-ivp/invoices/list',
        component: '@/pages/invoices/list/InvoicesHeadersPage',
      },
      {
        // 发票池行信息
        path: '/htc-front-ivp/invoices/lines/:invoicePoolHeaderId',
        component: '@/pages/invoices/list/InvoicesLinesPage',
      },
      {
        // 查看详情
        path:
          '/htc-front-ivp/invoices/detail/:invoiceHeaderId/:invoiceType/:entryPoolSource/:companyCode',
        component: '@/pages/invoices/detail/InvoicePoolDetailPage',
      },
      {
        // 获取底账
        path: '/htc-front-ivp/invoices/original-account',
        component: '@/pages/original-account/detail/OriginalAccountPage',
      },
      {
        // 版式推送
        path: '/htc-front-ivp/invoices/layout-push',
        component: '@/pages/layout-push/detail/LayoutPushPage',
      },
      {
        // 档案归档
        path: '/htc-front-ivp/invoices/file-archive/:sourceCode',
        component: '@/pages/file-archive/detail/FileArchivePage',
      },
      {
        // 档案下载
        path: '/htc-front-ivp/invoices/file-download/:sourceCode',
        component: '@/pages/file-download/detail/FileDownloadPage',
      },
      {
        // 单据关联
        path: '/htc-front-ivp/invoices/doc-related/:sourceCode/:sourceHeaderId',
        component: '@/pages/doc-related/detail/DocRelatedPage',
      },
      {
        // 历史记录
        path: '/htc-front-ivp/invoices/invoice-history/:sourceCode/:sourceHeaderId',
        component: '@/pages/invoice-history/detail/InvoiceHistoryPage',
      },
      {
        //  档案上传
        path: '/htc-front-ivp/invoices/archive-upload/:sourceCode/:sourceHeaderId',
        component: '@/pages/archive-upload/detail/ArchiveUploadPage',
      },
      {
        //  批量上传
        path: '/htc-front-ivp/invoices/batch-upload/:sourceCode/:companyId',
        component: '@/pages/batch-upload/detail/BatchUploadPage',
      },
      {
        //  档案信息
        path: '/htc-front-ivp/invoices/archive-information/:sourceCode/:sourceHeaderId',
        component: '@/pages/archive-information/detail/archiveInformationPage',
      },
      {
        //  档案查看
        path: '/htc-front-ivp/invoices/archive-view/:sourceCode/:sourceHeaderId',
        component: '@/pages/archive-view/detail/ArchiveViewPage',
      },
    ],
    // models: [() => import('@src/models/invoicesModel')],
    // models: ["invoices"],
  },
  {
    path: '/public/htc-front-ivp/invoices/archive-view',
    component: '@/pages/archive-view/detail/ArchiveViewPubPage',
    authorized: true,
  },
];
const checkCertificationRouterConfig = [
  {
    path: '/htc-front-ivp/check-certification',
    routes: [
      {
        path: '/htc-front-ivp/check-certification/list',
        component: '@/pages/check-certification/list/CheckCertificationListPage',
      },
      {
        //  已认证详情
        path: '/htc-front-ivp/check-certification/certifiableInvoice/detail',
        component: '@/pages/check-certification/detail/CertifiedDetailPage',
      },
      {
        //  申请抵扣统计
        path: '/htc-front-ivp/check-certification/applyDeduction',
        component: '@/pages/check-certification/detail/ApplyDeductionReport',
      },
      {
        //  认证结果统计
        path: '/htc-front-ivp/check-certification/certificationResults',
        component: '@/pages/check-certification/detail/CertificationResultsReport',
      },
      {
        //  批量勾选明细
        path: '/htc-front-ivp/check-certification/batch-check-detail/:invoiceCheckCollectId/:type',
        component: '@/pages/check-certification/detail/BatchCheckDetailTable',
      },
    ],
  },
];
const myInvoiceRouterConfig = [
  {
    path: '/htc-front-ivp/my-invoice',
    routes: [
      {
        // 我的发票
        path: '/htc-front-ivp/my-invoice/list',
        component: '@/pages/my-invoice/list/MyInvoicePage',
      },
      {
        // 查看详情
        path: '/htc-front-ivp/my-invoice/detail/:sourceCode/:sourceHeaderId',
        component: '@/pages/my-invoice/detail/MyInvoiceDetailPage',
      },
      {
        // 查看详情-发票
        path:
          '/htc-front-ivp/my-invoice/invoiceDetail/:invoiceHeaderId/:invoiceType/:entryPoolSource/:companyCode',
        component: '@/pages/invoices/detail/InvoicePoolDetailPage',
      },
      {
        // 查看详情-票据
        path: '/htc-front-ivp/my-invoice/billDetail/:billPoolHeaderId/:billType',
        component: '@/pages/bill-pool/detail/BillPoolDetailPage',
      },
      {
        // 单据关联
        path: '/htc-front-ivp/my-invoice/doc-related/:sourceCode/:sourceHeaderId',
        component: '@/pages/doc-related/detail/DocRelatedPage',
      },
      {
        //  档案查看
        path: '/htc-front-ivp/my-invoice/archive-view/:sourceCode/:sourceHeaderId',
        component: '@/pages/archive-view/detail/ArchiveViewPage',
      },
      {
        //  档案信息
        path: '/htc-front-ivp/my-invoice/archive-information/:sourceCode/:sourceHeaderId',
        component: '@/pages/archive-information/detail/archiveInformationPage',
      },
    ],
  },
];
const billsRouterConfig = [
  {
    path: '/htc-front-ivp/bills',
    routes: [
      {
        // 票据池
        path: '/htc-front-ivp/bills/list',
        component: '@/pages/bill-pool/list/BillsHeadersPage',
      },
      {
        // 票据池行信息
        path: '/htc-front-ivp/bills/lines/:billPoolHeaderId',
        component: '@/pages/bill-pool/list/BillsLinesPage',
      },
      {
        // 查看详情
        path: '/htc-front-ivp/bills/detail/:billPoolHeaderId/:billType',
        component: '@/pages/bill-pool/detail/BillPoolDetailPage',
      },
      // {
      //   // 获取底账
      //   path: '/htc-front-ivp/bills/original-account',
      //   component: () => import('../original-account/detail/OriginalAccountPage'),
      // },
      // {
      //   // 版式推送
      //   path: '/htc-front-ivp/bills/layout-push',
      //   component: () => import('../layout-push/detail/LayoutPushPage'),
      // },
      {
        // 档案归档
        path: '/htc-front-ivp/bills/bill-archive/:sourceCode',
        component: '@/pages/file-archive/detail/FileArchivePage',
      },
      {
        // 档案下载
        path: '/htc-front-ivp/bills/file-download/:sourceCode',
        component: '@/pages/file-download/detail/FileDownloadPage',
      },
      {
        // 单据关联
        path: '/htc-front-ivp/bills/doc-related/:sourceCode/:sourceHeaderId',
        component: '@/pages/doc-related/detail/DocRelatedPage',
      },
      {
        // 历史记录
        path: '/htc-front-ivp/bills/bill-history/:sourceCode/:sourceHeaderId',
        component: '@/pages/invoice-history/detail/InvoiceHistoryPage',
      },
      {
        //  档案上传
        path: '/htc-front-ivp/bills/archive-upload/:sourceCode/:sourceHeaderId',
        component: '@/pages/archive-upload/detail/ArchiveUploadPage',
      },
      {
        //  档案信息
        path: '/htc-front-ivp/bills/archive-information/:sourceCode/:sourceHeaderId',
        component: '@/pages/archive-information/detail/archiveInformationPage',
      },
      {
        //  批量上传
        path: '/htc-front-ivp/bills/batch-upload/:sourceCode/:companyId',
        component: '@/pages/batch-upload/detail/BatchUploadPage',
      },
      {
        //  档案查看
        path: '/htc-front-ivp/bills/archive-view/:sourceCode/:sourceHeaderId',
        component: '@/pages/archive-view/detail/ArchiveViewPage',
      },
    ],
    authorized: true,
  },
  // {
  //   path: '/public/htc-front-ivp/bills/archive-view',
  //   component: () => import('../archive-view/detail/ArchiveViewPubPage'),
  //   authorized: true,
  // },
];
const invoiceWhitelist = [
  {
    path: '/htc-front-ivp/invoice-whitelist',
    routes: [
      {
        path: '/htc-front-ivp/invoice-whitelist/list',
        component: '@/pages/invoice-whitelist/list/InvoiceWhitelistPage',
      },
    ],
  },
];
const batchDentificationCheck = [
  {
    path: '/htc-front-ivp/batch-check',
    routes: [
      {
        // 批量识别查验
        path: '/htc-front-ivp/batch-check/list',
        component: '@/pages/batch-dentificationcheck/list/BatchCheckPage',
      },
      {
        // 查看详情(发票池)
        path: '/htc-front-ivp/batch-check/invoiceDetail/:invoiceHeaderId/:invoiceType',
        component: '@/pages/batch-dentificationcheck/detail/BatchInvoiceDetailPage',
      },
      {
        // 查看详情(票据池)
        path: '/htc-front-ivp/batch-check/billDetail/:invoiceHeaderId',
        component: '@/pages/batch-dentificationcheck/detail/BatchBillDetailPage',
      },
      {
        // 查看详情(区块链、通用机打)
        path: '/htc-front-ivp/batch-check/blockAndCeneralDetail/:invoiceId',
        component: '@/pages/batch-dentificationcheck/detail/BatchBlockAndCeneralDetailPage',
      },
      {
        //  档案查看
        path: '/htc-front-ivp/batch-check/archive-view',
        component: '@/pages/batch-dentificationcheck/detail/FileView',
      },
    ],
  },
];
const taxRefund = [
  {
    path: '/htc-front-ivp/tax-refund',
    routes: [
      {
        path: '/htc-front-ivp/tax-refund/list',
        component: '@/pages/tax-refund/list/TaxRefundListPage',
      },
      {
        path: '/htc-front-ivp/tax-refund/texRefundConfirm/:companyId',
        component: '@/pages/tax-refund/detail/TaxRefundConfirmPage',
      },
    ],
  },
];
const invoiceCheck = [
  {
    path: '/htc-front-ivp/invoice-check',
    routes: [
      {
        path: '/htc-front-ivp/invoice-check/query',
        component: '@/pages/invoice-check/list/InvoiceCheckQueryPage',
      },
      {
        path: '/htc-front-ivp/invoice-check/detail/:invoiceHeaderId/:invoiceType',
        component: '@/pages/invoice-check/detail/InvoiceCheckDetailPage',
      },
    ],
  },
];
export default extendParentConfig({
  webpack5: {},
  devServer: {
    port: 8887,               //为了微前端本地启动，和主模块microService配置的端口对应
  },
  routes: [
    ...myInvoiceRouterConfig,
    ...documentTypeRouterConfig,
    ...invoicesRouterConfig,
    ...checkCertificationRouterConfig,
    ...billsRouterConfig,
    ...invoiceWhitelist,
    ...batchDentificationCheck,
    ...taxRefund,
    ...invoiceCheck,
  ],

  extraBabelPlugins: [       //原/packages/xxx/.babelrc.js--plugins
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
      //原先在.hzerorc.json使用的是"initLoad": true,现在使用的模块加载规则：当匹配到对应的路由后，才加载对应的模块。
      //主模块下microServices下registerRegex优先级最高
    },
  },
});
