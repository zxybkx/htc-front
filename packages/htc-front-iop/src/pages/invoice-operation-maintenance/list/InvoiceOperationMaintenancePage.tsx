/**
 * @Description - 开票订单运维平台页面
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-25
 * @LastEditeTime: 2022-02-25
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Button, DataSet, Form, Lov, Modal, Table, TextField } from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { getCurrentUser, getResponse } from 'utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { observer } from 'mobx-react-lite';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { updateTax } from '@src/services/invoiceOperationMaintenanceService';
import InvoiceOperationMaintenanceDS from '../stores/InvoiceOperationMaintenanceDS';

const loginInfo = getCurrentUser();

interface InvoiceOperationMaintenancePageProps {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: ['hiop.invoiceOptMain', 'htc.common', 'hiop.invoiceWorkbench', 'hiop.invoiceReq'],
})
@connect()
export default class InvoiceOperationMaintenancePage extends Component<InvoiceOperationMaintenancePageProps> {
  tableDS = new DataSet({
    autoQuery: false,
    ...InvoiceOperationMaintenanceDS(),
  });

  /**
   * 导出
   */
  @Bind()
  handleGetQueryParams() {}

  /**
   * 导入
   */
  @Bind()
  handleImport() {}

  /**
   * 保存修改
   * @params {object} modal
   */
  @Bind()
  async handleSaveInvoiceOpt(modal) {
    const res = await this.tableDS.submit();
    if (res && res.content) {
      modal.close();
    }
  }

  /**
   * 保存修改
   * @params {object} record-行记录
   * @params {object} modal
   */
  @Bind()
  handleCancelInvoiceOpt(record, modal) {
    this.tableDS.remove(record);
    modal.close();
  }

  /**
   * 查询订单
   * @params {object} value-输入值
   * @params {object} record-行记录
   */
  @Bind()
  async queryOrder(value, record) {
    if (value) {
      const { queryDataSet } = this.tableDS;
      const tenantId = queryDataSet && queryDataSet.current!.get('tenantId');
      const companyId = queryDataSet && queryDataSet.current!.get('companyId');
      const params = {
        tenantId,
        companyId,
        queryField: value.value,
        invoicingOrderHeaderId: record.get('invoicingOrderHeaderId'),
        orderNumber: record.get('orderNumber'),
      };
      const res = getResponse(await updateTax(params));
      if (res && res.status === '1000') {
        const field = res.data;
        record.set({ beforeValue: field });
      }
    }
  }

  /**
   * 新增订单运维
   */
  @Bind()
  handleCreateInvoiceOpt() {
    const { queryDataSet } = this.tableDS;
    const queryData = queryDataSet && queryDataSet.current!.toData();
    const { tenantId, companyId, companyCode, companyName, tenantName } = queryData;
    const { loginName } = loginInfo;
    const record = this.tableDS.create(
      { tenantId, companyId, companyCode, companyName, tenantName, maintenanceAccount: loginName },
      0
    );
    const modal = Modal.open({
      title: '添加修改',
      children: (
        <Form record={record}>
          <TextField name="invoicingOrderHeaderId" />
          <TextField name="orderNumber" />
          <Lov name="updateFieldObj" onChange={(value) => this.queryOrder(value, record)} />
          <TextField name="beforeValue" />
          <TextField name="afterValue" />
          <TextField name="maintenanceOperator" />
        </Form>
      ),
      footer: (
        <div>
          <Button color={ButtonColor.primary} onClick={() => this.handleSaveInvoiceOpt(modal)}>
            {intl.get('hiop.invoiceOptMain.button.saveCommodity').d('保存修改')}
          </Button>
          <Button onClick={() => this.handleCancelInvoiceOpt(record, modal)}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      ),
    });
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const AddButtons = observer((props: any) => {
      const { queryDataSet } = props.dataSet;
      const tenantId = queryDataSet && queryDataSet.current?.get('tenantId');
      const companyId = queryDataSet && queryDataSet.current?.get('companyId');
      const isDisabled = !tenantId || !companyId;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
          icon={props.icon}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <AddButtons
        icon="add"
        dataSet={this.tableDS}
        onClick={() => this.handleCreateInvoiceOpt()}
        title={intl.get('hzero.common.button.add').d('新增')}
      />,
    ];
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      { name: 'sourceType' },
      { name: 'tenantId' },
      { name: 'tenantName', width: 160 },
      { name: 'companyCode' },
      { name: 'companyName', width: 160 },
      { name: 'invoicingOrderHeaderId' },
      { name: 'orderNumber', width: 260 },
      { name: 'updateField', width: 160 },
      { name: 'updateFieldDescription', width: 220 },
      { name: 'beforeValue' },
      { name: 'afterValue' },
      { name: 'maintenanceDate', width: 160 },
      { name: 'maintenanceOperator', width: 180 },
      { name: 'maintenanceAccount' },
    ];
  }

  render() {
    return (
      <>
        <Header
          title={intl.get('hiop.invoiceOptMain.title.invoiceOptMain').d('开票订单运维平台')}
        />
        <Content>
          <Table
            buttons={this.buttons}
            queryFieldsLimit={3}
            dataSet={this.tableDS}
            columns={this.columns}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
