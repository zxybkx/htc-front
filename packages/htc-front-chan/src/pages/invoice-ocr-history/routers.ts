/**
 * @routes -发票OCR历史记录 :
 * @Author: shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-18 10:56:45
 * @LastEditors: shan.zhang
 * @LastEditTime: 2020-09-18 13:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-chan/invoice-ocr-history/list',
    component: () => import('./list/InvoiceOCRHistoryListPage'),
  },
];

export default config;
