/**
 * @Description: 销项开票关联表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-09-01 14:08
 * @LastEditTime:
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Content, Header } from 'components/Page';
import { DataSet, Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { getCurrentOrganizationId } from 'utils/utils';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import InvoiceAssociationTableDS from '../stores/InvoiceAssociationTableDS';

const tenantId = getCurrentOrganizationId();

@formatterCollections({
  code: ['htc.common', 'hiop.taxRateStatistic', 'hiop.invoiceWorkbench'],
})
export default class InvoiceAssociationTable extends Component {
  invoiceAssociationTable = new DataSet({
    autoQuery: false,
    ...InvoiceAssociationTableDS(),
  });

  async componentDidMount() {
    const { queryDataSet } = this.invoiceAssociationTable;
    const res = await getCurrentEmployeeInfoOut({ tenantId });
    if (res && res.content) {
      const empInfo = res.content[0];
      if (empInfo && queryDataSet) {
        queryDataSet.current!.set({ companyObj: empInfo });
      }
    }
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? record.index + 1 : '';
        },
      },
      { name: 'orderNumber' },
      { name: 'orderStatus' },
      { name: 'billingType' },
      { name: 'invoiceCode' },
      { name: 'invoiceNo' },
      { name: 'invoiceDate' },
      { name: 'yinvoiceCode' },
      { name: 'yinvoiceNo' },
      { name: 'ddhsje', width: 110 },
      { name: 'ddbhsje', width: 120 },
      { name: 'ddse' },
      { name: 'fphsje', width: 110 },
      { name: 'fpbhsje', width: 120 },
      { name: 'fpse' },
      { name: 'invoiceAmountDifference' },
      { name: 'requestNumber' },
      { name: 'requestStatus' },
      { name: 'sqdhsje', width: 120 },
      { name: 'sqdbhsje', width: 130 },
      { name: 'sqdse' },
      { name: 'dkplydjh', width: 130 },
      { name: 'sourceLineNumber', width: 120 },
      { name: 'state', width: 120 },
      { name: 'sssqhsje', width: 130 },
      { name: 'sssqbhsje', width: 140 },
      { name: 'sssqse', width: 110 },
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get('hiop.statisticsTable.title').d('销项开票关联表')} />
        <Content>
          <Table
            dataSet={this.invoiceAssociationTable}
            columns={this.columns}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
