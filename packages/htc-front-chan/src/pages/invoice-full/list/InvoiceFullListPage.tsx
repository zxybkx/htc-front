import React, { Component } from 'react';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { ColumnLock, ColumnAlign, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import InvoiceFullListDS from '../stores/InvoiceFullListDS';

const modelCode = 'hcan.invoice-full';

interface InvoiceFullListPageProps {
  dispatch: Dispatch<any>;
  tableDS: DataSet;
}

@formatterCollections({
  code: [modelCode],
})
@withProps(
  () => {
    const tableDS = new DataSet({
      autoQuery: true,
      ...InvoiceFullListDS(),
    });
    return { tableDS };
  },
  { cacheState: true }
)
export default class InvoiceFullListPage extends Component<InvoiceFullListPageProps> {
  // tableDS = new DataSet({
  //   autoQuery: true,
  //   ...InvoiceFullListDS(),
  // });

  @Bind()
  handleGoToDetail(record) {
    const invoiceHeaderId = record.get('invoiceHeaderId');
    const invoiceType = record.get('invoiceType');
    const { dispatch } = this.props;
    const pathname = `/htc-front-chan/invoice-full/detail/${invoiceHeaderId}/${invoiceType}`;
    dispatch(
      routerRedux.push({
        pathname,
      })
    );
  }

  get columns(): ColumnProps[] {
    return [
      { name: 'invoiceHeaderId', renderer: ({ value }) => <span>{value}</span>, width: 80 },
      { name: 'checkCount', renderer: ({ value }) => <span>{value}</span> },
      { name: 'invoiceType', width: 160 },
      // { name: 'cancellationMark', width: 160 },
      { name: 'buyerName', width: 200 },
      { name: 'salerName', width: 200 },
      { name: 'invoiceCode', width: 120 },
      { name: 'invoiceNo', width: 120 },
      { name: 'invoiceDate', width: 120 },
      { name: 'checkCode', width: 200 },
      { name: 'invoiceAmount', width: 150, align: ColumnAlign.right },
      { name: 'taxAmount', width: 150, align: ColumnAlign.right },
      { name: 'totalAmount', width: 150, align: ColumnAlign.right },
      { name: 'ofdUrl', width: 200 },
      { name: 'createdName', width: 120 },
      { name: 'creationDate', width: 160 },
      { name: 'lastUpdatedName', width: 120 },
      { name: 'lastUpdateDate', width: 160 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 80,
        command: ({ record }): Commands[] => {
          return [
            <Button key="open" onClick={() => this.handleGoToDetail(record)}>
              <Icon type="add" />
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  render() {
    const buttons = [TableButtonType.delete];
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('发票全票面信息查询')} />
        <Content>
          <Table
            queryFieldsLimit={4}
            dataSet={this.props.tableDS}
            columns={this.columns}
            buttons={buttons}
          />
        </Content>
      </>
    );
  }
}
