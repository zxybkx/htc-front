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
import InvoiceChildSwitchPage from '@src/utils/invoiceChildSwitch/invoiceChildSwitchPage';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { Collapse } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
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
  code: [modelCode, 'hivp.bill', 'htc.common'],
})
export default class BillDetailPage extends Component<BillPoolDetailPageProps> {
  state = { billType: '' };

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
      billLinesInfoList: this.linesDS,
    },
  });

  componentDidMount(): void {
    const { billType } = this.props.match.params;
    this.setState({ billType });
  }

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

  get buttons(): Buttons[] {
    const { billType } = this.state;
    if (['BLOCK_CHAIN', 'GENERAL_MACHINE_INVOICE'].includes(billType)) {
      return [TableButtonType.add, TableButtonType.delete];
    } else {
      return [];
    }
  }

  @Bind()
  handleSave() {
    const { billType } = this.state;
    const judgeLength = this.linesDS.length > 0;
    if (billType === 'BLOCK_CHAIN' || (billType === 'GENERAL_MACHINE_INVOICE' && judgeLength)) {
      const invoiceAmount = this.detailDS.current!.get('invoiceAmount');
      let totalAmount = 0;
      for (let i = 0; i < this.linesDS.toData().length; i++) {
        const { amount }: any = this.linesDS.toData()[i];
        if (amount === undefined) {
          return;
        }
        totalAmount += amount;
      }
      if (totalAmount !== invoiceAmount) {
        notification.error({
          description: '',
          message: intl
            .get(`${modelCode}.notification.amountInvalid`)
            .d('⾏⾦额总额和头不含税⾦额不相等!'),
        });
      } else {
        this.detailDS.submit();
      }
    } else {
      this.detailDS.submit();
    }
  }

  render() {
    const state = window.dvaApp._store.getState();
    const { global } = state;
    const { activeTabKey } = global;
    const subTabKey = activeTabKey.substr(15); // 获取当前子标签
    const backPath =
      subTabKey === 'my-invoice' ? '/htc-front-ivp/my-invoice/list' : '/htc-front-ivp/bills/list';
    return (
      <>
        <Header
          title={intl.get(`${modelCode}.title.detail`).d('票据池明细信息')}
          backPath={backPath}
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
                  <Select
                    name="billType"
                    colSpan={2}
                    onChange={(value) => this.setState({ billType: value })}
                  />
                  <TextField name="isInvoiceSeal" colSpan={2} />
                  {/* --- */}
                  <TextField name="invoiceCode" colSpan={2} />
                  <TextField name="invoiceNo" colSpan={1} />
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
                  <Currency name="invoiceAmount" colSpan={2} />
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
              <Panel header={intl.get('hivp.bill.view.LinesTitle').d('票据池行')} key="LINES">
                <Table buttons={this.buttons} dataSet={this.linesDS} columns={this.lineColumns} />
              </Panel>
            </Collapse>
          </Spin>
          <InvoiceChildSwitchPage type={0} />
        </Content>
      </>
    );
  }
}
