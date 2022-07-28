/**
 * @Description: 企业认证请求历史记录查询 :
 * @Author: shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-16 13:56:45
 * @LastEditors: shan.zhang
 * @LastEditTime: 2020-09-16 13:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Dispatch } from 'redux';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import ExcelExport from 'components/ExcelExport';
import EnterpriseCertRequestHistoryListDS from '../stores/EnterpriseCertRequestHistoryListDS';

const modelCode = 'hcan.enterprise-cert-request-histroy';
const API_PREFIX = commonConfig.CHAN_API || '';

interface EnterpriseCertRequestHistoryListPageProps {
  dispatch: Dispatch<any>;
}

export default class EnterpriseCertRequestHistoryListPage extends Component<
  EnterpriseCertRequestHistoryListPageProps
> {
  tableDS = new DataSet({
    autoQuery: true,
    ...EnterpriseCertRequestHistoryListDS(),
  });

  tenantId = getCurrentOrganizationId();

  /**
   * 导出
   */
  @Bind()
  handleGetQueryParams() {
    const queryParams = this.tableDS.queryDataSet!.map(data => data.toData()) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    return { ...queryParams[0] } || {};
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? this.tableDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'tenantName', width: 220 },
      { name: 'companyName', width: 210 },
      { name: 'employeeName', width: 120 },
      { name: 'resultQueryMeaning', width: 160 },
      { name: 'batchNo', width: 270 },
      { name: 'taxDiskPassword', width: 100 },
      { name: 'competentAgencyCode', width: 120 },
      { name: 'certificationPeriod', width: 100 },
      { name: 'processRemark', width: 200 },
      { name: 'confirmPassword', width: 100 },
      { name: 'processStatusCode', width: 100 },
      { name: 'processDateFrom', width: 160 },
      { name: 'processDateTo', width: 160 },
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('企业认证请求历史记录查询')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/enterprise-cert-request-historys/export`}
            queryParams={() => this.handleGetQueryParams()}
          />
        </Header>
        <Content>
          <Table queryFieldsLimit={3} dataSet={this.tableDS} columns={this.columns} />
        </Content>
      </>
    );
  }
}
