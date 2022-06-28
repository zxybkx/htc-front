/**
 * @Description:分税率统计报表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-04-20
 * @LastEditTime: 2020-06-15 10:18
 * @Copyright: Copyright (c) 2022, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-iop/tax-rate-statistics-report',
    components: [
      {
        path: '/htc-front-iop/tax-rate-statistics-report/list',
        component: () => import('./list/TaxRateStatisticsReportPage'),
      },
      {
        path: '/htc-front-iop/tax-rate-statistics-report/detail',
        component: () => import('./detail/TaxRateStatisticDetailPage'),
      },
    ],
  },
];

export default config;
