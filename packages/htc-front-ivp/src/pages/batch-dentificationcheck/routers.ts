/*
 * @Description:批量识别查验
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-1-25 9:28:12
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-ivp/batch-check',
    components: [
      {
        // 批量识别查验
        path: '/htc-front-ivp/batch-check/list',
        component: () => import('./list/BatchCheckPage'),
      },
      {
        // 查看详情(发票池)
        path: '/htc-front-ivp/batch-check/invoiceDetail/:invoiceHeaderId/:invoiceType',
        component: () => import('./detail/BatchInvoiceDetailPage'),
      },
      {
        // 查看详情(票据池)
        path: '/htc-front-ivp/batch-check/billDetail/:invoiceHeaderId',
        component: () => import('./detail/BatchBillDetailPage'),
      },
      {
        //  档案查看
        path: '/htc-front-ivp/batch-check/archive-view',
        component: () => import('./detail/FileView'),
      },
    ],
  },
];

export default config;
