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
      { name: 'requestId' ,
      { name: 'tenantId' },
      { name: 'companyCode' },
      { name: 'companyName', width: 210 },
      { name: 'employeeNumber' },
      { name: 'employeeName' },
      { name: 'requestJson', width: 210 },
      { name: 'responseJson', width: 210 },
      { name: 'requestType', width: 210 },
      { name: 'successFlag' },
      { name: 'processRemark', width: 160 },
      { name: 'processDateFrom', width: 150 },
      { name: 'processDateTo', width: 150 },
      { name: 'creationDate', width: 150 },
      { name: 'lastUpdateDate', width: 150 },
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
