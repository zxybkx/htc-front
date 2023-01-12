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
import queryString from 'query-string';
import { openTab } from 'utils/menuTab';
import { Content, Header } from 'components/Page';
import { DataSet, Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { getCurrentOrganizationId } from 'utils/utils';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import InvoiceAssociationTableDS from '../stores/InvoiceAssociationTableDS';

const tenantId = getCurrentOrganizationId();

@formatterCollections({
  code: [
    'htc.common',
    'hiop.taxRateStatistic',
    'hiop.invoiceWorkbench',
    'hiop.invoiceAssociationTable',
  ],
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
      if (empInfo && queryDataSet && queryDataSet.current) {
        queryDataSet.current.set({ companyObj: empInfo });
      }
    }
  }

  viewDetail(record, type) {
    const billFlag = record.get('billFlag');
    const companyId = record.get('companyId');
    const invoicingOrderHeaderId = record.get('invoicingOrderHeaderId');
    const headerId = record.get('headerId');
    const sourceHeadNumber = record.get('sourceHeadNumber');
    switch (type) {
      case 0:
        openTab({
          key: `/htc-front-iop/invoice-workbench/edit/likeOrder/${companyId}/${invoicingOrderHeaderId}`,
          path: `/htc-front-iop/invoice-workbench/edit/likeOrder/${companyId}/${invoicingOrderHeaderId}`,
          title: intl.get('hiop.invoiceWorkbench.title.invoiceOrder').d('开票订单'),
          closable: true,
        });
        break;
      case 1:
        openTab({
          key: `/htc-front-iop/invoice-req/detail/${companyId}/${headerId}/${billFlag}`,
          path: `/htc-front-iop/invoice-req/detail/${companyId}/${headerId}/${billFlag}`,
          title: intl.get('hiop.invoiceReq.title.billApply').d('开票申请单'),
          closable: true,
        });
        break;
      case 2:
        openTab({
          key: '/htc-front-iop/tobe-invoice/list',
          path: '/htc-front-iop/tobe-invoice/list',
          title: intl.get('hiop.tobeInvoice.title.tobeInvoice').d('待开票数据勾选'),
          search: queryString.stringify({
            invoiceInfo: encodeURIComponent(
              JSON.stringify({
                sourceHeadNumber,
                companyId,
              })
            ),
          }),
        });
        break;
      default:
        break;
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
      { name: 'companyName', width: 210 },
      {
        name: 'orderNumber',
        width: 240,
        renderer: ({ value, record }) => <a onClick={() => this.viewDetail(record, 0)}>{value}</a>,
      },
      { name: 'billingType' },
      { name: 'invoiceVariety' },
      { name: 'fullElectricInvoiceNo', width: 130 },
      { name: 'invoiceCode', width: 130 },
      { name: 'invoiceNo' },
      { name: 'buyerName', width: 210 },
      { name: 'sellerName', width: 210 },
      { name: 'invoiceSourceOrder', width: 210 },
      { name: 'invoiceSourceFlag', width: 210 },
      { name: 'invoiceDate', width: 150 },
      { name: 'blueInvoiceCode', width: 130 },
      { name: 'blueInvoiceNo', width: 110 },
      { name: 'invoiceTotalPriceTaxAmount', width: 110 },
      { name: 'invoiceExcludeTaxAmount', width: 120 },
      { name: 'invoiceTotalTax' },
      { name: 'totalPriceTaxAmount', width: 110 },
      { name: 'totalExcludingTaxAmount', width: 120 },
      { name: 'totalTax' },
      { name: 'invoiceAmountDifference' },
      {
        name: 'requestNumber',
        width: 230,
        renderer: ({ value, record }) => <a onClick={() => this.viewDetail(record, 1)}>{value}</a>,
      },
      { name: 'requisitionTotalPriceTaxAmount', width: 120 },
      { name: 'requisitionExcludingTaxAmount', width: 130 },
      { name: 'totalAmount' },
      {
        name: 'sourceNumber',
        width: 230,
        renderer: ({ value, record }) => {
          const reg = new RegExp(/^R/i);
          if (value && reg.test(value)) {
            return <a onClick={() => this.viewDetail(record, 1)}>{value}</a>;
          } else {
            return value;
          }
        },
      },
      { name: 'sourceNumber1', width: 130 },
      { name: 'sourceNumber2', width: 130 },
      {
        name: 'sourceHeadNumber',
        width: 130,
        renderer: ({ value, record }) => <a onClick={() => this.viewDetail(record, 2)}>{value}</a>,
      },
      { name: 'sourceLineNumber', width: 120 },
      { name: 'prepareTotalPriceTaxAmount', width: 130 },
      { name: 'prepareExcludingTaxAmount', width: 140 },
      { name: 'utaxAmount', width: 110 },
      { name: 'batchNo', width: 110 },
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get('hiop.invoiceAssociationTable.title').d('销项开票关联表')} />
        <Content>
          <Table
            customizable
            customizedCode="customized"
            queryFieldsLimit={4}
            dataSet={this.invoiceAssociationTable}
            columns={this.columns}
            style={{ height: 440 }}
          />
        </Content>
      </>
    );
  }
}
