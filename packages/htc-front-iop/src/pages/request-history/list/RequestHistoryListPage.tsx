/**
 * @Description: 销项请求历史记录表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-07-14 14:57
 * @LastEditTime:
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Dispatch } from 'redux';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import RequestHistoryListDS from '../stores/RequestHistoryListDS';

const modelCode = 'hcan.apply-statistics-history';

interface ApplyStatisticsHistoryListPageProps {
  dispatch: Dispatch<any>;
}

export default class ApplyStatisticsHistoryListPage extends Component<ApplyStatisticsHistoryListPageProps> {
  tableDS = new DataSet({
    autoQuery: true,
    ...RequestHistoryListDS(),
  });

  tenantId = getCurrentOrganizationId();

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
        <Header title={intl.get(`${modelCode}.title`).d('销项请求历史记录表')} />
        <Content>
          <Table queryFieldsLimit={3} dataSet={this.tableDS} columns={this.columns} />
        </Content>
      </>
    );
  }
}
