/*
 * @Description:发票池路由
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-16 15:45:03
 * @LastEditTime: 2021-01-25 10:03:09
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';
import documentTypeRouterConfig from '../pages/document-type/routers';
import invoicesRouterConfig from '../pages/invoices/routers';
import checkCertificationRouterConfig from '../pages/check-certification/routers';
import myInvoiceRouterConfig from '../pages/my-invoice/routers';
import billsRouterConfig from '../pages/bill-pool/routers';
import invoiceWhitelist from '../pages/invoice-whitelist/routers';
import batchDentificationCheck from '../pages/batch-dentificationcheck/routers';
import taxRefund from '../pages/tax-refund/routers';
import invoiceCheck from '../pages/invoice-check/routers';

const config: RoutersConfig = [
  // Insert New Router
  ...myInvoiceRouterConfig,
  ...documentTypeRouterConfig,
  ...invoicesRouterConfig,
  ...checkCertificationRouterConfig,
  ...billsRouterConfig,
  ...invoiceWhitelist,
  ...batchDentificationCheck,
  ...taxRefund,
  ...invoiceCheck,
];

export default config;
