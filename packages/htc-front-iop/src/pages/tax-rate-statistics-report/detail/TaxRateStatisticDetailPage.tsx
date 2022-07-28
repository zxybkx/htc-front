/**
 * @Description:分税率统计报表明细
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-04-21
 * @LastEditTime: 2022-06-14 17:11
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import queryString from 'query-string';
import { Content, Header } from 'components/Page';
import { DataSet, Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { openTab } from 'utils/menuTab';
import TaxRateStatisticDetailDS from '../stores/TaxRateStatisticDetailDS';

interface RouterInfo {}

interface TaxRateStatisticsReportPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [
    'htc.common',
    'hiop.taxRateStatistic',
    'hiop.invoiceWorkbench',
    'hcan.invoiceDetail',
    'hiop.tobeInvoice',
  ],
})
export default class TaxRateStatisticDetailPage extends Component<
  TaxRateStatisticsReportPageProps
> {
  taxRateStatisticsReport = new DataSet({
    autoQuery: false,
    ...TaxRateStatisticDetailDS(),
  });

  componentDidMount(): void {
    const { search } = this.props.location;
    const recordInfoStr = new URLSearchParams(search).get('recordInfo');
    if (recordInfoStr) {
      const recordInfo = JSON.parse(decodeURIComponent(recordInfoStr));
      const { record } = recordInfo;
      this.taxRateStatisticsReport.setQueryParameter('recordInfo', record);
      this.taxRateStatisticsReport.query();
    }
  }

  /**
   * 分税率统计报表明细查看详情
   * @params {object} record-行记录
   */
  handleGotoOrderDetailPage = record => {
    const invoicingOrderHeaderId = record.get('invoicingOrderHeaderId');
    const companyId = record.get('companyId');
    openTab({
      key: `/htc-front-iop/invoice-workbench/edit/invoiceOrder/${companyId}/${invoicingOrderHeaderId}`,
      path: `/htc-front-iop/invoice-workbench/edit/invoiceOrder/${companyId}/${invoicingOrderHeaderId}`,
      title: intl.get('hiop.invoiceWorkbench.title.invoiceOrder').d('开票订单'),
      search: queryString.stringify({
        invoiceInfo: encodeURIComponent(
          JSON.stringify({
            backPath: location.pathname,
            backSearch: location.search,
          })
        ),
      }),
      closable: true,
      type: 'menu',
    });
  };

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      { name: 'companyCode' },
      {
        name: 'orderNumber',
        width: 250,
        renderer: ({ record, value }) => (
          <a onClick={() => this.handleGotoOrderDetailPage(record)}>{value}</a>
        ),
      },
      { name: 'extNumber' },
      { name: 'buyerName', width: 200 },
      { name: 'invoiceVariety' },
      { name: 'invoiceDate' },
      { name: 'invoiceTotalPriceTaxAmount', width: 120 },
      { name: 'invoiceTotalTax' },
      { name: 'invoiceExcludeTaxAmount', width: 130 },
      { name: 'sellerName', width: 200 },
      { name: 'billingType' },
      { name: 'invoiceCode', width: 120 },
      { name: 'invoiceNo' },
      { name: 'lineNumber' },
      { name: 'projectNumber', width: 120 },
      { name: 'projectName', width: 200 },
      { name: 'quantity' },
      { name: 'projectUnitPrice' },
      { name: 'amount' },
      { name: 'taxRate' },
      { name: 'taxIncludedFlag' },
      { name: 'taxAmount' },
      { name: 'deduction' },
      { name: 'model' },
      { name: 'projectUnit' },
      { name: 'preferentialPolicyFlag' },
      { name: 'zeroTaxRateFlag' },
      { name: 'specialVatManagement', width: 120 },
      { name: 'commodityNumber', width: 200 },
    ];
  }

  render() {
    return (
      <>
        <Header
          backPath="/htc-front-iop/tax-rate-statistics-report/list"
          title={intl.get('hiop.taxInfo.title.checkDetail').d('查看明细')}
        />
        <Content>
          <Table
            dataSet={this.taxRateStatisticsReport}
            columns={this.columns}
            style={{ height: 500 }}
          />
        </Content>
      </>
    );
  }
}
