import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';
import companyListRouterConfig from '../pages/company-list/routers';
import employeeDefendRouterConfig from '../pages/employee-define/routers';
import tenantAgreementRouterConfig from '../pages/tenant-agreement/routers';
import outageNoticeRouterConfig from '../pages/outage-notice/routers';
import billStatementRouterConfig from '../pages/bill-statement/routers';

const config: RoutersConfig = [
  ...companyListRouterConfig,
  ...employeeDefendRouterConfig,
  ...tenantAgreementRouterConfig,
  ...outageNoticeRouterConfig,
  ...billStatementRouterConfig,
];

export default config;
