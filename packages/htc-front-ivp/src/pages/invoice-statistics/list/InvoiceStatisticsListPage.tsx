/*
 * @Description: 进销发票统计报表
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-11-03 16:12:58
 * @LastEditTime: 2022-11-15 10:03:42
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import withProps from 'utils/withProps';
import { DataSet, Table, TextField } from 'choerodon-ui/pro';
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

enum DetailType {
  trueInvoiceAmount = 1,
  trueTaxAmount = 2,
  checkDeductionAmount = 3,
  checkDeductionTaxAmount = 4,
  fillingDeductionTaxAmount = 5,
  fillingDeductionAmount = 6,
  totalDeductionAmount = 7,
  totalDeductionTaxAmount = 8,
  inputTaxTransferAmount = 9,
  inputTaxTransferTaxAmount = 10,
}
interface InvoiceStatisticsPageProps extends RouteComponentProps {
  listDS: DataSet;
}

@formatterCollections({
  code: [modelCode, 'htc.common', 'hivp.invoices'],
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
  handleGotoDetailTablePage(record, name) {
    const { history, listDS } = this.props;
    const { queryDataSet } = listDS;
    const { tenantObject, companyObj, ...otherParms } =
      queryDataSet && queryDataSet.current?.toData();
    history.push({
      pathname: '/htc-front-ivp/invoice-statistics/detail',
      state: {
        ...otherParms,
        ...record.toData(),
        dataInfo: String(DetailType[name]),
      },
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

  @Bind()
  renderAmount(value, text, record, name) {
    if (value === 0) {
      return text;
    } else {
      return <a onClick={() => this.handleGotoDetailTablePage(record, name)}>{text}</a>;
    }
  }

  get columns(): ColumnProps[] {
    return [
      {
        name: 'year',
        footer: () => `${intl.get('hivp.invoices.view.total').d('合计')}`,
      },
      {
        name: 'mouth',
      },
      {
        name: 'trueInvoiceAmount',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'trueTaxAmount',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'unInvoiceIncomeAmount',
        width: 120,
        editor: <TextField onBlur={() => this.props.listDS.submit()} />,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'unInvoiceIncomeTaxAmount',
        width: 120,
        editor: <TextField onBlur={() => this.props.listDS.submit()} />,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'adjustIncomeAmount',
        width: 120,
        editor: <TextField onBlur={() => this.props.listDS.submit()} />,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'adjustIncomeTaxAmount',
        width: 120,
        editor: <TextField onBlur={() => this.props.listDS.submit()} />,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'checkDeductionAmount',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'checkDeductionTaxAmount',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'fillingDeductionTaxAmount',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'fillingDeductionAmount',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'inputTaxTransferAmount',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'inputTaxTransferTaxAmount',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'totalDeductionAmount',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'totalDeductionTaxAmount',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
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
            requestUrl={`${API_PREFIX}/v1/${tenantId}/in-out-invoice/export-all`}
            queryParams={() => this.handleGetQueryParams()}
          />
        </Header>
        <Content>
          <Table dataSet={this.props.listDS} columns={this.columns} style={{ height: 500 }} />
        </Content>
      </>
    );
  }
}
