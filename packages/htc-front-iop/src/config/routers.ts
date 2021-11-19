/*
 * @Description:销项服务路由
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-23 14:21:28
 * @LastEditTime: 2021-06-03 16:52:53
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';
import taxInfoRouterConfig from '../pages/tax-info/routers';
import commodityInfoRouterConfig from '../pages/commodity-info/routers';
import invoiceRuleRouterConfig from '../pages/invoice-rule/routers';
import redInvoiceRouterConfig from '../pages/red-invoice/routers';
import invoiceWorkbenchRouterConfig from '../pages/invoice-workbench/routers';
import invoiceReqRouterConfig from '../pages/invoice-req/routers';
import permissionAssignRouterConfig from '../pages/permission-assign/routers';
import customerInfoRouterConfig from '../pages/customer-info/routers';
import tobeInvoiceRouterConfig from '../pages/tobe-invoice/routers';

const config: RoutersConfig = [
  // Insert New Router
  ...invoiceReqRouterConfig,
  ...invoiceRuleRouterConfig,
  ...commodityInfoRouterConfig,
  ...taxInfoRouterConfig,
  ...redInvoiceRouterConfig,
  ...invoiceWorkbenchRouterConfig,
  ...permissionAssignRouterConfig,
  ...customerInfoRouterConfig,
  ...tobeInvoiceRouterConfig,
];

export default config;
