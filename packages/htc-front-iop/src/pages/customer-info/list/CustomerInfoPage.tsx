/*
 * @Description:客户信息维护页面
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-08 10:16:35
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@common/config/commonConfig';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { openTab, closeTab } from 'utils/menuTab';
import queryString from 'query-string';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getCurrentEmployeeInfoOut } from '@common/services/commonService';
import {
  ColumnAlign,
  ColumnLock,
  TableButtonType,
  TableCommandType,
  TableEditMode,
} from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { Button, DataSet, Modal, Select, Table } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import InvoiceQueryTable from '@src/utils/invoice-query/InvoiceQueryTable';
import { batchSave } from '@src/services/customerService';
import CustomerInfoListDS from '../stores/CustomerInfoListDS';
import CommodityMapListDS from '../stores/CommodityMapListDS';
import RemarkRulesPage from './RemarkRulesPage';

const modelCode = 'hiop.customer-info';
const API_PREFIX = commonConfig.IOP_API || '';
const tenantId = getCurrentOrganizationId();

interface CommodityInfoPageProps {
  dispatch: Dispatch<any>;
  commodityMapListDS: DataSet;
  customerInfoListDS: DataSet;
}

@withProps(
  () => {
    const commodityMapListDS = new DataSet({
      autoQuery: false,
      ...CommodityMapListDS(),
    });
    const customerInfoListDS = new DataSet({
      autoQuery: false,
      ...CustomerInfoListDS(),
      children: {
        commodityMapList: commodityMapListDS,
      },
    });
    return { commodityMapListDS, customerInfoListDS };
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

  // 客户信息新增行
  @Bind()
  handleAddLine() {
    const { queryDataSet } = this.props.customerInfoListDS;
    const isEdit = this.props.customerInfoListDS.some((record) => record.getState('editing'));
    if (queryDataSet && !isEdit) {
      const record = this.props.customerInfoListDS.create(
        {
          companyId: queryDataSet.current?.get('companyId'),
          companyCode: queryDataSet.current?.get('companyCode'),
          employeeId: queryDataSet.current?.get('employeeId'),
          employeeNum: queryDataSet.current?.get('employeeNum'),
        },
        0
      );
      record.setState('editing', true);
    }
  }

  // 商品映射新增行
  @Bind()
  commodityAddLine() {
    const customerInformationId = this.props.customerInfoListDS.current!.get(
      'customerInformationId'
    );
    const companyId = this.props.customerInfoListDS.current!.get('companyId');
    const companyCode = this.props.customerInfoListDS.current!.get('companyCode');
    const customerCode = this.props.customerInfoListDS.current!.get('customerCode');
    const customerName = this.props.customerInfoListDS.current!.get('customerName');
    const invoiceType = this.props.customerInfoListDS.current!.get('invoiceType');
    if (customerInformationId) {
      this.props.commodityMapListDS.create(
        {
          companyId,
          companyCode,
          customerInformationId,
          customerCode,
          customerName,
          invoiceType,
        },
        0
      );
    } else {
      notification.info({
        description: '',
        message: intl.get(`${modelCode}.view.saveHeader`).d(`请先保存头数据！`),
      });
    }
  }

  // 分配
  @Bind()
  assignCommodity() {
    const { dispatch } = this.props;
    const { queryDataSet } = this.props.customerInfoListDS;
    const goodsMappingList = this.props.commodityMapListDS.selected.map((record) =>
      record.toData()
    );
    if (queryDataSet) {
      const companyCode = queryDataSet.current!.get('companyCode');
      const taxpayerNumber = queryDataSet.current!.get('taxpayerNumber');
      const customerInformationId = this.props.customerInfoListDS.current!.get(
        'customerInformationId'
      );
      const companyInfo = {
        companyCode,
        taxpayerNumber,
        goodsMappingList,
        customerInformationId,
      };
      dispatch(
        routerRedux.push({
          pathname: '/htc-front-iop/customer-info/assign-commodity',
          search: queryString.stringify({
            companyInfo: encodeURIComponent(JSON.stringify(companyInfo)),
          }),
        })
      );
    }
  }

  get buttons(): Buttons[] {
    const ObserverButtons = observer((props: any) => {
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
    return [
      <ObserverButtons
        key="add"
        onClick={() => this.handleAddLine()}
        dataSet={this.props.customerInfoListDS.queryDataSet}
        title={intl.get(`${modelCode}.button.add`).d('新增')}
      />,
      TableButtonType.delete,
    ];
  }

  get commodityBtn(): Buttons[] {
    const ObserverButtons = observer((props: any) => {
      const isDisabled = props.dataSet.length === 0;
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
    const DistributionBtn = observer((props: any) => {
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
      <ObserverButtons
        key="add"
        onClick={() => this.commodityAddLine()}
        dataSet={this.props.customerInfoListDS}
        title={intl.get(`${modelCode}.button.add`).d('新增')}
      />,
      TableButtonType.delete,
      <DistributionBtn
        key="distribution"
        onClick={() => this.assignCommodity()}
        dataSet={this.props.commodityMapListDS}
        title={intl.get(`${modelCode}.button.distribution`).d('分配')}
      />,
    ];
  }

  // 开票企业模糊查询赋值
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

  // 开票信息查询
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
        title: intl.get(`${modelCode}.invoiceQuery.title`).d('开票信息查询'),
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
   */
  @Bind()
  remarkRules(record) {
    const customerInformationId = record.get('customerInformationId');
    const modal = Modal.open({
      key: Modal.key(),
      title: intl.get(`${modelCode}.invoiceQuery.title`).d('备注规则'),
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
   */
  @Bind()
  handleEnabledFlag(record, type) {
    if (record.get('enabledFlag') === 0) {
      record.set({ enabledFlag: 1 });
      if (type === 0) {
        this.props.customerInfoListDS.submit();
      } else {
        this.props.commodityMapListDS.submit();
      }
    } else {
      const title = intl.get(`${modelCode}.view.disableConfirm`).d('确认禁用？');
      Modal.confirm({
        key: Modal.key,
        title,
      }).then((button) => {
        if (button === 'ok') {
          record.set({ enabledFlag: 0 });
          if (type === 0) {
            this.props.customerInfoListDS.submit();
          } else {
            this.props.commodityMapListDS.submit();
          }
        }
      });
    }
  }

  // 保存
  @Bind()
  async handleSave(record) {
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
          this.props.customerInfoListDS.query();
        } else {
          Modal.confirm({
            key: Modal.key,
            title: res && res.message,
            okText: '继续',
          }).then(async (button) => {
            if (button === 'ok') {
              const secParams = {
                tenantId,
                checkDataSameFlag: '0',
                data,
              };
              const secRes = getResponse(await batchSave(secParams));
              if (secRes) {
                notification.success({
                  description: '',
                  message: intl.get(`${modelCode}.view.saveHeader`).d(`操作成功`),
                });
              }
              this.props.customerInfoListDS.query();
            } else {
              this.handleCancel(record);
            }
          });
        }
      }
    }
  }

  // 取消
  @Bind()
  handleCancel(record) {
    if (record.status === 'add') {
      this.props.customerInfoListDS.remove(record);
    } else {
      record.reset();
      record.setState('editing', false);
    }
  }

  // 编辑
  @Bind()
  handleEdit(record) {
    this.props.customerInfoListDS.forEach((item) => {
      if (item.getState('editing')) {
        this.handleCancel(item);
      }
    });
    record.setState('editing', true);
  }

  /**
   * 客户信息
   */
  get columns(): ColumnProps[] {
    return [
      { name: 'customerCode', width: 120, editor: (record) => record.getState('editing') },
      { name: 'enterpriseType', width: 120, editor: (record) => record.getState('editing') },
      { name: 'systemCustomerName', width: 180, editor: (record) => record.getState('editing') },
      {
        name: 'customerName',
        width: 300,
        editor: (record) =>
          record.getState('editing') && (
            <Select
              searchable
              searchMatcher="receiptName"
              combo
              checkValueOnOptionsChange={false}
              onChange={(value, oldValue) => this.handleReceiptNameChange(value, oldValue, record)}
              suffix={<Icon type="search" onClick={() => this.handleInvoiceQuery(record)} />}
            />
          ),
        renderer: ({ value, text }) => text || value,
      },
      {
        name: 'customerTaxpayerNumber',
        width: 200,
        editor: (record) => record.getState('editing'),
      },
      { name: 'customerAddressPhone', width: 200, editor: (record) => record.getState('editing') },
      { name: 'bankNumber', editor: (record) => record.getState('editing'), width: 200 },
      { name: 'qualifiedAuditorObj', width: 280, editor: (record) => record.getState('editing') },
      { name: 'extNumberObj', editor: (record) => record.getState('editing') },
      { name: 'invoiceType', width: 150, editor: (record) => record.getState('editing') },
      {
        name: 'invoiceLimitAmount',
        editor: (record) => record.getState('editing'),
        align: ColumnAlign.right,
      },
      { name: 'taxIncludedFlag', editor: (record) => record.getState('editing') },
      { name: 'billFlag', editor: (record) => record.getState('editing') },
      {
        name: 'electronicReceiverInfo',
        editor: (record) => record.getState('editing'),
        width: 150,
      },
      {
        name: 'paperTicketReceiverName',
        width: 120,
        editor: (record) => record.getState('editing'),
      },
      {
        name: 'paperTicketReceiverPhone',
        width: 120,
        editor: (record) => record.getState('editing'),
      },
      {
        name: 'paperTicketReceiverAddress',
        width: 120,
        editor: (record) => record.getState('editing'),
      },
      { name: 'enabledFlag', renderer: ({ value }) => enableRender(value) },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 220,
        command: ({ record }): Commands[] => {
          const curFlag = record.get('enabledFlag');
          const editing = record.getState('editing');
          if (editing) {
            return [
              <Button
                key="save"
                icon="finished"
                color={ButtonColor.primary}
                onClick={() => this.handleSave(record)}
              />,
              <Button
                key="cancel"
                icon="not_interested"
                color={ButtonColor.primary}
                onClick={() => this.handleCancel(record)}
              />,
            ];
          } else {
            return [
              <Button key="remark" onClick={() => this.remarkRules(record)}>
                {intl.get('hzero.common.button.remarkRule').d('备注规则')}
              </Button>,
              <Button key="disable" onClick={() => this.handleEnabledFlag(record, 0)}>
                {curFlag === 0
                  ? intl.get('hzero.common.status.enableFlag').d('启用')
                  : intl.get('hzero.common.status.disable').d('禁用')}
              </Button>,
              <Button
                key="edit"
                icon="mode_edit"
                color={ButtonColor.primary}
                onClick={() => this.handleEdit(record)}
              />,
            ];
          }
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 商品映射
   */
  get commodityColumns(): ColumnProps[] {
    return [
      { name: 'projectObj', editor: true },
      { name: 'projectName', width: 150 },
      { name: 'issueName', editor: true },
      { name: 'taxRateObj', editor: true },
      { name: 'model', editor: true },
      { name: 'invoiceType', editor: true },
      { name: 'goodsUnit', editor: true },
      { name: 'goodsUnitPrice', editor: true },
      { name: 'enabledFlag', renderer: ({ value }) => enableRender(value) },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 150,
        command: ({ record }): Commands[] => {
          const curFlag = record.get('enabledFlag');
          return [
            <Button key="disable" onClick={() => this.handleEnabledFlag(record, 1)}>
              {curFlag === 0
                ? intl.get('hzero.common.status.enableFlag').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')}
            </Button>,
            TableCommandType.edit,
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
          action: intl.get(`${modelCode}.view.commodityImport`).d('客户信息维护导入'),
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
    const exportParams = { ...queryParams[0] } || {};
    return exportParams;
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('客户信息维护')}>
          <Button onClick={() => this.handleImport()}>
            {intl.get(`${modelCode}.import`).d('导入')}
          </Button>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/goods-mapping-main/export`}
            queryParams={() => this.handleGetQueryParams()}
          />
        </Header>
        <Content>
          <Table
            key="customer"
            dataSet={this.props.customerInfoListDS}
            columns={this.columns}
            queryFieldsLimit={4}
            buttons={this.buttons}
            // editMode={TableEditMode.inline}
            style={{ height: 200 }}
          />
          <Table
            key="commodityMap"
            dataSet={this.props.commodityMapListDS}
            columns={this.commodityColumns}
            buttons={this.commodityBtn}
            editMode={TableEditMode.inline}
            style={{ height: 200 }}
          />
        </Content>
      </>
    );
  }
}
