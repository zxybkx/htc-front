/*
 * @Description:票据池-行
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-21 17:30:52
 * @LastEditTime: 2021-03-05 15:32:50
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
import BillsLinesDS from '../stores/BillsLinesDS';

const modelCode = 'hivp.bills';

interface RouterInfo {
  billPoolHeaderId: any;
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
    ...BillsLinesDS(this.props.match.params.billPoolHeaderId),
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
      { name: 'quantity', renderer: ({ value }) => <span>{value}</span> },
      { name: 'unitPrice', align: ColumnAlign.right },
      { name: 'amount', align: ColumnAlign.right },
      { name: 'taxRate' },
      { name: 'taxAmount', align: ColumnAlign.right },
    ];
  }

  render() {
    return (
      <>
        <Header
          backPath="/htc-front-ivp/bills/list"
          title={intl.get(`${modelCode}.lineTitle`).d('票据池行')}
        />
        <Content>
          <Table dataSet={this.lineDS} columns={this.columns} style={{ height: 400 }} />
        </Content>
      </>
    );
  }
}
