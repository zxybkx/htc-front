/**
 * @Description: 租户协议维护详情
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-09
 * @LastEditeTime: 2021-06-10
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import { connect } from 'dva';
import { Button, DataSet, Form, message, Modal, Output, Spin, Table } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { TabsType } from 'choerodon-ui/lib/tabs/enum';
import { ColumnAlign, ColumnLock, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Dispatch } from 'redux';
import intl from 'utils/intl';
import { deviceStatusQuery, refreshToken } from '@src/services/companyListService';
import agreementClauseDS from '../stores/AgreementClauseDS';
import companyInfoDS from '../stores/CompanyInfoDS';
import companyProtocolDS from '../stores/CompanyProtocolDS';
import agreementDetailDS from '../stores/AgreementDetailDS';
import billInfoDS from '../stores/BillInfoDS';

const modelCode = 'hpln.index-plan';
const { TabPane } = Tabs;

interface RouterInfo {
  agreementId: any;
  tenantId: any;
}

interface Props extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

// 定义 State 类型
interface State {
  planStatus: string;
}

@connect()
export default class TenantAgreementDetailPage extends Component<Props, State> {
  // 公司信息-公司协议
  companyProtocolDS = new DataSet({
    autoQuery: false,
    ...companyProtocolDS(this.props.match.params.tenantId),
  });

  // 公司信息
  companyInfoColDS = new DataSet({
    autoQuery: false,
    ...companyInfoDS(this.props.match.params.tenantId, this.props.match.params.agreementId),
    children: {
      companyProtocolList: this.companyProtocolDS,
    },
  });

  // 账单信息
  billInfo = new DataSet({
    autoQuery: false,
    ...billInfoDS(this.props.match.params.tenantId),
  });

  // 协议条款
  agreementClauseColDS = new DataSet({
    autoQuery: false,
    ...agreementClauseDS(this.props.match.params.agreementId, this.props.match.params.tenantId),
    children: {
      companyInfoList: this.companyInfoColDS,
    },
  });

  detailDS = new DataSet({
    autoQuery: false,
    ...agreementDetailDS(this.props.match.params.agreementId),
  });

  async componentDidMount() {
    await this.refreshPage();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.match.params.agreementId &&
      prevProps.match.params.agreementId !== this.props.match.params.agreementId
    ) {
      this.refreshPage();
    }
  }

  /**
   * 刷新页面
   */
  @Bind()
  async refreshPage() {
    const { agreementId } = this.props.match.params;
    this.detailDS.queryParameter = { agreementId };
    this.agreementClauseColDS.queryParameter = { agreementId };
    this.companyInfoColDS.queryParameter = { agreementId };
    await this.detailDS.query();
    await this.agreementClauseColDS.query();
    // await this.companyInfoColDS.query();
    await this.billInfo.query();
  }

  /**
   * [协议条款]列信息列
   */
  get clauseColumns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 80,
        renderer: ({ record }) => {
          return record ? this.agreementClauseColDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'expensesTypeObject', width: 150, editor: true },
      { name: 'expensesTypeMeaning', width: 150 },
      { name: 'solutionPackage', width: 150, editor: true },
      { name: 'solutionPackageNumber', editor: true },
      { name: 'unitPrice', editor: true },
      { name: 'annualFee', editor: true },
      { name: 'excessUnitPrice', editor: true },
      { name: 'billingCode', width: 150, editor: true },
      { name: 'termDescription', width: 150, editor: true },
      { name: 'customerBillingModelCode', width: 150, editor: true },
      { name: 'billingStartDate', width: 160, editor: true },
      { name: 'billingEndDate', width: 160, editor: true },
      // {
      //   name: 'billingPrice',
      //   width: 150,
      //   editor: true,
      //   renderer: ({ value }) => numberRender(value, 4),
      // },
      { name: 'billingRule', width: 150, editor: true },
      { name: 'invoiceMethodCode', width: 150, editor: true },
      { name: 'enabledFlag', width: 150, editor: true },
    ];
  }

  /**
   * 令牌刷新
   * @params {object} record-行记录
   */
  @Bind()
  async handleRefreshToken(record) {
    const res = await refreshToken({
      tenantId: record.get('tenantId'),
      companyCode: record.get('companyCode'),
    });
    message.info(`${intl.get(`${modelCode}.button.refToken`).d('令牌刷新')}:${res}`);
  }

  /**
   * 设备在线查询
   * @params {object} record-行记录
   */
  @Bind()
  async handleDeviceStatusQuery(record) {
    const { tenantId, companyCode } = record.toData();
    const params = {
      tenantId,
      companyCode,
      deviceOnlineStatus: {
        taxpayerNumber: '',
        extNumber: '',
      },
    };
    const res = await deviceStatusQuery(params);
    if (res) {
      let showContent = <p>{res.message}</p>;
      if (res.status === '1000') {
        showContent = (
          <span>
            {res.data.map((data) => (
              <p>
                {intl.get(`${modelCode}.view.extNumber`).d('分机号：')}
                {data.extNumber}&nbsp;&nbsp;&nbsp;
                {intl.get(`${modelCode}.view.deviceStatus`).d('在线状态：')}
                {data.deviceStatus}
              </p>
            ))}
          </span>
        );
      }
      Modal.info({
        title: intl.get(`${modelCode}.view.deviceStatusQuery`).d('设备在线查询'),
        children: showContent,
      });
    }
  }

  /**
   * [公司信息]列信息列
   */
  get companyInfoColumns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 80,
        renderer: ({ record }) => {
          return record ? this.companyInfoColDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'registrationCode', width: 150, editor: true },
      {
        name: 'companyObject',
        width: 150,
        editor: (record) => !record.get('agreementCompanyId'),
      },
      { name: 'companyName', width: 150 },
      { name: 'administrator', width: 150, editor: true },
      { name: 'administratorMailbox', width: 150, editor: true },
      { name: 'administratorPhone', width: 150, editor: true },
      { name: 'enterpriseAlipayAccount', width: 150, editor: true },
      { name: 'checkChannelCode', width: 150, editor: true },
      { name: 'inChannelCode', width: 150, editor: true },
      { name: 'preferOcrChannelCode', width: 160, editor: true },
      { name: 'retryOcrChannelCode', width: 160, editor: true },
      { name: 'accountNumber', width: 300, editor: true },
      { name: 'ocrPassword', width: 300, editor: true },
      { name: 'outChannelCode', width: 150, editor: true },
      { name: 'outChannelModeCode', width: 200, editor: true },
      { name: 'authorizationStartDate', width: 160, editor: true },
      { name: 'authorizationTypeCode', width: 160, editor: true },
      { name: 'authorizationEndDate', width: 150, editor: true },
      { name: 'authorizationCode', width: 150, editor: true },
      { name: 'currentToken', width: 150, editor: true },
      { name: 'tokenGenerationDate', width: 150, editor: true },
      { name: 'authorizationOutputCode', width: 150 },
      { name: 'enabledFlag', width: 90, editor: true },
      { name: 'receicingBalance', width: 150, editor: true },
      { name: 'remark', width: 150, editor: true },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 240,
        command: ({ record }): Commands[] => {
          const disabledFlag = !record.get('agreementCompanyId');
          return [
            <Button
              key="refToken"
              onClick={() => this.handleRefreshToken(record)}
              disabled={disabledFlag}
            >
              {intl.get(`${modelCode}.button.refToken`).d('令牌刷新')}
            </Button>,
            <Button
              key="deviceStatusQuery"
              onClick={() => this.handleDeviceStatusQuery(record)}
              disabled={disabledFlag}
            >
              {intl.get(`${modelCode}.button.deviceStatusQuery`).d('设备在线查询')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * [公司信息]公司协议列
   */
  get companyProtocolColumns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 80,
        renderer: ({ record }) => {
          return record ? this.companyProtocolDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'companyCode' },
      { name: 'expensesTypeObject', width: 150, editor: true },
      { name: 'expensesTypeMeaning', width: 150 },
      { name: 'solutionPackage', width: 150, editor: true },
      { name: 'solutionPackageNumber', editor: true },
      { name: 'unitPrice', editor: true },
      { name: 'annualFee', editor: true },
      { name: 'excessUnitPrice', editor: true },
      { name: 'billingCode', width: 150, editor: true },
      { name: 'termDescription', width: 150, editor: true },
      { name: 'customerBillingModelCode', width: 150, editor: true },
      { name: 'billingStartDate', width: 160, editor: true },
      { name: 'billingEndDate', width: 160, editor: true },
      // {
      //   name: 'billingPrice',
      //   width: 150,
      //   editor: true,
      //   renderer: ({ value }) => numberRender(value, 4),
      // },
      { name: 'billingRule', width: 150, editor: true },
      { name: 'invoiceMethodCode', width: 150, editor: true },
      { name: 'enabledFlag', width: 150, editor: true },
    ];
  }

  /**
   * [账单信息]列
   */
  get billInfoColumns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 80,
        renderer: ({ record }) => {
          return record ? this.billInfo.indexOf(record) + 1 : '';
        },
      },
      { name: 'billNumber', width: 150 },
      { name: 'companyNameObject', width: 150, editor: true },
      { name: 'companyName', width: 150 },
      { name: 'billType', editor: true },
      { name: 'billPhyletic', editor: true },
      { name: 'creationDate', width: 180, editor: true },
      { name: 'receiver', width: 120, editor: true },
      { name: 'email', editor: true, width: 180 },
      { name: 'phone', editor: true, width: 150 },
      { name: 'sendDate', editor: true, width: 150 },
      { name: 'billRecordStart', editor: true, width: 150 },
      { name: 'billRecordEnd', editor: true, width: 160 },
      // {
      //   name: 'operation',
      //   header: intl.get('hzero.common.action').d('操作'),
      //   width: 120,
      //   command: (): Commands[] => {
      //     return [
      //       <Button key="createBill" onClick={() => this.handleCreateBill()}>
      //         {intl.get(`${modelCode}.button.refToken`).d('生成账单')}
      //       </Button>,
      //     ];
      //   },
      //   lock: ColumnLock.right,
      //   align: ColumnAlign.center,
      // },
    ];
  }

  /**
   * [协议条款]返回表格操作按钮组
   * @returns {*[]}
   */
  get clauseButt(): Buttons[] {
    return [TableButtonType.add, TableButtonType.save, TableButtonType.delete];
  }

  /**
   * [公司信息-头]返回表格操作按钮组
   * @returns {*[]}
   */
  get companyButt(): Buttons[] {
    return [TableButtonType.add, TableButtonType.save, TableButtonType.delete];
  }

  /**
   * 新增公司协议行
   */
  @Bind()
  handleAddLine() {
    const agreementCompanyId = this.companyInfoColDS.current!.get('agreementCompanyId');
    this.companyProtocolDS.create({ agreementCompanyId }, 0);
  }

  /**
   * [公司信息-公司协议]返回表格操作按钮组
   * @returns {*[]}
   */
  get companyProtocolButt(): Buttons[] {
    return [
      <Button icon="playlist_add" key="add" onClick={() => this.handleAddLine()}>
        {intl.get('hzero.common.button.add ').d('新增')}
      </Button>,
      TableButtonType.save,
      TableButtonType.delete,
    ];
  }

  /**
   * [账单信息]返回表格操作按钮组
   * @returns {*[]}
   */
  get billInfoButt(): Buttons[] {
    return [TableButtonType.add, TableButtonType.save, TableButtonType.delete];
  }

  render() {
    return (
      <>
        <Header
          title={intl.get(`${modelCode}.title`).d('详细信息')}
          backPath="/htc-front-mdm/tenant-agreement/list"
        />
        <Content>
          <Spin dataSet={this.detailDS}>
            <Form dataSet={this.detailDS} columns={3}>
              <Output name="tenantId" />
              <Output name="tenantName" />
              <Output name="customerName" />
            </Form>
          </Spin>
          <Tabs type={TabsType.card}>
            <TabPane tab="协议条款" key="clause">
              <Table
                dataSet={this.agreementClauseColDS}
                columns={this.clauseColumns}
                buttons={this.clauseButt}
              />
            </TabPane>
            <TabPane tab="公司信息" key="company">
              <Table
                dataSet={this.companyInfoColDS}
                columns={this.companyInfoColumns}
                buttons={this.companyButt}
              />
              <Table
                dataSet={this.companyProtocolDS}
                columns={this.companyProtocolColumns}
                buttons={this.companyProtocolButt}
              />
            </TabPane>
            <TabPane tab="账单信息" key="bill">
              <Table
                dataSet={this.billInfo}
                columns={this.billInfoColumns}
                buttons={this.billInfoButt}
              />
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}
