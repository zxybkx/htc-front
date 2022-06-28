/**
 * @Description: 发票勾选请求历史记录
 * @Author: shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-21 09:26:45
 * @LastEditors: shan.zhang
 * @LastEditTime: 2020-09-21 16:56:45
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
import InvoiceRequestHistoryListDS from '../stores/InvoiceRequestHistoryListDS';

const modelCode = 'hcan.invoice-request-history';
const API_PREFIX = commonConfig.CHAN_API || '';

interface InvoiceRequestHistoryListPageProps {
  dispatch: Dispatch<any>;
}

export default class InvoiceRequestHistoryListPage extends Component<InvoiceRequestHistoryListPageProps> {
  tableDS = new DataSet({
    autoQuery: true,
    ...InvoiceRequestHistoryListDS(),
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
      { name: 'requestType', width: 160 },
      { name: 'batchNo', width: 270 },
      { name: 'contentRows', width: 130 },
      { name: 'competentAgencyCode', width: 130 },
      { name: 'taxDiskPassword', width: 100 },
      { name: 'processStatusCode', width: 100 },
      { name: 'processRemark', width: 230 },
      { name: 'processDateFrom', width: 160 },
      { name: 'processDateTo', width: 160 },
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('发票勾选请求历史记录')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/invoice-request-historys/export`}
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
