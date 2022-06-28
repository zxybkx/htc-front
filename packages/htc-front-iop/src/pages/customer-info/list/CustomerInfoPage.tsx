/**
 * @Description: 客户信息维护页面
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-08 10:16:35
 * @LastEditTime: 2021-12-14 14:11:35
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { closeTab, openTab } from 'utils/menuTab';
import queryString from 'query-string';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import notification from 'utils/notification';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import {
  Button,
  Currency,
  DataSet,
  Form,
  Lov,
  Modal,
  Select,
  Switch,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { Icon, Tag } from 'choerodon-ui';
import InvoiceQueryTable from '@src/utils/invoice-query/InvoiceQueryTable';
import { batchSave } from '@src/services/customerService';
import CustomerInfoListDS from '../stores/CustomerInfoListDS';
import RemarkRulesPage from './RemarkRulesPage';

const API_PREFIX = commonConfig.IOP_API || '';
const tenantId = getCurrentOrganizationId();

interface CommodityInfoPageProps extends RouteComponentProps {
  customerInfoListDS: DataSet;
}

@formatterCollections({
  code: ['hiop.customerInfo', 'htc.common', 'hiop.invoiceWorkbench', 'hiop.invoiceReq'],
})
@withProps(
  () => {
    const customerInfoListDS = new DataSet({
      autoQuery: false,
      ...CustomerInfoListDS(),
    });
    return { customerInfoListDS };
  },
  { cacheState: true }
)
@connect()
export default class CustomerInfoPage extends Component<CommodityInfoPageProps> {
  async componentDidMount() {
    const { queryDataSet } = this.props.customerInfoListDS;
    if (queryDataSet) {
      const res = await getCurrentEmployeeInfoOut({ tenantId });
      const curCompanyId = queryDataSet.current!.get('companyId');
      if (res && res.content) {
        const empInfo = res.content[0];
        if (empInfo && !curCompanyId) {
          queryDataSet.current!.set({ companyObj: empInfo });
        }
      }
    }
  }

  /**
   * 客户信息Modal
   * @params {object} record-行记录
   * @params {boolean} true-新增 false-编辑
   */
  @Bind()
  openModalCustomer(record, isNew) {
    const modal = Modal.open({
      title: isNew
        ? intl.get('hiop.customerInfo.button.customerAdd').d('新增客户')
        : intl.get('hiop.customerInfo.button.customerEdit').d('编辑客户'),
      drawer: true,
      children: (
        <Form record={record} labelTooltip={Tooltip.overflow} style={{ marginRight: 10 }}>
          <TextField name="customerCode" />
          <Select name="enterpriseType" />
          <Select
            name="customerName"
            searchable
            searchMatcher="receiptName"
            combo
            checkValueOnOptionsChange={false}
            onChange={(value, oldValue) => this.handleReceiptNameChange(value, oldValue, record)}
            suffix={<Icon type="search" onClick={() => this.handleInvoiceQuery(record)} />}
          />
          <TextField name="customerTaxpayerNumber" />
          <TextField name="customerAddressPhone" />
          <TextField name="bankNumber" />
          <Lov name="qualifiedAuditorObj" />
          <Lov name="extNumberObj" />
          <Select name="invoiceType" />
          <Currency name="invoiceLimitAmount" />
          <Select name="taxIncludedFlag" />
          <Select name="billFlag" />
          <TextField name="electronicReceiverInfo" />
          <TextField name="paperTicketReceiverName" />
          <TextField name="paperTicketReceiverPhone" />
          <TextField name="paperTicketReceiverAddress" />
          <Switch name="enabledFlag" />
        </Form>
      ),
      footer: (
        <div>
          <Button
            color={ButtonColor.primary}
            onClick={() => this.handleSaveCustomer(modal, record, isNew)}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button onClick={() => this.handleCancelCustomer(record, modal, isNew)}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      ),
    });
  }

  /**
   * 客户信息新增行
   */
  @Bind()
  handleAddCustomer() {
    const { queryDataSet } = this.props.customerInfoListDS;
    if (queryDataSet) {
      const record = this.props.customerInfoListDS.create(
        {
          companyId: queryDataSet.current?.get('companyId'),
          companyCode: queryDataSet.current?.get('companyCode'),
          employeeId: queryDataSet.current?.get('employeeId'),
          employeeNum: queryDataSet.current?.get('employeeNum'),
        },
        0
      );
      this.openModalCustomer(record, true);
    }
  }

  /**
   * 删除客户
   */
  @Bind()
  handleDeleteCustomer() {
    const record = this.props.customerInfoListDS.selected;
    this.props.customerInfoListDS.delete(record);
  }

  /**
   * 返回表格按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const ObserverButtons = observer((props: any) => {
      const isDisabled = !(props.dataSet && props.dataSet.current?.get('companyId'));
      return (
        <Button
          key={props.key}
          icon="add"
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    const DeleteButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <ObserverButtons
        key="add"
        onClick={() => this.handleAddCustomer()}
        dataSet={this.props.customerInfoListDS.queryDataSet}
        title={intl.get('hzero.common.button.add').d('新增')}
      />,
      <DeleteButtons
        key="delete"
        onClick={() => this.handleDeleteCustomer()}
        dataSet={this.props.customerInfoListDS}
        title={intl.get('hzero.common.button.delete').d('删除')}
      />,
    ];
  }

  /**
   * 开票企业模糊查询赋值
   * @params {object} value-当前值
   * @params {object} oldValue-旧值
   * @params {object} record-行记录
   */
  @Bind()
  handleReceiptNameChange(value, oldValue, record) {
    if (value === oldValue) return;
    const customerNameField = record.getField('customerName');
    if (customerNameField) {
      const receiptName = customerNameField.getText(value) || customerNameField.getValue();
      const receiptObj: any = customerNameField.getLookupData(value);
      record.set({
        customerName: receiptName,
        receiptObj: receiptObj.receiptName ? receiptObj : { receiptName },
      });
    }
  }

  /**
   * 开票信息查询
   * @params {object} record-行记录
   */
  @Bind()
  handleInvoiceQuery(record) {
    const { queryDataSet } = this.props.customerInfoListDS;
    if (queryDataSet) {
      const companyCode = queryDataSet.current!.get('companyCode');
      const employeeNum = queryDataSet.current!.get('employeeNum');
      const curHeader = record.toData();
      const invoiceQueryProps = {
        invoiceType: curHeader.invoiceType,
        enterpriseName: curHeader.customerName,
        sourceRecord: record,
        sourceField: 'receiptObj',
        companyCode,
        employeeNum,
      };
      const modal = Modal.open({
        key: Modal.key(),
        title: intl.get('hiop.invoiceWorkbench.title.invoiceQuery').d('开票信息查询'),
        destroyOnClose: true,
        closable: true,
        footer: null,
        style: { width: '50%' },
        children: <InvoiceQueryTable {...invoiceQueryProps} onCloseModal={() => modal.close()} />,
      });
    }
  }

  /**
   * 备注规则
   * @params {object} record-行记录
   */
  @Bind()
  remarkRules(record) {
    const customerInformationId = record.get('customerInformationId');
    const modal = Modal.open({
      key: Modal.key(),
      title: intl.get('hiop.customerInfo.title.remarkRules').d('备注规则'),
      destroyOnClose: true,
      closable: true,
      footer: null,
      style: { width: '40%' },
      children: (
        <RemarkRulesPage
          customerInformationId={customerInformationId}
          onCloseModal={() => modal.close()}
        />
      ),
    });
  }

  /**
   * 禁用/启用
   * @params {object} record-行记录
   */
  @Bind()
  handleEnabledFlag(record) {
    if (record.get('enabledFlag') === 0) {
      record.set({ enabledFlag: 1 });
      this.props.customerInfoListDS.submit();
    } else {
      const title = intl.get('htc.common.notification.disableConfirm').d('确认禁用？');
      Modal.confirm({
        key: Modal.key,
        title,
      }).then((button) => {
        if (button === 'ok') {
          record.set({ enabledFlag: 0 });
          this.props.customerInfoListDS.submit();
        }
      });
    }
  }

  /**
   * 保存客户
   * @params {object} modal
   * @params {object} record-行记录
   * @params {boolean} isNew true-新增 false-编辑
   */
  @Bind()
  async handleSaveCustomer(modal, record, isNew) {
    const validateValue = await this.props.customerInfoListDS.validate(false, false);
    if (validateValue) {
      const data = record.toData(true);
      const params = {
        tenantId,
        checkDataSameFlag: '1',
        data,
      };
      const res = getResponse(await batchSave(params));
      if (res) {
        if (res.status === '1000') {
          modal.close();
          notification.success({
            description: '',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
          this.props.customerInfoListDS.query();
        } else {
          Modal.confirm({
            title: res && res.message,
            okText: '继续',
            mask: false,
          }).then(async (button) => {
            if (button === 'ok') {
              const secParams = {
                tenantId,
                checkDataSameFlag: '0',
                data,
              };
              const secRes = getResponse(await batchSave(secParams));
              if (secRes) {
                modal.close();
                notification.success({
                  description: '',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                this.props.customerInfoListDS.query();
              }
            } else {
              this.handleCancelCustomer(record, modal, isNew);
            }
          });
        }
      }
    }
  }

  /**
   * 取消客户修改
   * @params {object} record-行记录
   * @params {object} modal
   * @params {boolean} isNew true-新增 false-编辑
   */
  @Bind()
  handleCancelCustomer(record, modal, isNew) {
    if (isNew) {
      this.props.customerInfoListDS.remove(record);
    } else {
      this.props.customerInfoListDS.reset();
    }
    modal.close();
  }

  /**
   * 编辑客户
   * @params {object} record-行记录
   */
  @Bind()
  handleEditCustomer(record) {
    this.openModalCustomer(record, false);
  }

  /**
   * 查看商品信息
   * @params {object} record-行记录
   */
  @Bind()
  gotoCommodity(record) {
    const { history } = this.props;
    const { queryDataSet } = this.props.customerInfoListDS;
    const taxpayerNumber = queryDataSet && queryDataSet.current!.get('taxpayerNumber');
    const recordData = {
      ...record.toData(),
      taxpayerNumber,
    };
    history.push({
      pathname: '/htc-front-iop/customer-info/commodity-info',
      search: queryString.stringify({
        recordData: encodeURIComponent(JSON.stringify(recordData)),
      }),
    });
  }

  /**
   * 客户信息行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        name: 'customerCode',
        width: 150,
        renderer: ({ value, record }) => {
          const enabledFlag = record?.get('enabledFlag');
          const customerInformationId = record?.get('customerInformationId');
          const enabledText = enabledFlag === 0 ? '禁用' : '启用';
          let color = '';
          let textColor = '';
          switch (enabledFlag) {
            case 0:
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            case 1:
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            default:
              color = '';
              textColor = '';
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {enabledText}
              </Tag>
              {customerInformationId ? (
                <a onClick={() => this.gotoCommodity(record)}>{value}</a>
              ) : (
                <span>{value}</span>
              )}
            </>
          );
        },
      },
      { name: 'enterpriseType', width: 120 },
      { name: 'systemCustomerName', width: 180 },
      {
        name: 'customerName',
        width: 300,
      },
      {
        name: 'customerTaxpayerNumber',
        width: 200,
      },
      { name: 'customerAddressPhone', width: 200 },
      { name: 'bankNumber', width: 200 },
      { name: 'qualifiedAuditorObj', width: 280 },
      { name: 'extNumberObj' },
      { name: 'invoiceType', width: 150 },
      {
        name: 'invoiceLimitAmount',
        align: ColumnAlign.right,
      },
      { name: 'taxIncludedFlag' },
      { name: 'billFlag' },
      {
        name: 'electronicReceiverInfo',
        width: 150,
      },
      {
        name: 'paperTicketReceiverName',
        width: 120,
      },
      {
        name: 'paperTicketReceiverPhone',
        width: 120,
      },
      {
        name: 'paperTicketReceiverAddress',
        width: 120,
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 180,
        command: ({ record }): Commands[] => {
          const curFlag = record.get('enabledFlag');
          return [
            <span className="action-link" key="action">
              <a onClick={() => this.handleEditCustomer(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a key="remark" onClick={() => this.remarkRules(record)}>
                {intl.get('hiop.customerInfo.title.remarkRules').d('备注规则')}
              </a>
              <a
                onClick={() => this.handleEnabledFlag(record)}
                style={{ color: curFlag === 0 ? 'green' : 'gray' }}
              >
                {curFlag === 0
                  ? intl.get('hzero.common.button.enable').d('启用')
                  : intl.get('hzero.common.button.disable').d('禁用')}
              </a>
            </span>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 导入
   */
  @Bind()
  async handleImport() {
    const code = 'HIOP.INFORMATION_MAKE_INVOICE';
    const { queryDataSet } = this.props.customerInfoListDS;
    const companyCode = queryDataSet && queryDataSet.current?.get('companyCode');
    const employeeNum = queryDataSet && queryDataSet.current?.get('employeeNum');
    const params = {
      companyCode,
      employeeNum,
      tenantId,
    };
    await closeTab(`/himp/commentImport/${code}`);
    if (companyCode) {
      const argsParam = JSON.stringify(params);
      openTab({
        key: `/himp/commentImport/${code}`,
        title: intl.get('hzero.common.button.import').d('导入'),
        search: queryString.stringify({
          prefixPath: API_PREFIX,
          action: intl.get('hiop.customerInfo.view.commodityImport').d('客户信息维护导入'),
          tenantId,
          args: argsParam,
        }),
      });
    }
  }

  /**
   * 导出条件
   */
  @Bind()
  handleGetQueryParams() {
    const queryParams =
      this.props.customerInfoListDS.queryDataSet!.map((data) => data.toData(true)) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    const exportParams = { ...queryParams[0] } || {};
    return exportParams;
  }

  render() {
    return (
      <>
        <Header title={intl.get('hiop.customerInfo.title.customerInfo').d('客户信息维护')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/goods-mapping-main/export`}
            queryParams={() => this.handleGetQueryParams()}
          />
          <Button onClick={() => this.handleImport()}>
            {intl.get('hzero.common.button.import').d('导入')}
          </Button>
        </Header>
        <Content>
          <Table
            key="customer"
            dataSet={this.props.customerInfoListDS}
            columns={this.columns}
            queryFieldsLimit={4}
            buttons={this.buttons}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
