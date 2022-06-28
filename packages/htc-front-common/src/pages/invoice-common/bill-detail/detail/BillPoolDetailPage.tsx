/**
 * @Description:票据池明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-14 15:05:58
 * @LastEditTime: 2021-03-05 14:28:16
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet, Form, Output, Spin, Table } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'utils/intl';
import BillsHeaderDetailDS from '../stores/BillsHeaderDetailDS';
import BillsLinesDS from '../stores/BillsLinesDS';

const modelCode = 'hivp.bill';
const { Panel } = Collapse;

interface BillPoolDetailPageProps {
  backPath: string;
  billPoolHeaderId: any;
}

@formatterCollections({
  code: [modelCode, 'htc.common'],
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
        header: intl.get('htc.common.orderSeq').d('行号'),
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
    const customPanelStyle = {
      background: '#fff',
      overflow: 'hidden',
      borderBottom: '8px solid #F6F6F6',
    };
    return (
      <>
        <Header
          title={intl.get(`${modelCode}.title.tpd`).d('票据池明细信息')}
          backPath={this.props.backPath}
        />
        <Content style={{ background: '#F6F6F6' }}>
          <Spin dataSet={this.detailDS}>
            <Collapse bordered={false} defaultActiveKey={['HEADER', 'LINES']}>
              <Panel
                header={intl.get(`${modelCode}.title.billHeader`).d('票据关键头信息')}
                key="HEADER"
                style={customPanelStyle}
              >
                <Form dataSet={this.detailDS} columns={3}>
                  <Output name="checkCode" />
                  <Output name="billType" />
                  <Output name="isInvoiceSeal" />
                  {/* --- */}
                  <Output name="invoiceCode" />
                  <Output name="invoiceNo" />
                  <Output name="invoiceDate" />
                  <Output name="drawer" />
                  <Output name="reviewer" />
                  {/* --- */}
                  <Output name="salerName" />
                  <Output name="salerAddressPhone" />
                  {/* --- */}
                  <Output name="salerTaxNo" />
                  <Output name="salerAccount" />
                  {/* --- */}
                  <Output name="buyerName" />
                  <Output name="buyerAddressPhone" />
                  {/* --- */}
                  <Output name="buyerTaxNo" />
                  <Output name="buyerAccount" />
                  {/* --- */}
                  <Output name="orderProcessNumber" />
                  <Output name="paymentSerialNumber" />
                  <Output name="invoiceAmount" />
                  <Output name="taxAmount" />
                  <Output name="totalAmount" />
                  <Output name="fare" />
                  <Output name="aviationDevelopmentFund" />
                  <Output name="fuelSurcharge" />
                  <Output name="otherTaxes" />
                  <Output name="total" />
                  <Output name="platformCode" />
                  <Output name="platformName" />
                  <Output name="entrance" />
                  <Output name="destination" />
                  <Output name="trainAndFlight" />
                  <Output name="seatType" />
                  <Output name="boardingTime" />
                  <Output name="alightingTime" />
                  <Output name="mileage" />
                  <Output name="zeroTaxRateFlag" />
                  <Output name="electronicPaymentFlag" />
                  <Output name="remark" />
                </Form>
              </Panel>
              <Panel
                style={customPanelStyle}
                header={intl.get(`${modelCode}.view.linesTitle`).d('票据池行')}
                key="LINES"
              >
                <Table dataSet={this.linesDS} columns={this.lineColumns} style={{ height: 300 }} />;
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </>
    );
  }
}
