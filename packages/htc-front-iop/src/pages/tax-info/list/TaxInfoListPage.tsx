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
import { Content, Header } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Button, DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@htccommon/utils/utils';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import {
  avoidLogin,
  batchUpdateInvoice,
  deviceStatusQuery,
  updateInvoice,
  updateTax,
} from '@src/services/taxInfoService';
import { Card } from 'choerodon-ui';
import TaxHeadersDS from '../stores/TaxHeadersDS';
import TaxLinesDS from '../stores/TaxLinesDS';
import styles from '../taxInfo.module.less';

interface TaxInfoPageProps {
  dispatch: Dispatch<any>;
}

const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

@formatterCollections({
  code: ['hiop.taxInfo', 'hiop.invoiceWorkbench', 'htc.common', 'hiop.redInvoiceInfo'],
})
export default class TaxInfoListPage extends Component<TaxInfoPageProps> {
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
      const title = intl.get('hiop.taxInfo.title.initConfirm').d('更新税控信息');
      confirm = await Modal.confirm({
        key: Modal.key,
        title,
        children: (
          <div>
            <p>
              {intl
                .get('hiop.taxInfo.notification.message.initConfirmDesc')
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

  /**
   * 发票申领
   */
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
   * @params {object} record-行记录
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

  /**
   * 批量更新库存发票
   */
  @Bind()
  async batchUpdate() {
    const { queryDataSet } = this.tableHeaderDS;
    if (!queryDataSet) return;
    const companyId = queryDataSet.current!.get('companyId');
    const res = getResponse(await batchUpdateInvoice({ tenantId, companyId }));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
      this.tableLineDS.query();
    }
  }

  /**
   * 设备在线查询
   * @params {object} record-行记录
   */
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
            {res.data.map(data => (
              <p>
                {intl.get('hiop.taxInfo.view.extNumber').d('分机号：')}
                {data.extNumber}&nbsp;&nbsp;&nbsp;
                {intl.get('hiop.taxInfo.view.deviceStatus').d('在线状态：')}
                {data.deviceStatus}
              </p>
            ))}
          </span>
        );
      }
      Modal.info({
        title: intl.get('hiop.taxInfo.view.deviceStatusQuery').d('设备在线查询'),
        children: showContent,
      });
    }
  }

  /**
   * 返回税控主信息行
   * @returns {*[]}
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
              funcType={FuncType.link}
            >
              {intl.get('hiop.taxInfo.button.deviceStatusQuery').d('设备在线查询')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 返回税控行
   * @returns {*[]}
   */
  get lineColumns(): ColumnProps[] {
    return [
      {
        name: 'invoiceInfo',
        header: intl.get('hiop.taxInfo.view.invoiceInfo').d('税控授权票种信息'),
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
        header: intl.get('hiop.taxInfo.view.invInfo').d('票种库存信息'),
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
            <Button
              key="updateInvoice"
              funcType={FuncType.link}
              onClick={() => this.handleUpdateInvoice(record)}
            >
              {intl.get('hiop.taxInfo.button.updateInvoice').d('更新库存发票信息')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 返回纳税人税控主信息头按钮组
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
          color={props.color}
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
        title={intl.get('hiop.taxInfo.button.updateTaxInfo').d('更新税控信息')}
      />,
      <InvoiceApplicationBtn
        key="invoiceApply"
        dataSet={this.tableHeaderDS}
        color={ButtonColor.default}
        onClick={this.invoiceApply}
        title={intl.get('hiop.taxInfo.button.invoiceApply').d('发票申领')}
        permissionCode="invoice-apply"
        permissionMeaning="按钮-发票申领"
      />,
    ];
  }

  /**
   * 返回票种信息表格头按钮组
   * @returns {*[]}
   */
  get lineButtons(): Buttons[] {
    return [
      <Button
        key="batchUpdate"
        onClick={() => this.batchUpdate()}
        funcType={FuncType.flat}
        color={ButtonColor.primary}
      >
        {intl.get('hiop.taxInfo.button.batchUpdate').d('批量更新库存发票')}
      </Button>,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get('hiop.taxInfo.title.invoiceInfo').d('税控信息')} />
        <Content style={{ background: '#f4f5f7', padding: '0' }}>
          <Card style={{ marginBottom: '8px' }}>
            <Table
              key="taxHeader"
              // header={intl.get(`${modelCode}.table.taxHeader`).d('纳税人税控主信息')}
              dataSet={this.tableHeaderDS}
              columns={this.headerColumns}
              buttons={this.buttons}
              queryFieldsLimit={3}
              className={styles.table}
              style={{ height: 200 }}
            />
          </Card>
          <Card>
            <Table
              key="taxLine"
              header={intl.get('hiop.taxInfo.view.invoiceTypeInfo').d('票种信息')}
              dataSet={this.tableLineDS}
              buttons={this.lineButtons}
              columns={this.lineColumns}
              className={styles.table}
              style={{ height: 200 }}
            />
          </Card>
        </Content>
      </>
    );
  }
}
