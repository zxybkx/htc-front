/*
 * @Descripttion:票据池明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-14 15:05:58
 * @LastEditTime: 2021-03-05 14:28:16
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
// import { RouteComponentProps } from 'react-router-dom';
// import { Dispatch } from 'redux';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet, Spin, Table, Form, TextField, Select, Currency } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'utils/intl';
import BillsHeaderDetailDS from '../stores/BillsHeaderDetailDS';
import BillsLinesDS from '../stores/BillsLinesDS';
// import InvoiceDetailPage from '@common/pages/invoice-common/invoice-detail/detail/InvoiceDetailPage';

const modelCode = 'hivp.bill-detail';
const { Panel } = Collapse;

interface BillPoolDetailPageProps {
  backPath: string;
  billPoolHeaderId: any;
}

@formatterCollections({
  code: [modelCode],
})
export default class BillPoolDetailPage extends Component<BillPoolDetailPageProps> {
  // 行DS
  linesDS = new DataSet({
    autoQuery: false,
    ...BillsLinesDS(),
  });

  // 明细DS
  detailDS = new DataSet({
    autoQuery: true,
    ...BillsHeaderDetailDS(this.props.billPoolHeaderId),
    children: {
      billLinesInfoList: this.linesDS,
    },
  });

  /**
   * 发票明细信息
   */
  get lineColumns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('行号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? this.linesDS.indexOf(record) + 1 : '';
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
          title={intl.get(`${modelCode}.title.detail`).d('票据池明细信息')}
          backPath={this.props.backPath}
        />
        <Content>
          <Spin dataSet={this.detailDS}>
            <Collapse bordered={false} defaultActiveKey={['HEADER', 'LINES']}>
              <Panel
                header={intl.get(`${modelCode}.title.billHeader`).d('票据关键头信息')}
                key="HEADER"
              >
                <Form dataSet={this.detailDS} columns={6}>
                  <TextField name="checkCode" colSpan={2} />
                  <Select name="billType" colSpan={2} />
                  <TextField name="isInvoiceSeal" colSpan={2} />
                  {/* --- */}
                  <TextField name="invoiceCode" colSpan={2} />
                  <TextField name="invoiceNo" colSpan={1} />
                  <TextField name="invoiceDate" colSpan={1} />
                  <TextField name="drawer" colSpan={1} />
                  <TextField name="reviewer" colSpan={1} />
                  {/* --- */}
                  <TextField name="salerName" colSpan={2} />
                  <TextField name="salerAddressPhone" colSpan={4} />
                  {/* --- */}
                  <TextField name="salerTaxNo" colSpan={2} />
                  <TextField name="salerAccount" colSpan={4} />
                  {/* --- */}
                  <TextField name="buyerName" colSpan={2} />
                  <TextField name="buyerAddressPhone" colSpan={4} />
                  {/* --- */}
                  <TextField name="buyerTaxNo" colSpan={2} />
                  <TextField name="buyerAccount" colSpan={4} />
                  {/* --- */}
                  <TextField name="orderProcessNumber" colSpan={2} />
                  <TextField name="paymentSerialNumber" colSpan={2} />
                  <Currency name="invoiceAmount" colSpan={2} />
                  <TextField name="taxAmount" colSpan={2} />
                  <Currency name="totalAmount" colSpan={2} />
                  <Currency name="aviationDevelopmentFund" colSpan={2} />
                  <TextField name="platformCode" colSpan={2} />
                  <TextField name="platformName" colSpan={2} />
                  <TextField name="entrance" colSpan={2} />
                  <TextField name="destination" colSpan={2} />
                  <TextField name="trainAndFlight" colSpan={1} />
                  <TextField name="seatType" colSpan={1} />
                  <TextField name="boardingTime" colSpan={2} />
                  <TextField name="alightingTime" colSpan={2} />
                  <TextField name="mileage" />
                  <Select name="zeroTaxRateFlag" colSpan={1} />
                  <TextField name="electronicPaymentFlag" />
                  <TextField name="remark" colSpan={6} newLine />
                </Form>
              </Panel>
              <Panel header={intl.get(`${modelCode}.view.LinesTitle`).d('票据池行')} key="LINES">
                <Table dataSet={this.linesDS} columns={this.lineColumns} style={{ height: 300 }} />;
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </>
    );
  }
}
