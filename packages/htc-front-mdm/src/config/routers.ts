import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';
import automaticCollectionManageRouterConfig from '../pages/automatic-collection-manage/routers';
import automaticCollectionRulesRouterConfig from '../pages/automatic-collection-rules/routers';
import companyListRouterConfig from '../pages/company-list/routers';
import employeeDefendRouterConfig from '../pages/employee-define/routers';
import tenantAgreementRouterConfig from '../pages/tenant-agreement/routers';
import outageNoticeRouterConfig from '../pages/outage-notice/routers';
import billStatementRouterConfig from '../pages/bill-statement/routers';
import projectApplicationRouterConfig from '../pages/project-application/routers';
import applicationInfoRouterConfig from '../pages/apply-tenant/routers';
import projectCostSharingRouterConfig from '../pages/project-cost-sharing/routers';
import projectTenantMaintenanceRouterConfig from '../pages/project-tenant-maintenance/routers';

const config: RoutersConfig = [
  ...companyListRouterConfig,
  ...employeeDefendRouterConfig,
  ...tenantAgreementRouterConfig,
  ...outageNoticeRouterConfig,
  ...billStatementRouterConfig,
  ...projectApplicationRouterConfig,
  ...applicationInfoRouterConfig,
  ...automaticCollectionManageRouterConfig,
  ...automaticCollectionRulesRouterConfig,
  ...projectCostSharingRouterConfig,
  ...projectTenantMaintenanceRouterConfig,
];

export default config;
