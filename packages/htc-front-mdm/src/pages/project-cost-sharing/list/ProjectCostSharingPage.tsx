/**
 * @Description:项目费用分摊
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-03-28 9:45:22
 * @LastEditTime: 2022-06-20 17:11:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import ExcelExport from 'components/ExcelExport';
import { Content, Header } from 'components/Page';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { DataSet, Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';
import costSharingListDS from '../stores/CostSharingListDS';

const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.MDM_API || '';
const modelCode = 'hmdm.company-list';

interface CostSharingListPageProps {
  dispatch: Dispatch<any>;
}
export default class ProjectCostSharingPage extends Component<CostSharingListPageProps> {
  tableDS = new DataSet({
    autoQuery: true,
    ...costSharingListDS(),
  });

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      { name: 'tenantName', width: 200 },
      { name: 'projectNumber', width: 150 },
      { name: 'projectName', width: 150 },
      { name: 'projectDate', width: 200 },
      { name: 'expensesTypeCode', width: 200 },
      { name: 'annualFee', width: 150 },
      { name: 'allNumber', width: 150 },
      { name: 'phaseQuantity', width: 150 },
      { name: 'statisticalStartDate', width: 200 },
      { name: 'statisticalEndDate', width: 200 },
      { name: 'deliveryDocker', width: 150 },
      { name: 'dockerContact', width: 150 },
      { name: 'administrator', width: 150 },
      { name: 'adminContact', width: 250 },
    ];
  }

  /**
   * 导出
   */
  @Bind()
  exportParams() {
    const queryParams = this.tableDS.queryDataSet!.map(data => data.toData()) || {};
    const { companyObj, ...otherData } = queryParams[0];
    const _queryParams = {
      ...companyObj,
      ...otherData,
    };
    return { ..._queryParams } || {};
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('项目费用分摊报表')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/cost-share-infos/export`}
            queryParams={() => this.exportParams()}
          />
        </Header>
        <Content>
          <Table
            // queryFieldsLimit={3}
            dataSet={this.tableDS}
            columns={this.columns}
            style={{ height: 500 }}
          />
        </Content>
      </>
    );
  }
}
