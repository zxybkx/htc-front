/**
 * @Description:租户信息明细
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-20 16:28:23
 * @LastEditTime: 2022-06-20 16:39:23
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Dispatch } from 'redux';
import { RouteComponentProps } from 'react-router-dom';
import {
  Button,
  DataSet,
  DatePicker,
  Form,
  Modal,
  Select,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { observer } from 'mobx-react-lite';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import TenantDetailDS from '../stores/TenantDetailDS';
import CompanyProgramDS from '../stores/CompanyProgramDS';
import ServiceListDS from '../stores/ServiceListDS';

const modelCode = 'hmdm.apply-tenant';

interface RouterInfo {
  tenantId: string;
  uniqueCode: string;
}

interface TenantAgreementPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

export default class CompanyProgramPage extends Component<TenantAgreementPageProps> {
  serviceListDS = new DataSet({
    autoQuery: false,
    ...ServiceListDS(this.props.match.params),
  });

  companyProgramDS = new DataSet({
    autoQuery: false,
    ...CompanyProgramDS(),
    children: {
      list: this.serviceListDS,
    },
  });

  tenantDetailDS = new DataSet({
    autoQuery: false,
    ...TenantDetailDS(this.props.match.params),
    children: {
      applyCompanyList: this.companyProgramDS,
    },
  });

  state = { subAccountStatus: undefined };

  async componentDidMount() {
    this.tenantDetailDS.query().then((res) => {
      const { subAccountStatus } = res;
      this.setState({ subAccountStatus });
    });
  }

  /**
   * 自定义查询条
   */
  @Bind()
  renderQueryBar(props) {
    const { buttons } = props;
    return <div style={{ marginBottom: 10 }}>{buttons}</div>;
  }

  /**
   * 编辑回调
   * @params {object} record-行记录
   */
  @Bind()
  handleEdit(record) {
    this.openModal(record, false);
  }

  /**
   * 编辑回调
   * @params {object} record-行记录
   */
  handleServiceEdit(record) {
    this.openServiceModal(record, false);
  }

  /**
   * 返回表格行
   * @returns {[]}
   */
  get columns(): ColumnProps[] {
    const { subAccountStatus } = this.state;
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? record.index + 1 : '';
        },
      },
      { name: 'companyCode' },
      { name: 'companyName', width: 200 },
      { name: 'companyShort' },
      { name: 'companyTaxNumber', width: 150 },
      { name: 'addressPhone', width: 250 },
      { name: 'openBankAccount', width: 150 },
      { name: 'competentCode', width: 150 },
      { name: 'companyAdmin' },
      { name: 'adminPhone', width: 130 },
      { name: 'adminEmail', width: 200 },
      { name: 'openFunc', width: 250 },
      { name: 'remark', width: 130 },
      { name: 'upload' },
      { name: 'download' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 80,
        command: ({ record }): Commands[] => {
          return [
            <Button
              funcType={FuncType.link}
              style={{ color: '#3889FF' }}
              disabled={subAccountStatus === '2'}
              onClick={() => this.handleEdit(record)}
            >
              {intl.get(`${modelCode}.button.edit`).d('编辑')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 返回表格行
   * @returns {[]}
   */
  get serviceColumns(): ColumnProps[] {
    const { subAccountStatus } = this.state;
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? record.index + 1 : '';
        },
      },
      { name: 'funcCode', width: 150 },
      { name: 'creationDate', width: 160 },
      { name: 'openStartDate', width: 160 },
      { name: 'openEndDate', width: 160 },
      { name: 'validityStartDate', width: 160 },
      { name: 'validityEndDate', width: 160 },
      { name: 'quantity' },
      { name: 'serverType' },
      { name: 'fileUrl', width: 130 },
      { name: 'remark', width: 130 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 80,
        command: ({ record }): Commands[] => {
          return [
            <Button
              funcType={FuncType.link}
              style={{ color: '#3889FF' }}
              disabled={subAccountStatus === '2'}
              onClick={() => this.handleServiceEdit(record)}
            >
              {intl.get(`${modelCode}.button.edit`).d('编辑')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 删除回调
   */
  @Bind()
  async handleDelete() {
    const res = await this.companyProgramDS.delete(this.companyProgramDS.selected);
    if (res && res.success) this.tenantDetailDS.query();
  }

  /**
   * 服务删除回调
   */
  @Bind()
  async handleServiceDelete() {
    this.serviceListDS.delete(this.serviceListDS.selected);
  }

  /**
   * 保存回调
   * @params {object} modal
   */
  @Bind()
  async handleCreate(modal) {
    const res = await this.companyProgramDS.submit();
    if (res && res.content) {
      modal.close();
    }
  }

  /**
   * 服务保存回调
   * @params {object} modal
   */
  @Bind()
  async handleServiceCreate(modal) {
    const res = await this.serviceListDS.submit();
    if (res && res.content) {
      modal.close();
    }
  }

  /**
   * 取消回调
   * @params {object} record-行记录
   * @params {object} modal
   * @params {boolean} isNew true-新增 false-编辑
   */
  @Bind()
  handleCancel(record, modal, isNew) {
    if (isNew) {
      this.companyProgramDS.remove(record);
    } else {
      this.companyProgramDS.reset();
    }
    modal.close();
  }

  /**
   * 服务取消回调
   * @params {object} record-行记录
   * @params {object} modal
   * @params {boolean} isNew true-新增 false-编辑
   */
  @Bind()
  handleServiceCancel(record, modal, isNew) {
    if (isNew) {
      this.serviceListDS.remove(record);
    } else {
      this.serviceListDS.reset();
    }
    modal.close();
  }

  /**
   * 保存并新增
   * @params {object} modal
   */
  @Bind()
  async saveAndCreate(modal) {
    const res = await this.companyProgramDS.submit();
    if (res && res.content) {
      modal.close();
      this.handleAdd();
    }
  }

  /**
   * 服务保存并新增
   * @params {object} modal
   */
  @Bind()
  async saveAndCreateService(modal) {
    const res = await this.serviceListDS.submit();
    if (res && res.content) {
      modal.close();
      this.handleServiceAdd();
    }
  }

  /**
   * 返回新增/编辑modal
   * @params {object} record-行记录
   * @params {boolean} isNew true-新增 false-编辑
   */
  @Bind()
  openModal(record, isNew) {
    const modal = Modal.open({
      title: isNew ? '新增' : '编辑',
      drawer: true,
      children: (
        <Form record={record}>
          <TextField name="companyCode" />
          <TextField name="companyName" />
          <TextField name="companyShort" />
          <TextField name="companyTaxNumber" />
          <TextField name="addressPhone" />
          <TextField name="openBankAccount" />
          <TextField name="competentCode" />
          <TextField name="companyAdmin" />
          <TextField name="adminPhone" />
          <TextField name="adminEmail" />
          <Select name="openFunc" />
          <TextField name="remark" />
        </Form>
      ),
      footer: (
        <div>
          <Button color={ButtonColor.primary} onClick={() => this.handleCreate(modal)}>
            {intl.get(`${modelCode}.completed`).d('保存')}
          </Button>
          {isNew && (
            <Button onClick={() => this.saveAndCreate(modal)}>
              {intl.get(`${modelCode}.completed`).d('保存并新增')}
            </Button>
          )}
          <Button onClick={() => this.handleCancel(record, modal, isNew)}>
            {intl.get(`${modelCode}.modalColse`).d('取消')}
          </Button>
        </div>
      ),
    });
  }

  /**
   * 返回服务新增/编辑modal
   * @params {object} record-行记录
   * @params {boolean} isNew true-新增 false-编辑
   */
  @Bind()
  openServiceModal(record, isNew) {
    const modal = Modal.open({
      title: isNew ? '新增' : '编辑',
      drawer: true,
      children: (
        <Form record={record}>
          <Select name="funcCode" />
          <DatePicker name="creationDateObj" />
          <DatePicker name="validityDate" />
          <TextField name="quantity" />
          <Select name="serverType" />
          <TextField name="fileUrl" />
          <TextField name="remark" />
        </Form>
      ),
      footer: (
        <div>
          <Button color={ButtonColor.primary} onClick={() => this.handleServiceCreate(modal)}>
            {intl.get(`${modelCode}.completed`).d('保存')}
          </Button>
          {isNew && (
            <Button onClick={() => this.saveAndCreateService(modal)}>
              {intl.get(`${modelCode}.completed`).d('保存并新增')}
            </Button>
          )}
          <Button onClick={() => this.handleServiceCancel(record, modal, isNew)}>
            {intl.get(`${modelCode}.modalColse`).d('取消')}
          </Button>
        </div>
      ),
    });
  }

  /**
   * 新增
   */
  @Bind()
  handleAdd() {
    const { tenantId, uniqueCode } = this.props.match.params;
    this.openModal(this.companyProgramDS.create({ tenantId, uniqueCode }, 0), true);
  }

  /**
   * 服务新增
   */
  @Bind()
  handleServiceAdd() {
    const { tenantId, uniqueCode } = this.props.match.params;
    const companyId = this.companyProgramDS.current!.get('companyId');
    const openStartDate = this.companyProgramDS.current!.get('openStartDate');
    const openEndDate = this.companyProgramDS.current!.get('openEndDate');
    this.openServiceModal(
      this.serviceListDS.create({ companyId, tenantId, uniqueCode, openStartDate, openEndDate }, 0),
      true
    );
  }

  /**
   * 返回表格头按钮
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const { subAccountStatus } = this.state;
    const HeaderButtons = observer((props: any) => {
      const isDisabled = subAccountStatus === '2' || props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          icon={props.icon}
          onClick={props.onClick}
          disabled={isDisabled}
          color={ButtonColor.default}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <Button onClick={this.handleAdd} icon="add" key="add" disabled={subAccountStatus === '2'}>
        {intl.get('hzero.common.button.add ').d('新增')}
      </Button>,
      <HeaderButtons
        key="delete"
        icon="delete"
        onClick={() => this.handleDelete()}
        dataSet={this.companyProgramDS}
        title={intl.get(`${modelCode}.button.delete`).d('删除')}
      />,
    ];
  }

  /**
   * 返回服务表格头按钮
   * @returns {*[]}
   */
  get serviceButtons(): Buttons[] {
    const { subAccountStatus } = this.state;
    const AddButton = observer((props: any) => {
      const isDisabled = subAccountStatus === '2' || props.dataSet!.length === 0;
      return (
        <Button
          key={props.key}
          icon={props.icon}
          onClick={props.onClick}
          disabled={isDisabled}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    const HeaderButtons = observer((props: any) => {
      const isDisabled = subAccountStatus === '2' || props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          icon={props.icon}
          onClick={props.onClick}
          disabled={isDisabled}
          color={ButtonColor.default}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <AddButton
        onClick={this.handleServiceAdd}
        icon="add"
        key="add"
        title={intl.get('hzero.common.button.add ').d('新增')}
        dataSet={this.companyProgramDS}
      />,
      <HeaderButtons
        key="delete"
        icon="delete"
        onClick={() => this.handleServiceDelete()}
        dataSet={this.serviceListDS}
        title={intl.get(`${modelCode}.button.delete`).d('删除')}
      />,
    ];
  }

  render() {
    return (
      <>
        <Header
          title={intl.get(`${modelCode}.title`).d('租户申请明细信息')}
          backPath="/htc-front-mdm/project-application/list"
        />
        <Content>
          <Form dataSet={this.tenantDetailDS} columns={4}>
            <TextField name="contractCustomerName" />
            <TextField name="customerPhone" />
            <TextField name="customerEmail" />
            <TextField name="customerAdmin" />
            <TextField name="projectNumber" />
            <TextField name="contractNumber" />
            <TextField name="customerSystem" />
            <TextField name="createItem" />
            <TextField name="pmsContractNumber" />
            <TextField name="deliveryName" />
          </Form>
          <Table
            buttons={this.buttons}
            dataSet={this.companyProgramDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            style={{ height: 300 }}
          />
          <Table
            buttons={this.serviceButtons}
            dataSet={this.serviceListDS}
            columns={this.serviceColumns}
            queryBar={this.renderQueryBar}
            style={{ height: 300, marginTop: 20 }}
          />
        </Content>
      </>
    );
  }
}
