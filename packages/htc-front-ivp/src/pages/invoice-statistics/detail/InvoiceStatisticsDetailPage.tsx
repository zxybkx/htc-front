/*
 * @Description: 进销发票统计报表
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-11-03 16:12:58
 * @LastEditTime: 2022-11-08 14:26:57
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@htccommon/config/commonConfig';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { RouteComponentProps } from 'react-router-dom';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';
import DetailDS from '../stores/DetailDs';

const API_PREFIX = commonConfig.IVP_API || '';
const tenantId = getCurrentOrganizationId();
const modelCode = 'hivp.invoiceStatistics';

interface InvoiceStatisticsDetailPageProps extends RouteComponentProps {
  detailDS: DataSet;
}

@formatterCollections({
  code: [
    modelCode,
    'hivp.bill',
    'hivp.invoicesLayoutPush',
    'htc.common',
    'hcan.invoiceDetail',
    'hivc.select',
    'hivp.batchCheck',
    'hiop.invoiceWorkbench',
    'hivp.checkCertification',
    'hiop.invoiceReq',
    'hivp.invoicesArchiveUpload',
  ],
})
export default class InvoiceStatisticsPage extends Component<InvoiceStatisticsDetailPageProps> {
  detailDS = new DataSet({
    autoQuery: false,
    ...DetailDS(),
  });

  get columns(): ColumnProps[] {
    return [
      {
        name: 'invoiceType',
      },
      {
        name: 'invoiceCode',
      },
      {
        name: 'invoiceNo',
      },
      {
        name: 'buyerName',
      },
      {
        name: 'sellerName',
      },
      {
        name: 'invoiceState',
      },
      {
        name: 'invoiceDate',
      },
      {
        name: 'invoiceAmount',
      },
      {
        name: 'taxAmount',
      },
      {
        name: 'totalAmount',
      },
      {
        name: 'inOutType',
      },
    ];
  }

  /**
   * 导出
   */
  @Bind()
  handleGetQueryParams() {
    const { queryDataSet } = this.detailDS;
    const queryParams = queryDataSet?.map(data => data.toData()) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
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
        <Header title={intl.get(`${modelCode}.view.title`).d('进销发票统计报表详情')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoice-pool-main/export-invoice`}
            queryParams={() => this.handleGetQueryParams()}
          />
        </Header>
        <Content>
          <Table
            dataSet={this.detailDS}
            queryBar={() => ''}
            columns={this.columns}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
