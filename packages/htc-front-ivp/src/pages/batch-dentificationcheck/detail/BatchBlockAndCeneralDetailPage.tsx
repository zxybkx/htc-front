/**
 * @Description:全发票明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-14 15:05:58
 * @LastEditTime: 2021-01-28 10:53:59
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Content, Header } from 'components/Page';
import { Dispatch } from 'redux';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Collapse } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import {
  Button,
  Currency,
  DataSet,
  DatePicker,
  Form,
  Select,
  Spin,
  Table,
  TextField,
  DateTimePicker,
} from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import BillsLinesDS from '../stores/BillLineDetailDS';
import BillsHeaderDetailDS from '../stores/BillsHeaderDetailDS';

const modelCode = 'hivp.billDetail';
const { Panel } = Collapse;

interface RouterInfo {
  billPoolHeaderId: any;
  billType: string;
}

interface BillPoolDetailPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
@formatterCollections({
  code: [modelCode, 'htc.common', 'hcan.invoiceDetail', 'hivp.bill', 'hivp.batchCheck'],
})
export default class BatchBlockAndCeneralDetailPage extends Component<BillPoolDetailPageProps> {
  // 行DS
  linesDS = new DataSet({
    autoQuery: false,
    ...BillsLinesDS(),
  });

  // 明细DS
  detailDS = new DataSet({
    autoQuery: true,
    ...BillsHeaderDetailDS(this.props.match.params),
    children: {
      lineList: this.linesDS,
    },
  });

  /**
   * 发票明细信息
   */
  get lineColumns(): ColumnProps[] {
    return [
      {
        header: intl.get('hcan.invoiceDetail.view.orderSeq').d('行号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? this.linesDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'goodsName', width: 600, editor: true },
      { name: 'specificationModel', editor: true },
      { name: 'unit', editor: true },
      { name: 'quantity', editor: true },
      { name: 'unitPrice', editor: true },
      { name: 'amount' },
      { name: 'taxRate', editor: true },
      { name: 'taxAmount' },
    ];
  }

  @Bind()
  handleSave() {
    const invoiceAmount = this.detailDS.current!.get('amount');
    const invoiceType = this.detailDS.current!.get('invoiceType');
    const judgeLength = this.linesDS.length < 1;
    if (invoiceType === 'GENERAL_MACHINE_INVOICE' && judgeLength) {
      this.detailDS.submit();
    } else {
      let totalAmount = 0;
      for (const element of this.linesDS.toData()) {
        const { amount }: any = element;
        if (amount === undefined) {
          return;
        }
        totalAmount += amount;
      }
      if (totalAmount !== invoiceAmount) {
        notification.error({
          description: '',
          message: intl.get(`${modelCode}.notice.error`).d('⾏⾦额总额和头不含税⾦额不相等!'),
        });
      } else {
        this.detailDS.submit();
      }
    }
  }

  render() {
    return (
      <>
        <Header
          title={intl.get('hivp.bill.title.tpd').d('票据池明细信息')}
          backPath="/htc-front-ivp/batch-check/list"
        >
          <Button onClick={() => this.handleSave()} color={ButtonColor.primary}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin dataSet={this.detailDS}>
            <Collapse bordered={false} defaultActiveKey={['HEADER', 'LINES']}>
              <Panel
                header={intl.get('hivp.bill.title.billHeader').d('票据关键头信息')}
                key="HEADER"
              >
                <Form dataSet={this.detailDS} columns={6} labelTooltip={Tooltip.overflow}>
                  <TextField name="checkCode" colSpan={2} />
                  <Select name="invoiceType" colSpan={2} />
                  <TextField name="isInvoiceSeal" colSpan={2} />
                  {/* --- */}
                  <TextField name="invoiceCode" colSpan={2} />
                  <TextField name="invoiceNumber" colSpan={1} />
                  <DatePicker name="invoiceDate" colSpan={1} />
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
                  <Currency name="amount" colSpan={2} />
                  <Currency name="taxAmount" colSpan={2} />
                  <Currency name="totalAmount" colSpan={2} />
                  <Currency name="fare" colSpan={2} />
                  <Currency name="aviationDevelopmentFund" colSpan={2} />
                  <Currency name="fuelSurcharge" colSpan={2} />
                  <Currency name="otherTaxes" colSpan={2} />
                  <Currency name="total" colSpan={2} />
                  <TextField name="platformCode" colSpan={2} />
                  <TextField name="platformName" colSpan={2} />
                  <TextField name="entrance" colSpan={2} />
                  <TextField name="destination" colSpan={2} />
                  <TextField name="trainAndFlight" colSpan={1} />
                  <TextField name="seatType" colSpan={1} />
                  <DateTimePicker name="boardingTime" colSpan={2} />
                  <DateTimePicker name="alightingTime" colSpan={2} />
                  <TextField name="mileage" />
                  <Select name="zeroTaxRateFlag" colSpan={1} />
                  <TextField name="electronicPaymentFlag" />
                  <TextField name="remark" colSpan={6} newLine />
                </Form>
              </Panel>
              <Panel header={intl.get('hivp.bill.linesTitle').d('票据池行')} key="LINES">
                <Table dataSet={this.linesDS} columns={this.lineColumns} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </>
    );
  }
}
