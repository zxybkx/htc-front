/**
 * @Description:发票池路由
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-11 17:00:15
 * @LastEditTime: 2021-01-22 17:50:48
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-ivp/invoices',
    components: [
      {
        // 发票池
        path: '/htc-front-ivp/invoices/list',
        component: () => import('./list/InvoicesHeadersPage'),
      },
      {
        // 发票池行信息
        path: '/htc-front-ivp/invoices/lines/:invoicePoolHeaderId',
        component: () => import('./list/InvoicesLinesPage'),
      },
      {
        // 查看详情
        path:
          '/htc-front-ivp/invoices/detail/:invoiceHeaderId/:invoiceType/:entryPoolSource/:companyCode',
        component: () => import('./detail/InvoicePoolDetailPage'),
      },
      {
        // 获取底账
        path: '/htc-front-ivp/invoices/original-account',
        component: () => import('../original-account/detail/OriginalAccountPage'),
      },
      {
        // 版式推送
        path: '/htc-front-ivp/invoices/layout-push',
        component: () => import('../layout-push/detail/LayoutPushPage'),
      },
      {
        // 档案归档
        path: '/htc-front-ivp/invoices/file-archive/:sourceCode',
        component: () => import('../file-archive/detail/FileArchivePage'),
      },
      {
        // 档案下载
        path: '/htc-front-ivp/invoices/file-download/:sourceCode',
        component: () => import('../file-download/detail/FileDownloadPage'),
      },
      {
        // 单据关联
        path: '/htc-front-ivp/invoices/doc-related/:sourceCode/:sourceHeaderId',
        component: () => import('../doc-related/detail/DocRelatedPage'),
      },
      {
        // 历史记录
        path: '/htc-front-ivp/invoices/invoice-history/:sourceCode/:sourceHeaderId',
        component: () => import('../invoice-history/detail/InvoiceHistoryPage'),
      },
      {
        //  档案上传
        path: '/htc-front-ivp/invoices/archive-upload/:sourceCode/:sourceHeaderId',
        component: () => import('../archive-upload/detail/ArchiveUploadPage'),
      },
      {
        //  批量上传
        path: '/htc-front-ivp/invoices/batch-upload/:sourceCode/:companyId',
        component: () => import('../batch-upload/detail/BatchUploadPage'),
      },
      {
        //  档案信息
        path: '/htc-front-ivp/invoices/archive-information/:sourceCode/:sourceHeaderId',
        component: () => import('../archive-information/detail/archiveInformationPage'),
      },
      {
        //  档案查看
        path: '/htc-front-ivp/invoices/archive-view/:sourceCode/:sourceHeaderId',
        component: () => import('../archive-view/detail/ArchiveViewPage'),
      },
    ],
    // models: [() => import('@src/models/invoicesModel')],
    // models: ["invoices"],
  },
  {
    path: '/public/htc-front-ivp/invoices/archive-view',
    component: () => import('../archive-view/detail/ArchiveViewPubPage'),
    authorized: true,
  },
];

export default config;
