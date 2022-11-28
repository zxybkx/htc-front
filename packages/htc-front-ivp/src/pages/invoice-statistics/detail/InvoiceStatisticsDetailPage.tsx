/*
 * @Description: 进销发票统计报表
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-11-03 16:12:58
 * @LastEditTime: 2022-11-15 11:18:02
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@htccommon/config/commonConfig';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
// import { RouteComponentProps } from 'react-router-dom';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';
import DetailDS from '../stores/ReportDetailDS';

const API_PREFIX = commonConfig.IVP_API || '';
const tenantId = getCurrentOrganizationId();
const modelCode = 'hivp.invoiceStatistics';

interface InvoiceStatisticsDetailPageProps {
  detailDS: DataSet;
  location: {
    state: Object | any;
  };
}

@formatterCollections({
  code: [modelCode, 'htc.common', 'hivp.invoicesLayoutPush', 'hivp.batchCheck'],
})
export default class InvoiceStatisticsPage extends Component<InvoiceStatisticsDetailPageProps> {
  detailDS = new DataSet({
    autoQuery: false,
    ...DetailDS(),
  });

  @Bind()
  async componentDidMount() {
    const { queryDataSet } = this.detailDS;
    if (queryDataSet && queryDataSet.current) {
      queryDataSet.current.set(this.props.location.state);
      this.detailDS.query();
    }
  }

  get columns(): ColumnProps[] {
    return [
      {
        name: 'invoiceType',
        width: 140,
      },
      {
        name: 'invoiceCode',
      },
      {
        name: 'invoiceNo',
      },
      {
        name: 'buyerName',
        width: 140,
      },
      {
        name: 'sellerName',
        width: 140,
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
        <Header
          title={intl.get(`${modelCode}.view.detailTitle`).d('进销发票统计报表详情')}
          backPath="/htc-front-ivp/invoice-statistics/list"
        >
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/in-out-invoice/export-detail`}
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
