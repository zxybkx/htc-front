/**
 * @Description:开票订单路由
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-10 11:13:22
 * @LastEditTime: 2022-06-14 11:28
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-iop/invoice-workbench',
    components: [
      // 开票订单工作台
      {
        path: '/htc-front-iop/invoice-workbench/list',
        component: () => import('./list/InvoiceWorkbenchPage'),
      },
      // 新建开票订单
      {
        path: '/htc-front-iop/invoice-workbench/invoice-order/:sourceType/:companyId',
        component: () => import('./detail/InvoiceOrderPage'),
      },
      // 编辑开票订单
      {
        path:
          '/htc-front-iop/invoice-workbench/edit/:sourceType/:companyId/:invoicingOrderHeaderId',
        component: () => import('./detail/InvoiceOrderPage'),
      },
      // 空白发票作废
      {
        path: '/htc-front-iop/invoice-workbench/invoice-void/:companyId',
        component: () => import('../invoice-void/list/InvoiceVoidPage'),
      },
      // 发票作废
      {
        path:
          '/htc-front-iop/invoice-workbench/invoice-line-void/:invoicingOrderHeaderId/:companyId',
        component: () => import('../invoice-void/list/InvoiceVoidPage'),
      },
      // 发票红冲
      {
        path:
          '/htc-front-iop/invoice-workbench/invoice-red-flush/:invoicingOrderHeaderId/:companyId',
        component: () => import('../invoice-redFlush/list/InvoiceRedFlushPage'),
      },
      // 发票预览
      {
        path: '/htc-front-iop/invoice-workbench/invoice-view/:sourceType/:headerId/:employeeId',
        component: () => import('../invoice-view/InvoiceViewPage'),
      },
    ],
  },
];
export default config;
