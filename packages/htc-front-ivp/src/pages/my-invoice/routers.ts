/*
 * @Description:我的发票
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-10-12 11:04:45
 * @LastEditTime: 2022-03-09 11:34:04
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-ivp/my-invoice',
    components: [
      {
        // 我的发票
        path: '/htc-front-ivp/my-invoice/list',
        component: () => import('./list/MyInvoicePage'),
      },
      {
        // 查看详情
        path: '/htc-front-ivp/my-invoice/detail/:sourceCode/:sourceHeaderId',
        component: () => import('./detail/MyInvoiceDetailPage'),
      },
      {
        // 查看详情-发票
        path:
          '/htc-front-ivp/my-invoice/invoiceDetail/:invoiceHeaderId/:invoiceType/:entryPoolSource/:companyCode',
        component: () => import('../invoices/detail/InvoicePoolDetailPage'),
      },
      {
        // 查看详情-票据
        path: '/htc-front-ivp/my-invoice/billDetail/:billPoolHeaderId/:billType',
        component: () => import('../bill-pool/detail/BillPoolDetailPage'),
      },
      {
        // 单据关联
        path: '/htc-front-ivp/my-invoice/doc-related/:sourceCode/:sourceHeaderId',
        component: () => import('../doc-related/detail/DocRelatedPage'),
      },
      {
        //  档案查看
        path: '/htc-front-ivp/my-invoice/archive-view/:sourceCode/:sourceHeaderId',
        component: () => import('../archive-view/detail/ArchiveViewPage'),
      },
      {
        //  档案信息
        path: '/htc-front-ivp/my-invoice/archive-information/:sourceCode/:sourceHeaderId',
        component: () => import('../archive-information/detail/archiveInformationPage'),
      },
    ],
  },
];

export default config;
