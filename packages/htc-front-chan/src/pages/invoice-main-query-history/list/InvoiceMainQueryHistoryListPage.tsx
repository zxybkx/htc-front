/**
 * @Description: 发票主信息采集历史记录
 * @Author: shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-17 13:56:45
 * @LastEditors: shan.zhang
 * @LastEditTime: 2020-09-17 13:56:45
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
import InvoiceMainQueryHistoryListDS from '../stores/InvoiceMainQueryHistoryListDS';

const modelCode = 'hcan.invoice-main-query-history';
const API_PREFIX = commonConfig.CHAN_API || '';

interface InvoiceMainQueryHistoryListPageProps {
  dispatch: Dispatch<any>;
}

export default class InvoiceMainQueryHistoryListPage extends Component<InvoiceMainQueryHistoryListPageProps> {
  tableDS = new DataSet({
    autoQuery: true,
    ...InvoiceMainQueryHistoryListDS(),
  });

  tenantId = getCurrentOrganizationId();

  /**
   * 导出
   */
  @Bind()
  handleGetQueryParams() {
    const queryParams = this.tableDS.queryDataSet!.map((data) => data.toData()) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    const exportParams = { ...queryParams[0] } || {};
    return exportParams;
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
      { name: 'resultQueryMeaning', width: 180 },
      { name: 'batchNo', width: 270 },
      { name: 'startDate', width: 130 },
      { name: 'processRemark', width: 160 },
      { name: 'processDateFrom', width: 160 },
      { name: 'processDateTo', width: 160 },
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('发票主信息采集历史记录')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/basic-info-query-historys/export`}
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
