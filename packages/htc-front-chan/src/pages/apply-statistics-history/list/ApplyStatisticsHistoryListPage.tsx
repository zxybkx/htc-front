/**
 * @Description: 发票申请统计历史记录
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2021-10-28 15:22:10
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { Bind } from 'lodash-decorators';
import commonConfig from '@htccommon/config/commonConfig';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Dispatch } from 'redux';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import ExcelExport from 'components/ExcelExport';
import ApplyStatisticsHistoryListDS from '../stores/ApplyStatisticsHistoryListDS';

const modelCode = 'hcan.apply-statistics-history';
const API_PREFIX = commonConfig.CHAN_API || '';

interface ApplyStatisticsHistoryListPageProps {
  dispatch: Dispatch<any>;
}

export default class ApplyStatisticsHistoryListPage extends Component<
  ApplyStatisticsHistoryListPageProps
> {
  tableDS = new DataSet({
    autoQuery: true,
    ...ApplyStatisticsHistoryListDS(),
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
      { name: 'employeeName', width: 130 },
      { name: 'batchNo', width: 270 },
      { name: 'statisticsDate', width: 100 },
      { name: 'taxDiscLoginPassword', width: 120 },
      { name: 'processStatusCode', width: 100 },
      { name: 'processRemark', width: 260 },
      { name: 'processDateFrom', width: 160 },
      { name: 'processDateTo', width: 160 },
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('发票申请统计历史记录')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/apply-statistics-historys/export`}
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
