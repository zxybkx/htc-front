/**
 * @Description:发票池-底账
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2021-11-03 10:37:47
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { DataSet, CheckBox, Form, Table, Output, notification } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@htccommon/utils/utils';
import { pushToCustomer, pushToCollector } from '@src/services/invoicesService';
import LayoutPushDS from '../stores/LayoutPushDS';
import styles from './layoutPush.less';

const modelCode = 'hivp.invoicesLayoutPush';
const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

interface LayoutPushPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [
    modelCode,
    'hivp.invoicesFileArchive',
    'htc.common',
    'hivp.bill',
    'hivp.batchCheck',
    'hivp.checkCertification',
  ],
})
export default class LayoutPushPage extends Component<LayoutPushPageProps> {
  state = {
    employeeDesc: '',
    companyId: '',
    email: '',
    employeeNumber: '',
    emailCcYourself: false,
    sendOriginalMethod: false,
  };

  tableDS = new DataSet({
    autoQuery: false,
    autoCreate: true,
    ...LayoutPushDS(),
  });

  autoRefreshTimer;

  componentDidMount() {
    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      // console.log('invoiceInfo', invoiceInfo);
      this.setState({
        employeeDesc: invoiceInfo.employeeDesc,
        companyId: invoiceInfo.companyId,
        email: invoiceInfo.email,
        employeeNumber: invoiceInfo.employeeNumber,
      });
      this.tableDS.setQueryParameter('invoicePoolHeaderIds', invoiceInfo.invoicePoolHeaderIds);
      this.tableDS.setQueryParameter('employeeNumber', invoiceInfo.employeeNumber);
      this.tableDS.setQueryParameter('companyId', invoiceInfo.companyId);
      this.tableDS.query();
    }
  }

  // 推送收票员工
  @Bind()
  async handlePushToCollector() {
    const { companyId, emailCcYourself, employeeNumber } = this.state;
    const selectedList = this.tableDS.selected.map((rec) => rec.toData());
    if (selectedList.length === 0) {
      notification.info({
        description: '',
        message: intl
          .get('hivp.invoicesFileArchive.view.selectedMessage')
          .d('请勾选需要处理的数据'),
      });
      return;
    }
    const outFlag = selectedList.some((rec) => rec.inOutType === 'OUT');
    if (outFlag) {
      notification.warning({
        description: '',
        message: intl.get(`${modelCode}.view.existsOut`).d('存在销项发票，请重新勾选'),
      });
      return;
    }
    const invoicePoolHeaderIds = selectedList.map((rec) => ({
      invoicePoolHeaderId: rec.invoicePoolHeaderId,
      additionalEmail: rec.employeeEmail,
      additionalTell: rec.additionalTell,
    }));
    const params = {
      tenantId,
      companyId,
      employeeNumber,
      emailCcYourself: emailCcYourself ? '1' : '0',
      invoicePoolHeaderIds,
    };
    const res = getResponse(await pushToCollector(params));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
    }
  }

  // 推送客户
  @Bind()
  async handlePushToCustomer() {
    const { companyId, emailCcYourself, employeeNumber, sendOriginalMethod } = this.state;
    const selectedList = this.tableDS.selected.map((rec) => rec.toData());
    if (selectedList.length === 0) {
      notification.info({
        description: '',
        message: intl
          .get('hivp.invoicesFileArchive.view.selectedMessage')
          .d('请勾选需要处理的数据'),
      });
      return;
    }
    const inFlag = selectedList.some((rec) => rec.inOutType === 'IN');
    if (inFlag) {
      notification.warning({
        description: '',
        message: intl.get(`${modelCode}.view.existsIn`).d('存在进项发票，请重新勾选'),
      });
      return;
    }
    const invoicePoolHeaderIds = selectedList.map((rec) => ({
      invoicePoolHeaderId: rec.invoicePoolHeaderId,
      additionalEmail: rec.employeeEmail,
      additionalTell: rec.additionalTell,
    }));
    const params = {
      tenantId,
      companyId,
      employeeNumber,
      emailCcYourself: emailCcYourself ? '1' : '0',
      sendOriginalMethod: sendOriginalMethod ? '1' : '0',
      invoicePoolHeaderIds,
    };
    const res = getResponse(await pushToCustomer(params));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
    }
  }

  get columns(): ColumnProps[] {
    return [
      { name: 'inOutType' },
      { name: 'buyerTell', width: 150 },
      { name: 'buyerMail', width: 240 },
      { name: 'ticketCollectorDesc', width: 280 },
      { name: 'invoiceType', width: 200 },
      { name: 'salerName', width: 260 },
      { name: 'buyerName', width: 260 },
      { name: 'invoiceState' },
      { name: 'invoiceCode', width: 150 },
      { name: 'invoiceNo', width: 150 },
      { name: 'invoiceDate', width: 150 },
      { name: 'invoiceAmount', width: 150, align: ColumnAlign.right },
      { name: 'totalAmount', width: 150, align: ColumnAlign.right },
      { name: 'annotation', width: 200 },
      { name: 'recordType', width: 120 },
      {
        name: 'additionalTell',
        editor: (record) => record.get('invoiceLovTag') === 'E',
        width: 150,
      },
      { name: 'employeeEmail', editor: true, width: 240 },
    ];
  }

  render() {
    const { employeeDesc, email } = this.state;
    return (
      <>
        <Header
          backPath="/htc-front-ivp/invoices/list"
          title={intl.get(`${modelCode}.view.title`).d('版式推送')}
        >
          <PermissionButton
            type="c7n-pro"
            onClick={() => this.handlePushToCollector()}
            color={ButtonColor.primary}
            permissionList={[
              {
                code: `${permissionPath}.button.layout-push-collector`,
                type: 'button',
                meaning: '按钮-版式推送-推送收票员工',
              },
            ]}
          >
            {intl.get(`${modelCode}.button.pushToCollector`).d('推送收票员工')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            onClick={() => this.handlePushToCustomer()}
            permissionList={[
              {
                code: `${permissionPath}.button.layout-push-customer`,
                type: 'button',
                meaning: '按钮-版式推送-推送客户',
              },
            ]}
          >
            {intl.get(`${modelCode}.button.pushToCustomer`).d('推送客户')}
          </PermissionButton>
        </Header>
        <div className={styles.header}>
          <Form columns={2} style={{ marginTop: 15 }}>
            <Output
              label={intl.get('htc.common.modal.employeeDesc').d('登录员工')}
              value={employeeDesc}
            />
            <Output label={intl.get('hzero.common.email').d('员工邮箱')} value={email} />
          </Form>
        </div>
        <Content>
          <Form columns={5}>
            <CheckBox
              label={intl.get(`${modelCode}.view.ccSelf`).d('邮件抄送自己')}
              onChange={(value) => this.setState({ emailCcYourself: value })}
            />
            <CheckBox
              label={intl.get(`${modelCode}.view.sendOrigin`).d('发送原交付方式')}
              labelWidth={120}
              onChange={(value) => this.setState({ sendOriginalMethod: value })}
            />
          </Form>
          <Table dataSet={this.tableDS} columns={this.columns} style={{ height: 400 }} />
        </Content>
      </>
    );
  }
}
