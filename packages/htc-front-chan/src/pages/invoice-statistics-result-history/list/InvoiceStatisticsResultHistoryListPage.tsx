/**
 * @Description: 发票统计结果查询历史记录
 * @Author: shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-18 16:31:45
 * @LastEditors: shan.zhang
 * @LastEditTime: 2020-09-18 16:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { DataSet, Table, Tooltip } from 'choerodon-ui/pro';
import { Dispatch } from 'redux';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import ExcelExport from 'components/ExcelExport';
import InvoiceStatisticsResultHistoryListDS from '../stores/InvoiceStatisticsResultHistoryListDS';

const modelCode = 'hcan.invoice-statistics-result-history';
const API_PREFIX = commonConfig.CHAN_API || '';

interface InvoiceStatisticsResultHistoryListPageProps {
  dispatch: Dispatch<any>;
}

export default class InvoiceStatisticsResultHistoryListPage extends Component<
  InvoiceStatisticsResultHistoryListPageProps
> {
  tableDS = new DataSet({
    autoQuery: true,
    ...InvoiceStatisticsResultHistoryListDS(),
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
        renderer: ({ record }) => {
          return record ? this.tableDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'tenantName', width: 220 },
      { name: 'inChannelCode', width: 140 },
      { name: 'companyName', width: 210 },
      { name: 'employeeName', width: 130 },
      { name: 'batchNo', width: 270 },
      { name: 'processStatusCode', width: 100 },
      {
        name: 'processRemark',
        width: 160,
        renderer: ({ value }) => {
          return (
            <Tooltip placement="topLeft" title={value}>
              <span>{value}</span>
            </Tooltip>
          );
        },
      },
      { name: 'processDateFrom', width: 160 },
      { name: 'processDateTo', width: 160 },
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('发票统计结果查询历史记录')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/invoice-statistical-result-historys/export`}
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
