/*
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-14 16:53:56
 * @LastEditTime: 2021-01-04 10:14:54
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-iop/invoice-req',
    components: [
      {
        path: '/htc-front-iop/invoice-req/list',
        component: () => import('./list/InvoiceReqListPage'),
      },
      {
        path: '/htc-front-iop/invoice-req/create/:companyId',
        component: () => import('./detail/InvoiceReqDetailPage'),
      },
      {
        path: '/htc-front-iop/invoice-req/detail/:companyId/:headerId',
        component: () => import('./detail/InvoiceReqDetailPage'),
      },
      {
        path: '/htc-front-iop/invoice-req/order/:headerId',
        component: () => import('./list/InvoiceReqOrderListPage'),
      },
      {
        path: '/htc-front-iop/invoice-req/invoice-view/:sourceType/:headerId/:invoiceSourceType',
        component: () => import('../invoice-view/InvoiceViewPage'),
      },
      // 空白废申请
      {
        path: '/htc-front-iop/invoice-req/invoiceVoid/:sourceType/:companyId',
        component: () => import('../invoice-void/list/InvoiceVoidPage'),
      },
      // 发票作废
      {
        path:
          '/htc-front-iop/invoice-req/invoice-void/:sourceType/:invoicingOrderHeaderId/:companyId',
        component: () => import('../invoice-void/list/InvoiceVoidPage'),
      },
      // 发票红冲
      {
        path:
          '/htc-front-iop/invoice-req/invoiceRedFlush/:sourceType/:invoicingOrderHeaderId/:companyId',
        component: () => import('../invoice-redFlush/list/InvoiceRedFlushPage'),
      },
      // 申请单-发票作废
      {
        path:
          '/htc-front-iop/invoice-req/invoiceMain-void/:sourceType/:invoicingReqHeaderId/:companyId',
        component: () => import('../invoice-void/list/InvoiceVoidPage'),
      },
      // 申请单-发票红冲
      {
        path:
          '/htc-front-iop/invoice-req/invoiceMain-redFlush/:sourceType/:invoicingReqHeaderId/:companyId',
        component: () => import('../invoice-redFlush/list/InvoiceRedFlushPage'),
      },
    ],
  },
];

export default config;
