/**
 * @Description: 税控信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-23 15:31:45
 * @LastEditTime: 2021-06-24 10:01:54
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Dispatch } from 'redux';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@common/utils/utils';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getCurrentEmployeeInfoOut } from '@common/services/commonService';
import {
  updateTax,
  updateInvoice,
  deviceStatusQuery,
  avoidLogin,
} from '@src/services/taxInfoService';
import TaxHeadersDS from '../stores/TaxHeadersDS';
import TaxLinesDS from '../stores/TaxLinesDS';

interface TaxInfoPageProps {
  dispatch: Dispatch<any>;
}

const modelCode = 'hiop.tax-info';
const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

@formatterCollections({
  code: [modelCode],
})
export default class TaxInfoPage extends Component<TaxInfoPageProps> {
  tableLineDS = new DataSet({
    autoQuery: false,
    ...TaxLinesDS(),
  });

  tableHeaderDS = new DataSet({
    autoQuery: false,
    ...TaxHeadersDS(),
    children: {
      lines: this.tableLineDS,
    },
  });

  async componentDidMount() {
    const res = await getCurrentEmployeeInfoOut({ tenantId });
    if (res && res.content) {
      const empInfo = res.content[0];
      const { queryDataSet } = this.tableHeaderDS;
      if (queryDataSet) {
        queryDataSet.current!.set({ companyObj: empInfo });
      }
    }
  }

  /**
   * 更新税控信息
   */
  @Bind()
  async handleUpdateTax() {
    const { queryDataSet } = this.tableHeaderDS;
    if (!queryDataSet) return;
    const companyId = queryDataSet.current!.get('companyId');
    const taxpayerNumber = queryDataSet.current!.get('taxpayerNumber');
    let confirm = 'ok';
    if (this.tableLineDS.length > 0) {
      const title = intl.get(`${modelCode}.view.initConfirm`).d('更新税控信息');
      confirm = await Modal.confirm({
        key: Modal.key,
        title,
        children: (
          <div>
            <p>
              {intl
                .get(`${modelCode}.view.initConfirmDesc`)
                .d('更新税控信息，将清除当前已有信息，是否确认？')}
            </p>
          </div>
        ),
      });
    }
    if (confirm === 'ok') {
      const res = getResponse(await updateTax({ tenantId, companyId, taxpayerNumber }));
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        this.tableHeaderDS.query();
      }
    }
  }

  // 发票申领
  @Bind()
  async invoiceApply() {
    const companyCode =
      this.tableHeaderDS.queryDataSet &&
      this.tableHeaderDS.queryDataSet.current!.get('companyCode');
    const params = { companyCode, tenantId };
    const res = await avoidLogin(params);
    if (res && res.status === '1000') {
      window.open(res.data);
    } else {
      notification.error({
        description: '',
        message: res && res.message,
      });
    }
  }

  /**
   * 更新库存发票信息
   */
  @Bind()
  async handleUpdateInvoice(record) {
    const taxLineId = record.get('taxLineId');
    const res = getResponse(await updateInvoice({ tenantId, taxLineId }));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
      this.tableLineDS.query();
    }
  }

  // 设备在线查询
  @Bind()
  async handleDeviceStatusQuery(record) {
    const { extNumber, taxpayerNumber } = record.toData();
    const companyCode = this.tableHeaderDS.queryDataSet?.current?.get('companyCode');
    if (!companyCode) return;
    const params = {
      tenantId,
      companyCode,
      deviceOnlineStatus: {
        taxpayerNumber,
        extNumber,
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
   * 税控主信息
   */
  get headerColumns(): ColumnProps[] {
    return [
      { name: 'taxpayerNumber', width: 180 },
      { name: 'extNumber' },
      { name: 'productType', width: 120 },
      { name: 'taxDiskNumber', width: 160 },
      { name: 'taxpayerName', width: 240 },
      { name: 'taxAuthorityCode', width: 140 },
      { name: 'taxAuthorityName', width: 240 },
      { name: 'issueAreaNumber', width: 120 },
      { name: 'curDate', width: 160 },
      { name: 'startDate', width: 120 },
      { name: 'programVersionNumber', width: 200 },
      { name: 'companyType', width: 120 },
      { name: 'taxDiskSize', align: ColumnAlign.right },
      { name: 'taxDiskType' },
      { name: 'authorizeExpirationDate', width: 160 },
      { name: 'creationDate', width: 160 },
      { name: 'extension', width: 240 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        command: ({ record }): Commands[] => {
          const disabledFlag =
            this.tableHeaderDS.queryDataSet?.current?.get('companyId') !== record.get('companyId');
          return [
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
   * 税控行信息
   */
  get lineColumns(): ColumnProps[] {
    return [
      {
        name: 'invoiceInfo',
        header: intl.get(`${modelCode}.header.invoiceInfo`).d('税控授权票种信息'),
        children: [
          { name: 'invoiceType' },
          { name: 'lockDate', width: 110 },
          { name: 'singleInvoiceLimit', width: 140, align: ColumnAlign.right },
          { name: 'uploadExpirationDate', width: 120 },
          { name: 'offLineTimeLimit', width: 110, align: ColumnAlign.right },
          { name: 'offLineAmountLimit', width: 140, align: ColumnAlign.right },
          { name: 'offLineRemainingAmount', width: 140, align: ColumnAlign.right },
          { name: 'offLineExtension', width: 240 },
          { name: 'authorizeTaxRate', width: 120 },
        ],
      },
      {
        name: 'invInfo',
        header: intl.get(`${modelCode}.header.invInfo`).d('票种库存信息'),
        children: [
          { name: 'curInvoiceCode', width: 150 },
          { name: 'curInvoiceNumber', width: 150 },
          { name: 'curRemainingCount', width: 130, renderer: ({ value }) => <span>{value}</span> },
          { name: 'totalRemainingCount', renderer: ({ value }) => <span>{value}</span> },
          { name: 'queryDate', width: 160 },
        ],
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 160,
        command: ({ record }): Commands[] => {
          return [
            <Button key="updateInvoice" onClick={() => this.handleUpdateInvoice(record)}>
              {intl.get(`${modelCode}.button.updateInvoice`).d('更新库存发票信息')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const UpdateTaxButton = observer((props: any) => {
      const isDisabled = !(props.dataSet && props.dataSet.current?.get('companyId'));
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
    const InvoiceApplicationBtn = observer((props: any) => {
      const isDisabled = !(props.dataSet && props.dataSet.current?.get('companyId'));
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
          permissionList={[
            {
              code: `${permissionPath}.button.${props.permissionCode}`,
              type: 'button',
              meaning: `${props.permissionMeaning}`,
            },
          ]}
        >
          {props.title}
        </PermissionButton>
      );
    });
    return [
      <UpdateTaxButton
        key="updateTaxInfo"
        dataSet={this.tableHeaderDS.queryDataSet}
        onClick={this.handleUpdateTax}
        title={intl.get(`${modelCode}.button.updateTaxInfo`).d('更新税控信息')}
      />,
      <InvoiceApplicationBtn
        key="invoiceApply"
        dataSet={this.tableHeaderDS}
        onClick={this.invoiceApply}
        title={intl.get(`${modelCode}.button.invoiceApply`).d('发票申领')}
        permissionCode="invoice-apply"
        permissionMeaning="按钮-发票申领"
      />,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('税控信息')} />
        <Content>
          <Table
            key="taxHeader"
            header={intl.get(`${modelCode}.table.taxHeader`).d('纳税人税控主信息')}
            dataSet={this.tableHeaderDS}
            columns={this.headerColumns}
            buttons={this.buttons}
            queryFieldsLimit={2}
            style={{ height: 200 }}
          />
          <Table
            key="taxLine"
            header={intl.get(`${modelCode}.table.taxLine`).d('票种信息')}
            dataSet={this.tableLineDS}
            columns={this.lineColumns}
            style={{ height: 200 }}
          />
        </Content>
      </>
    );
  }
}
