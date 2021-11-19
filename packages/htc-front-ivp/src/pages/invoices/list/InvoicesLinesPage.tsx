/*
 * @Description:
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-02-23 14:06:25
 * @LastEditTime: 2021-03-05 15:39:01
 * @Copyright: Copyright (c) 2020, Hand
 */
/**
 * @Descripttion:发票池-行
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2020-09-21 14:15:48
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Header, Content } from 'components/Page';
import { DataSet, Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import InvoicesLinesDS from '../stores/InvoicesLinesDS';

const modelCode = 'hivp.invoices';

interface RouterInfo {
  invoicePoolHeaderId: any;
}

interface InvoicesLinesPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [modelCode],
})
export default class InvoicesLinesPage extends Component<InvoicesLinesPageProps> {
  lineDS = new DataSet({
    autoQuery: true,
    ...InvoicesLinesDS(this.props.match.params.invoicePoolHeaderId),
  });

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('行号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? this.lineDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'goodsName', width: 600 },
      { name: 'specificationModel' },
      { name: 'unit' },
      { name: 'num', renderer: ({ value }) => <span>{value}</span> },
      { name: 'unitPrice', width: 150, align: ColumnAlign.right },
      { name: 'detailAmount', width: 150, align: ColumnAlign.right },
      { name: 'taxRate', width: 150, align: ColumnAlign.right },
      { name: 'taxAmount', width: 150, align: ColumnAlign.right },
      { name: 'expenseItem', width: 170 },
      { name: 'plateNo', width: 150 },
      { name: 'type', width: 130 },
      { name: 'trafficDateStart', width: 160 },
      { name: 'trafficDateEnd', width: 160 },
      { name: 'taxUnitPrice', width: 150, align: ColumnAlign.right },
      { name: 'taxDetailAmount', width: 150, align: ColumnAlign.right },
    ];
  }

  render() {
    return (
      <>
        <Header
          backPath="/htc-front-ivp/invoices/list"
          title={intl.get(`${modelCode}.lineTitle`).d('发票池行')}
        />
        <Content>
          <Table dataSet={this.lineDS} columns={this.columns} style={{ height: 500 }} />
        </Content>
      </>
    );
  }
}
