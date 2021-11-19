/**
 * @Description:账单报表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-09-07 13:44:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { Dispatch } from 'redux';
import queryString from 'query-string';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import withProps from 'utils/withProps';
import { routerRedux } from 'dva/router';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { connect } from 'dva';
import notification from 'utils/notification';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { billInfomationDownload, sendEmail } from '@src/services/billStatementService';
import { getResponse } from 'utils/utils';
import BillStatementListDS from '../stores/BillStatementListDS';

const modelCode = 'hmdm.bill-statement';

interface BillStatementPageProps {
  dispatch: Dispatch<any>;
  tableDS: DataSet;
}

@connect()
@withProps(
  () => {
    const tableDS = new DataSet({
      autoQuery: true,
      ...BillStatementListDS(),
    });
    return { tableDS };
  },
  { cacheState: true }
)
export default class BillStatementPage extends Component<BillStatementPageProps> {
  @Bind()
  async generateBill(selectedList) {
    const res = getResponse(await billInfomationDownload(selectedList));
    if (res && res.status === 'H1014') {
      notification.success({
        description: '',
        message: intl.get(`${modelCode}.view.success`).d('操作成功!'),
      });
      this.props.tableDS.query();
    }
  }

  @Bind()
  handleGotoBillPage(fileUrl) {
    const { dispatch } = this.props;
    const pathname = '/htc-front-mdm/bill-statement/billViewPage';
    dispatch(
      routerRedux.push({
        pathname,
        search: queryString.stringify({
          fileUrlInfo: encodeURIComponent(JSON.stringify({ fileUrl })),
        }),
      })
    );
  }

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? record.index + 1 : '';
        },
      },
      {
        name: 'billNumber',
        width: 200,
        renderer: ({ record, value }) => {
          if (record) {
            if (record.get('fileUrl')) {
              return <a onClick={() => this.handleGotoBillPage(record.get('fileUrl'))}>{value}</a>;
            } else {
              return value;
            }
          }
        },
      },
      { name: 'tenantName' },
      { name: 'companyName', width: 250 },
      { name: 'billType' },
      { name: 'customerBillingModelCodeMeaning', width: 150 },
      { name: 'solutionPackageMeaning' },
      { name: 'expensesTypeMeaning', width: 150 },
      { name: 'annualFee' },
      { name: 'solutionPackageNumber' },
      { name: 'usedQuantity' },
      { name: 'remainingQuantity' },
      { name: 'unitPrice' },
      { name: 'excessUnitPrice' },
      { name: 'billingCode', width: 150 },
      { name: 'billingStartDate', width: 150 },
      { name: 'billingEndDate', width: 150 },
      { name: 'billingRule' },
      { name: 'invoiceMethodCode' },
      { name: 'lastUpdateDate' },
      { name: 'receiver' },
      { name: 'email', width: 220 },
      { name: 'phone' },
      { name: 'sendDate' },
      { name: 'expirationStatus' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        command: ({ record }): Commands[] => {
          const data = record.toData();
          return [
            <Button key="operation" onClick={() => this.generateBill([data])}>
              {intl.get('hzero.common.status.generateBill').d('生成账单')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  // 发送
  @Bind()
  async batchSend() {
    const selectedList = this.props.tableDS.selected.map((record) => record.toData());
    const res = getResponse(await sendEmail(selectedList));
    if (res && res.status === 'H1014') {
      notification.success({
        description: '',
        message: intl.get(`${modelCode}.view.success`).d('操作成功!'),
      });
      this.props.tableDS.unSelectAll();
    }
  }

  // 生成账单
  @Bind()
  async batchGenerateBill() {
    const selectedList = this.props.tableDS.selected.map((record) => record.toData());
    this.generateBill(selectedList);
  }

  get buttons(): Buttons[] {
    const BatchButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <BatchButtons
        key="batchSend"
        onClick={() => this.batchSend()}
        dataSet={this.props.tableDS}
        title={intl.get(`${modelCode}.batchSend`).d('发送')}
      />,
      <BatchButtons
        key="batchGenerateBill"
        onClick={() => this.batchGenerateBill()}
        dataSet={this.props.tableDS}
        title={intl.get(`${modelCode}.batchGenerateBill`).d('生成账单')}
      />,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('账单报表')} />
        <Content>
          <Table dataSet={this.props.tableDS} columns={this.columns} buttons={this.buttons} />
        </Content>
      </>
    );
  }
}
