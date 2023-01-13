/*
 * @Description:发票池-底账
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2022-07-26 17:16:23
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import {
  DataSet,
  Spin,
  CheckBox,
  Form,
  // Button,
  DatePicker,
  TextField,
  Table,
  Progress,
  Select,
  // TimePicker,
} from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getOriginalAccount, getOriginalAccountAutoDate } from '@src/services/invoicesService';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@htccommon/utils/utils';
import OriginalAccountHeaderDS from '../stores/OriginalAccountHeaderDS';
import OriginalAccountLineDS from '../stores/OriginalAccountLineDS';

const modelCode = 'hivp.invoicesOriginalAccount';
const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

interface OriginalAccountPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [
    modelCode,
    'htc.common',
    'hivp.checkCertification',
    'hivp.invoicesArchiveUpload',
    'hiop.redInvoiceInfo',
    'hivp.invoicesLayoutPush',
  ],
})
export default class OriginalAccountPage extends Component<OriginalAccountPageProps> {
  state = { refreshTimeValue: 30, inChannelCode: '', companyCode: '', employeeNum: '' };

  lineDS = new DataSet({
    autoQuery: false,
    ...OriginalAccountLineDS(),
  });

  headerDS = new DataSet({
    autoQuery: false,
    ...OriginalAccountHeaderDS({}),
    children: {
      lines: this.lineDS,
    },
  });

  autoRefreshTimer;

  componentDidMount() {
    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      this.headerDS = new DataSet({
        autoQuery: false,
        ...OriginalAccountHeaderDS(invoiceInfo),
        children: {
          lines: this.lineDS,
        },
      });
      this.setState({
        inChannelCode: invoiceInfo.inChannelCode,
        companyCode: invoiceInfo.companyCode,
        employeeNum: invoiceInfo.employeeNumber,
      });
      this.headerDS.setQueryParameter('companyId', invoiceInfo.companyId);
      this.headerDS.setQueryParameter('inChannelCode', invoiceInfo.inChannelCode);
      this.headerDS.query().then(res => {
        if (res) {
          if (this.headerDS.length === 0) {
            this.headerDS.create(
              { companyId: invoiceInfo.companyId, inChannelCode: invoiceInfo.inChannelCode },
              0
            );
          }
          this.headerDS.current!.set({ inOutType: 'IN' });

          const autoRefreshFlag = this.headerDS.current!.get('autoRefreshFlag');

          if (autoRefreshFlag && autoRefreshFlag === 1) {
            this.autoRefreshTimer = setInterval(
              () => this.handleAutoRefresh(),
              this.state.refreshTimeValue * 1000
            );
          }
        }
      });
    }
  }

  componentWillUnmount() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }
  }

  // 自动刷新
  @Bind()
  handleAutoRefresh() {
    this.lineDS.query();
  }

  // 获取底账
  @Bind()
  async handleGetOriginalAccount() {
    const { inChannelCode, companyCode, employeeNum } = this.state;
    await this.headerDS.submit();
    const headerData = this.headerDS.current!.toData();
    const params = {
      tenantId,
      companyCode,
      employeeNum,
      channelFlag: inChannelCode,
      allParFlag: headerData.allParFlag,
      originalAccountHeaderId: headerData.originalAccountHeaderId,
      taxDiskPassword: headerData.taxDiskPassword,
      invoiceDateFrom: headerData.invoiceDateFrom,
      invoiceDateTo: headerData.invoiceDateTo,
    };
    const res = getResponse(await getOriginalAccount(params));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
      this.lineDS.query();
    }
  }

  // 启动/停止刷新
  @Bind()
  handleAutoRefreshChange(value) {
    if (value === 1) {
      this.lineDS.query();
      this.autoRefreshTimer = setInterval(
        () => this.handleAutoRefresh(),
        this.state.refreshTimeValue * 1000
      );
    } else if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }
  }

  // 保存
  @Bind()
  async handleSave() {
    const { employeeNum } = this.state;
    const everydayGetOriginalFlag = this.headerDS.current!.get('everydayGetOriginalFlag') === 1;
    if (everydayGetOriginalFlag) {
      this.headerDS.current!.set({ employeeNum });
    }
    const res = await this.headerDS.submit();

    if (res && res.success && everydayGetOriginalFlag) {
      const params = {
        tenantId,
        originalAccountHeaderId: this.headerDS.current?.get('originalAccountHeaderId'),
      };
      const resp = getResponse(await getOriginalAccountAutoDate(params));
      if (resp) {
        const textLeft = intl.get(`${modelCode}.view.lastAutoDate`).d('上一次的自动获取时间为');
        notification.info({
          message: `${textLeft}：${resp.data}`,
          description: '',
        });
      }
    }
  }

  /**
   * 设置单元格属性
   */
  @Bind()
  onCell() {
    return {
      onClick: e => {
        const { currentTarget } = e;
        const spanNode = currentTarget.firstChild;

        if (spanNode.style.whiteSpace === 'normal') {
          spanNode.style.whiteSpace = 'nowrap';
          spanNode.style.textOverflow = 'ellipsis';
        } else {
          spanNode.style.whiteSpace = 'normal';
          spanNode.style.minHeight = spanNode.style.height;
          spanNode.style.height = '';
          spanNode.style.textOverflow = 'unset';
        }
      },
    };
  }

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`htc.common.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? this.lineDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'getDate', width: 160 },
      { name: 'requestFlag' },
      { name: 'completeStatus', renderer: ({ value }) => <Progress value={value} />, width: 150 },
      { name: 'completeDate', width: 160 },
      { name: 'getInvoiceNum', renderer: ({ value }) => <span>{value}</span> },
      { name: 'updateInvoiceNum', renderer: ({ value }) => <span>{value}</span> },
      { name: 'batchNo', width: 280 },
      { name: 'parameter', width: 300, onCell: this.onCell },
      { name: 'exceptionInfo', width: 300, onCell: this.onCell },
    ];
  }

  render() {
    const { inChannelCode } = this.state;
    const GetOriginalAccount = observer((props: any) => {
      let isDisabled = false;

      if (props.dataSet.length > 0) {
        const curRec = props.dataSet.toData()[0];
        isDisabled = curRec && curRec.everydayGetOriginalFlag === 1;
      }
      return (
        <PermissionButton
          type="c7n-pro"
          onClick={() => this.handleGetOriginalAccount()}
          disabled={isDisabled}
          permissionList={[
            {
              code: `${permissionPath}.button.original-get-original`,
              type: 'button',
              meaning: '按钮-获取底账-底账获取',
            },
          ]}
        >
          {intl.get(`${modelCode}.button.getOriginalAccount`).d('底账获取')}
        </PermissionButton>
      );
    });

    return (
      <>
        <Header
          backPath="/htc-front-ivp/invoices/list"
          title={intl.get(`${modelCode}.button.getOriginalAccount`).d('底账获取')}
        >
          <PermissionButton
            type="c7n-pro"
            onClick={() => this.handleSave()}
            permissionList={[
              {
                code: `${permissionPath}.button.original-save`,
                type: 'button',
                meaning: '按钮-获取底账-保存',
              },
            ]}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </PermissionButton>
          <GetOriginalAccount dataSet={this.headerDS} />
        </Header>
        <Content>
          <Form dataSet={this.headerDS.queryDataSet} columns={4}>
            <TextField name="companyDesc" colSpan={2} />
            <DatePicker name="curDate" />
            <Select name="inChannelCode" />
          </Form>
          <Spin dataSet={this.headerDS}>
            <Form dataSet={this.headerDS} columns={4}>
              <DatePicker name="invoiceDateFrom" />
              <DatePicker name="invoiceDateTo" />
              <Select name="autoRunTime" renderer={({ value }) => value && `${value}:00:00`}>
                <Select.Option value="06">06</Select.Option>
                <Select.Option value="12">12</Select.Option>
              </Select>
              <CheckBox name="everydayGetOriginalFlag" />
              <TextField name="invoiceCode" />
              <TextField name="invoiceNum" />
              <CheckBox
                name="autoRefreshFlag"
                onChange={value => this.handleAutoRefreshChange(value)}
              />
              <CheckBox name="allParFlag" />
              <Select name="invoiceType" />
              {['ZK_IN_CHANNEL_DIGITAL', 'ZK_IN_CHANNEL'].includes(inChannelCode) ? (
                <Select name="inOutType" />
              ) : (
                <TextField name="taxDiskPassword" />
              )}
            </Form>
            <Table dataSet={this.lineDS} columns={this.columns} style={{ height: 400 }} />
          </Spin>
        </Content>
      </>
    );
  }
}
