/**
 * @Description - 开票订单运维平台路由
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-25
 * @LastEditeTime: 2022-02-25
 * @Copyright: Copyright (c) 2022, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-iop/invoice-operation-maintenance',
    component: () => import('./list/InvoiceOperationMaintenancePage'),
  },
];

export default config;
