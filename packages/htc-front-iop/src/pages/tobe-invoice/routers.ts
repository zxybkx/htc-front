/*
 * @Description:待开票数据勾选
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-03 16:24:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-iop/tobe-invoice',
    components: [
      // 待开票数据勾选
      {
        path: '/htc-front-iop/tobe-invoice/list',
        component: () => import('./list/TobeInvoicePage'),
      },
      // 生成申请
      {
        path: '/htc-front-iop/tobe-invoice/generate-application/:companyId/:ids',
        component: () => import('./detail/GenerateApplicationPage'),
      },
      // 商品信息
      {
        path: '/htc-front-iop/tobe-invoice/commodity-edit/:companyId/:companyCode/:employeeNumber',
        component: () => import('./detail/CommodityEditPage'),
      },
      // 客户信息
      {
        path: '/htc-front-iop/tobe-invoice/customer-edit/:companyId/:companyCode/:employeeNumber',
        component: () => import('./detail/CustomerEditPage'),
      },
      // 查看申请单
      {
        path: '/htc-front-iop/tobe-invoice/req-detail/:sourceType/:companyId/:headerId',
        component: () => import('../invoice-req/detail/InvoiceReqDetailPage'),
      },
    ],
  },
];
export default config;
