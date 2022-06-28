/**
 * @routes -开票附加信息状态查询 :
 * @Author: huishan.yu <huishan.yu@hand-china.com>
 * @Date: 2021-09-06 10:26:45
 * @LastEditors: huishan.yu
 * @LastEditTime: 2021-09-06 16:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-chan/invoice-addinfo-query-status/list',
    component: () => import('./list/InvoiceAddinfoQueryStatusListPage'),
  },
];

export default config;
