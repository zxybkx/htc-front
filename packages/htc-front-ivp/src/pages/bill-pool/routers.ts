/*
 * @Descripttion:票据池路由
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-12 15:30:25
 * @LastEditTime: 2021-01-22 17:50:58
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-ivp/bills',
    components: [
      {
        // 票据池
        path: '/htc-front-ivp/bills/list',
        component: () => import('./list/BillsHeadersPage'),
      },
      {
        // 票据池行信息
        path: '/htc-front-ivp/bills/lines/:billPoolHeaderId',
        component: () => import('./list/BillsLinesPage'),
      },
      {
        // 查看详情
        path: '/htc-front-ivp/bills/detail/:billPoolHeaderId',
        component: () => import('./detail/BillPoolDetailPage'),
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
        component: () => import('../file-archive/detail/FileArchivePage'),
      },
      {
        // 档案下载
        path: '/htc-front-ivp/bills/file-download/:sourceCode',
        component: () => import('../file-download/detail/FileDownloadPage'),
      },
      {
        // 单据关联
        path: '/htc-front-ivp/bills/doc-related/:sourceCode/:sourceHeaderId',
        component: () => import('../doc-related/detail/DocRelatedPage'),
      },
      {
        // 历史记录
        path: '/htc-front-ivp/bills/bill-history/:sourceCode/:sourceHeaderId',
        component: () => import('../invoice-history/detail/InvoiceHistoryPage'),
      },
      {
        //  档案上传
        path: '/htc-front-ivp/bills/archive-upload/:sourceCode/:sourceHeaderId',
        component: () => import('../archive-upload/detail/ArchiveUploadPage'),
      },
      {
        //  档案查看
        path: '/htc-front-ivp/bills/archive-view/:sourceCode/:sourceHeaderId',
        component: () => import('../archive-view/detail/ArchiveViewPage'),
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

export default config;
