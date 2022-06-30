/*
 * @module - :
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-27 11:52:37
 * @LastEditors: jesse.chen
 * @LastEditTime: 2020-07-27 14:37:52
 * @Copyright: Copyright (c) 2020, Hand
 */

import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';
import InvoiceCheckQueryRouterConfig from './pages/invoice-check/routers';
import invoiceFullRouterConfig from '../pages/invoice-full/routers';
import invoiceCheckHistoryRouterConfig from './pages/invoice-check-history/routers';
import EnterpriseCertRequestHistoryRouterConfig from './pages/enterprise-cert-request-history/routers';
import BasicInfoQueryHistoryRouterConfig from './pages/basic-info-query-history/routers';
import InvoiceMainQueryHistoryRouterConfig from './pages/invoice-main-query-history/routers';
import InvoiceStatusChangeHistoryRouterConfig from './pages/invoice-status-change-history/routers';
import OfdInvoiceHistoryRouterConfig from './pages/ofd-invoice-history/routers';
import InvoiceOCRHistoryRouterConfig from './pages/invoice-ocr-history/routers';
import ApplyStatisticsHistoryRouterConfig from './pages/apply-statistics-history/routers';
import InvoiceStatisticsResultHistoryRouterConfig from './pages/invoice-statistics-result-history/routers';
import InvoiceRequestHistoryRouterConfig from './pages/invoice-request-history/routers';
import InvoiceAuthenticationHistoryRouterConfig from './pages/invoice-authentication-history/routers';
import billPushHistoryRouterConfig from './pages/bill-push-history/routers';
import InvoiceAddinfoQueryRouterConfig from './pages/invoice-addinfo-query-status/routers';
import linkGenerationHistoryRouterConfig from './pages/link-generation-history/routers';

const config: RoutersConfig = [
  ...InvoiceCheckQueryRouterConfig,
  ...invoiceFullRouterConfig,
  ...invoiceCheckHistoryRouterConfig,
  ...EnterpriseCertRequestHistoryRouterConfig,
  ...BasicInfoQueryHistoryRouterConfig,
  ...InvoiceMainQueryHistoryRouterConfig,
  ...InvoiceStatusChangeHistoryRouterConfig,
  ...OfdInvoiceHistoryRouterConfig,
  ...InvoiceOCRHistoryRouterConfig,
  ...ApplyStatisticsHistoryRouterConfig,
  ...InvoiceStatisticsResultHistoryRouterConfig,
  ...InvoiceRequestHistoryRouterConfig,
  ...InvoiceAuthenticationHistoryRouterConfig,
  ...billPushHistoryRouterConfig,
  ...InvoiceAddinfoQueryRouterConfig,
  ...linkGenerationHistoryRouterConfig,
];

export default config;
