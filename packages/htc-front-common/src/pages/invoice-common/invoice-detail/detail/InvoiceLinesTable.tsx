/*
 * @Descripttion:全发票明细行
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2021-03-05 14:16:46
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet, Table } from 'choerodon-ui/pro';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'utils/intl';

const modelCode = 'hcan.invoice-detail';

interface Props {
  dataSet: DataSet;
}
@formatterCollections({
  code: [modelCode],
})
export default class InvoiceLinesTable extends Component<Props> {
  childDS = this.props.dataSet;

  /**
   * 发票明细信息
   */
  get childColumns(): ColumnProps[] {
    return [
      {
        name: 'orderSeq',
        header: intl.get(`${modelCode}.view.orderSeq`).d('行号'),
        width: 80,
        renderer: ({ record }) => {
          return record ? this.childDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'detailNo' },
      { name: 'goodsName', width: 600 },
      { name: 'detailAmount', width: 160, align: ColumnAlign.right },
      { name: 'num', renderer: ({ value }) => <span>{value}</span> },
      { name: 'taxRate' },
      { name: 'taxAmount', align: ColumnAlign.right },
      { name: 'taxUnitPrice', align: ColumnAlign.right },
      { name: 'taxDetailAmount', width: 160, align: ColumnAlign.right },
      { name: 'unitPrice', align: ColumnAlign.right },
      { name: 'specificationModel' },
      { name: 'unit' },
      { name: 'expenseItem', width: 170 },
      { name: 'plateNo', width: 150 },
      { name: 'type', width: 130 },
      { name: 'trafficDateStart', width: 160 },
      { name: 'trafficDateEnd', width: 160 },
    ];
  }

  render() {
    return <Table dataSet={this.childDS} columns={this.childColumns} style={{ height: 300 }} />;
  }
}
