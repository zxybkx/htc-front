/**
 * @Description:生成申请
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-21 15:46:22
 * @LastEditTime: 2021-11-22 15:32:15
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Content, Header } from 'components/Page';
import { RouteComponentProps } from 'react-router-dom';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { Button, DataSet, Table } from 'choerodon-ui/pro';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { createRequisition, mergeCreate } from '@src/services/tobeInvoiceService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import GenerateApplicationDS from '../stores/GenerateApplicationDS';

const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  companyId: string;
  companyCode: string;
  employeeId: string;
  ids: string;
}

interface GenerateApplicationProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: ['hiop.tobeInvoice', 'hiop.invoiceWorkbench', 'hiop.invoiceReq'],
})
export default class GenerateApplication extends Component<GenerateApplicationProps> {
  generateApplicationDS = new DataSet({
    autoQuery: false,
    ...GenerateApplicationDS(),
  });

  state = {
    empInfo: {} as any,
  };

  async componentDidMount() {
    const { companyId, ids } = this.props.match.params;
    const employeeRes = await getCurrentEmployeeInfo({ tenantId, companyId });
    const employeeInfo = employeeRes && employeeRes.content[0];
    if (employeeInfo) {
      const { companyCode, employeeId } = employeeInfo;
      this.generateApplicationDS.setQueryParameter('companyId', companyId);
      this.generateApplicationDS.setQueryParameter('companyCode', companyCode);
      this.generateApplicationDS.setQueryParameter('employeeId', employeeId);
      this.generateApplicationDS.setQueryParameter('ids', ids);
      this.generateApplicationDS.query();
      this.setState({ empInfo: employeeInfo });
    }
  }

  /**
   * 合并生成
   */
  @Bind()
  async handleMerge() {
    const validateValue = await this.generateApplicationDS.validate(true, false);
    if (validateValue) {
      const { empInfo } = this.state;
      const { companyId, companyCode, employeeNum } = empInfo;
      const selectedList = this.generateApplicationDS.selected.map((record) => record.toData());
      const params = {
        tenantId,
        companyId,
        companyCode,
        employeeNumber: employeeNum,
        selectedList,
      };
      const res = getResponse(await mergeCreate(params));
      if (res) {
        if (res.status === '1000') {
          notification.success({
            description: '',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
          this.generateApplicationDS.query();
        } else {
          notification.error({
            description: '',
            message: res && res.message,
          });
        }
      }
    } else {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
    }
  }

  /**
   * 生成申请
   */
  @Bind()
  async generateApplication() {
    const validateValue = await Promise.all(
      this.generateApplicationDS.selected.map((record) => record.validate(true, false))
    );
    if (validateValue.some((item) => !item)) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
    } else {
      const { empInfo } = this.state;
      const { companyId, companyCode, employeeNum } = empInfo;
      const selectedList = this.generateApplicationDS.selected.map((record) => record.toData());
      const params = {
        tenantId,
        companyId,
        companyCode,
        employeeNumber: employeeNum,
        selectedList,
      };
      const res = getResponse(await createRequisition(params));
      if (res) {
        if (res.status === '1000') {
          notification.success({
            description: '',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
          this.generateApplicationDS.query();
        } else {
          notification.error({
            description: '',
            message: res && res.message,
          });
        }
      }
    }
  }

  /**
   * 返回表格头按钮
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const ObserverButtons = observer((props: any) => {
      let isDisabled = props.dataSet!.selected.length === 0;
      if (props.condition === 'merge') isDisabled = props.dataSet!.selected.length < 2;
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
      <ObserverButtons
        key="merge"
        condition="merge"
        onClick={() => this.handleMerge()}
        dataSet={this.generateApplicationDS}
        title={intl.get('hiop.tobeInvoice.button.merge').d('合并生成')}
      />,
      <ObserverButtons
        key="generateApplication"
        condition="generateApplication"
        onClick={() => this.generateApplication()}
        dataSet={this.generateApplicationDS}
        title={intl.get('hiop.tobeInvoice.button.generateApplication').d('单张生成')}
      />,
    ];
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      { name: 'businessType', editor: true },
      { name: 'invoiceType', editor: true },
      { name: 'billFlag', editor: true },
      { name: 'receiptName' },
      { name: 'quantity' },
      { name: 'amount' },
      { name: 'taxAmount' },
      { name: 'discountAmount' },
      { name: 'blueInvoiceCode', editor: (record) => record.get('amount') < 0 },
      { name: 'blueInvoiceNo', editor: (record) => record.get('amount') < 0 },
      {
        name: 'redInfoSerialNumber',
        editor: (record) =>
          record.get('amount') < 0 && ['0', '52'].includes(record.get('invoiceType')),
      },
      {
        name: 'electronicReceiverInfo',
        width: 160,
        editor: (record) => ['51', '52'].includes(record.get('invoiceType')),
      },
      {
        name: 'paperTicketReceiverName',
        editor: (record) => ['0', '2', '41'].includes(record.get('invoiceType')),
      },
      {
        name: 'paperTicketReceiverAddress',
        editor: (record) => ['0', '2', '41'].includes(record.get('invoiceType')),
      },
      {
        name: 'paperTicketReceiverPhone',
        editor: (record) => ['0', '2', '41'].includes(record.get('invoiceType')),
      },
    ];
  }

  render() {
    return (
      <>
        <Header
          backPath="/htc-front-iop/tobe-invoice/list"
          title={intl.get('hiop.tobeInvoice.title.generateApplication').d('生成申请')}
        />
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.generateApplicationDS}
            columns={this.columns}
            style={{ height: 500 }}
          />
        </Content>
      </>
    );
  }
}
