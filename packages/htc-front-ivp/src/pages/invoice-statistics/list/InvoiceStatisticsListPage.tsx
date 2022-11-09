/*
 * @Description: 进销发票统计报表
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-11-03 16:12:58
 * @LastEditTime: 2022-11-08 10:40:01
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import withProps from 'utils/withProps';
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
import ListDS from '../stores/ListDS';

const API_PREFIX = commonConfig.IVP_API || '';
const tenantId = getCurrentOrganizationId();
const modelCode = 'hivp.invoiceStatistics';

interface InvoiceStatisticsPageProps extends RouteComponentProps {
  listDS: DataSet;
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
@withProps(
  () => {
    const listDS = new DataSet({
      autoQuery: false,
      ...ListDS(),
    });
    return { listDS };
  },
  { cacheState: true }
)
export default class InvoiceStatisticsPage extends Component<InvoiceStatisticsPageProps> {
  @Bind()
  handleGotoDetailTablePage(record) {
    const { history } = this.props;
    history.push({
      pathname: '/htc-front-ivp/deduction-statement/detail',
      state: { record },
    });
  }

  // 渲染列脚
  @Bind()
  renderColumnFooter(dataSet, name) {
    let total;
    dataSet.forEach(record => {
      const _total = Number(total) || 0;
      const _amount = Number(record.get(name)) || 0;
      total = ((_total * 100 + _amount * 100) / 100).toFixed(2);
    });
    total =
      total &&
      total.toString().replace(/\d+/, n => {
        return n.replace(/(\d)(?=(\d{3})+$)/g, i => {
          return `${i},`;
        });
      });
    return `${total || 0}`;
  }

  get columns(): ColumnProps[] {
    return [
      {
        name: 'year',
        footer: () => `${intl.get('hivp.invoices.view.total').d('合计')}：`,
      },
      {
        name: 'mouth',
      },
      {
        name: 'trueInvoiceAmount',
        width: 120,
        renderer: ({ record }) => {
          const trueInvoiceAmount = record && record.get('trueInvoiceAmount');
          return <a onClick={() => this.handleGotoDetailTablePage(record)}>{trueInvoiceAmount}</a>;
        },
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'trueTaxAmount',
        width: 120,
        renderer: ({ record }) => {
          const trueTaxAmount = record && record.get('trueTaxAmount');
          return <a onClick={() => this.handleGotoDetailTablePage(record)}>{trueTaxAmount}</a>;
        },
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'unInvoiceIncomeAmount',
        width: 120,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'unInvoiceIncomeTaxAmount',
        width: 120,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'adjustIncomeAmount',
        width: 120,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'adjustIncomeTaxAmount',
        width: 120,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'checkDeductionAmount',
        width: 120,
        renderer: ({ record }) => {
          const checkDeductionAmount = record && record.get('checkDeductionAmount');
          return (
            <a onClick={() => this.handleGotoDetailTablePage(record)}>{checkDeductionAmount}</a>
          );
        },
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'checkDeductionTaxAmount',
        width: 120,
        renderer: ({ record }) => {
          const checkDeductionTaxAmount = record && record.get('checkDeductionTaxAmount');
          return (
            <a onClick={() => this.handleGotoDetailTablePage(record)}>{checkDeductionTaxAmount}</a>
          );
        },
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'fillingDeductionTaxAmount',
        width: 120,
        renderer: ({ record }) => {
          const fillingDeductionTaxAmount = record && record.get('fillingDeductionTaxAmount');
          return (
            <a onClick={() => this.handleGotoDetailTablePage(record)}>
              {fillingDeductionTaxAmount}
            </a>
          );
        },
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'fillingDeductionAmount',
        width: 120,
        renderer: ({ record }) => {
          const fillingDeductionAmount = record && record.get('fillingDeductionAmount');
          return (
            <a onClick={() => this.handleGotoDetailTablePage(record)}>{fillingDeductionAmount}</a>
          );
        },
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'inputTaxTransferAmount',
        width: 120,
        renderer: ({ record }) => {
          const inputTaxTransferAmount = record && record.get('inputTaxTransferAmount');
          return (
            <a onClick={() => this.handleGotoDetailTablePage(record)}>{inputTaxTransferAmount}</a>
          );
        },
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'inputTaxTransferTaxAmount',
        width: 120,
        renderer: ({ record }) => {
          const inputTaxTransferTaxAmount = record && record.get('inputTaxTransferTaxAmount');
          return (
            <a onClick={() => this.handleGotoDetailTablePage(record)}>
              {inputTaxTransferTaxAmount}
            </a>
          );
        },
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'totalDeductionAmount',
        width: 120,
        renderer: ({ record }) => {
          const totalDeductionAmount = record && record.get('totalDeductionAmount');
          return (
            <a onClick={() => this.handleGotoDetailTablePage(record)}>{totalDeductionAmount}</a>
          );
        },
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'totalDeductionTaxAmount',
        width: 120,
        renderer: ({ record }) => {
          const totalDeductionTaxAmount = record && record.get('totalDeductionTaxAmount');
          return (
            <a onClick={() => this.handleGotoDetailTablePage(record)}>{totalDeductionTaxAmount}</a>
          );
        },
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'inputAmountDifference',
        width: 120,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'inputTaxAmountDifference',
        width: 120,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'taxBearingTaxRate',
        width: 120,
        // footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'chainInvoiceTaxAmount',
        width: 120,
        // footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'chainDeductionTaxAmount',
        width: 120,
        // footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'chainInputAmountTaxDifference',
        width: 120,
        // footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
    ];
  }

  /**
   * 导出
   */
  @Bind()
  handleGetQueryParams() {
    const { queryDataSet } = this.props.listDS;
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
        <Header title={intl.get(`${modelCode}.view.title`).d('进销发票统计报表')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoice-pool-main/export-invoice`}
            queryParams={() => this.handleGetQueryParams()}
          />
        </Header>
        <Content>
          <Table dataSet={this.props.listDS} columns={this.columns} style={{ height: 400 }} />
        </Content>
      </>
    );
  }
}
