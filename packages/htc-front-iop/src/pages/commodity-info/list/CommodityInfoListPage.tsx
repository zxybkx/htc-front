/**
 * @Description:开票商品页面
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-23 15:31:45
 * @LastEditTime: 2021-03-04 16:10:46
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { Tag } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
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
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import ExcelExport from 'components/ExcelExport';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import commonConfig from '@htccommon/config/commonConfig';
import { openTab } from 'utils/menuTab';
import queryString from 'query-string';
import { initCommodity } from '@src/services/commodityInfoService';
import CommodityListDS from '../stores/CommodityListDS';

const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IOP_API || '';

interface CommodityInfoPageProps {}
@formatterCollections({
  code: ['hiop.invoiceWorkbench', 'htc.common', 'hiop.invoiceReq', 'hiop.commodityInfo'],
})
export default class CommodityInfoListPage extends Component<CommodityInfoPageProps> {
  tableDS = new DataSet({
    autoQuery: false,
    ...CommodityListDS(),
  });

  async componentDidMount() {
    console.log("123");
    const res = await getCurrentEmployeeInfoOut({ tenantId });
    if (res && res.content) {
      const empInfo = res.content[0];
      const { queryDataSet } = this.tableDS;
      if (queryDataSet) {
        queryDataSet.current!.set({ companyObj: empInfo });
        this.tableDS.query();
      }
    }
  }

  /**
   * 禁用/启用
   * @params {object} record - 行记录
   */
  @Bind()
  handleEnabledFlag(record) {
    if (record.get('enabledFlag') === 0) {
      record.set({ enabledFlag: 1 });
      this.tableDS.submit();
    } else {
      const title = intl.get('htc.common.notification.disableConfirm').d('确认禁用？');
      Modal.confirm({
        key: Modal.key,
        title,
      }).then(button => {
        if (button === 'ok') {
          record.set({ enabledFlag: 0 });
          this.tableDS.submit();
        }
      });
    }
  }

  /**
   * 初始化商品信息
   */
  @Bind()
  async handleInitCommodity() {
    const { queryDataSet } = this.tableDS;
    if (!queryDataSet) return;
    const companyId = queryDataSet.current!.get('companyId');
    const taxpayerNumber = queryDataSet.current!.get('taxpayerNumber');
    if (this.tableDS.dirty) {
      notification.warning({
        description: '',
        message: intl.get('hadm.ruleConfig.view.message.confirmSave').d(`请先保存数据！`),
      });
      return;
    }
    const title = intl.get('hiop.commodityInfo.title.initializeProductInfo').d('初始化商品信息');
    const confirm = await Modal.confirm({
      key: Modal.key,
      title,
      children: (
        <div>
          <p>
            {intl
              .get('hiop.commodityInfo.message.initConfirmDesc')
              .d('初始化商品信息将会刷新全部税务服务服务商接口数据，是否确认？')}
          </p>
        </div>
      ),
    });
    if (confirm === 'ok') {
      const res = getResponse(await initCommodity({ tenantId, companyId, taxpayerNumber }));
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        this.tableDS.query();
      }
    }
  }

  /**
   * 新增商品行
   */
  @Bind()
  handleAddCommodity() {
    const { queryDataSet } = this.tableDS;
    if (queryDataSet) {
      const record = this.tableDS.create({ companyId: queryDataSet.current?.get('companyId') }, 0);
      this.openModal(record, true);
    }
  }

  /**
   * 删除商品
   */
  @Bind()
  handleDeleteCommodity() {
    const record = this.tableDS.selected;
    this.tableDS.delete(record);
  }

  /**
   * 保存商品
   * @params {object} modal
   * @params {number} type 0-保存 1-保存并新建
   */
  @Bind()
  async handleSaveCommodity(modal, type) {
    const res = await this.tableDS.submit();
    if (res && res.content) {
      modal.close();
      if (type === 1) {
        this.handleAddCommodity();
      }
    }
  }

  /**
   * Modal取消
   */
  @Bind()
  handleCancelModal(record, modal, isNew) {
    if (isNew) {
      this.tableDS.remove(record);
    } else {
      this.tableDS.reset();
    }
    modal.close();
  }

  /**
   * 保存商品
   * @params {object} record-行记录
   * @params {boolean} isNew true-新建 false-编辑
   */
  @Bind()
  openModal(record, isNew) {
    const modal = Modal.open({
      title: isNew
        ? intl.get('hiop.commodityInfo.title.commodityAdd').d('新建开票商品信息')
        : intl.get('hiop.commodityInfo.title.commodityEdit').d('编辑开票商品信息'),
      drawer: true,
      children: (
        <Form record={record} labelTooltip={Tooltip.overflow} style={{ marginRight: 10 }}>
          <TextField name="projectNumber" />
          <TextField name="projectName" />
          <TextField name="model" />
          <TextField name="projectUnit" />
          <Currency name="projectUnitPrice" />
          <Lov name="commodityObj" />
          <TextField name="commodityName" />
          <TextField name="commodityServiceCateCode" />
          <Select name="taxRate" />
          <Select name="zeroTaxRateFlag" />
          <TextField name="specialManagementVat" />
          <Switch name="enabledFlag" />
        </Form>
      ),
      footer: (
        <div>
          <Button color={ButtonColor.primary} onClick={() => this.handleSaveCommodity(modal, 0)}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {isNew && (
            <Button onClick={() => this.handleSaveCommodity(modal, 1)}>
              {intl.get('htc.common.button.saveAndCreate').d('保存并新建')}
            </Button>
          )}
          <Button onClick={() => this.handleCancelModal(record, modal, isNew)}>
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
    const ObserverButtons = observer((props: any) => {
      const isDisabled = !(props.dataSet && props.dataSet.current?.get('companyId'));
      const { condition } = props;
      return (
        <Button
          key={props.key}
          icon={props.icon}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={condition ? ButtonColor.default : ButtonColor.primary}
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
        icon="add"
        onClick={() => this.handleAddCommodity()}
        dataSet={this.tableDS.queryDataSet}
        title={intl.get('hzero.common.button.add').d('新增')}
      />,
      <ObserverButtons
        key="initComd"
        onClick={() => this.handleInitCommodity()}
        dataSet={this.tableDS.queryDataSet}
        title={intl.get('hiop.commodityInfo.button.initializeProductInfo').d('初始化商品信息')}
        condition="initComd"
      />,
      <DeleteButtons
        key="delete"
        onClick={() => this.handleDeleteCommodity()}
        dataSet={this.tableDS}
        title={intl.get('hzero.common.button.delete').d('删除')}
      />,
    ];
  }

  /**
   * 编辑商品信息
   * @params {object} record-行记录
   */
  @Bind()
  handleEditCommodity(record) {
    this.openModal(record, false);
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        name: 'projectNumber',
        width: 220,
        renderer: ({ value, record }) => {
          const enabledFlag = record?.get('enabledFlag');
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
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {enabledText}
              </Tag>
              <span>{value}</span>
            </>
          );
        },
      },
      { name: 'sourceCode', width: 200 },
      // { name: 'projectNumber', width: 180 },
      { name: 'projectName', width: 300 },
      { name: 'originSpId', width: 120 },
      { name: 'model', width: 200 },
      { name: 'projectUnit' },
      { name: 'projectUnitPrice', width: 150 },
      { name: 'commodityObj', width: 180 },
      { name: 'commodityName', width: 180 },
      { name: 'commodityServiceCateCode', width: 180 },
      { name: 'taxRate', width: 150 },
      { name: 'preferentialPolicyFlag', width: 120 },
      {
        name: 'zeroTaxRateFlag',
        width: 130,
      },
      { name: 'specialManagementVat', width: 140 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        command: ({ record }): Commands[] => {
          const curFlag = record.get('enabledFlag');
          return [
            <span className="action-link" key="action">
              <a onClick={() => this.handleEditCommodity(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
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
   * 导出条件
   */
  @Bind()
  handleGetQueryParams() {
    const queryParams = this.tableDS.queryDataSet!.map(data => data.toData(true)) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    return { ...queryParams[0] } || {};
  }

  /**
   * 导入
   */
  @Bind()
  handleImport() {
    const code = 'HIOP.COMMODITY';
    openTab({
      key: `/himp/commentImport/${code}`,
      title: intl.get('hzero.common.button.import').d('导入'),
      search: queryString.stringify({
        prefixPath: API_PREFIX,
        action: intl.get('hiop.commodityInfo.view.commodityImport').d('开票商品管理导入'),
        tenantId,
      }),
    });
  }

  render() {
    return (
      <>
        <Header title={intl.get('hiop.commodityInfo.title.commodityManage').d('开票商品管理')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/commodity-list-infos/export`}
            queryParams={() => this.handleGetQueryParams()}
          />
          <Button onClick={() => this.handleImport()}>
            {intl.get('hzero.common.button.import').d('导入')}
          </Button>
        </Header>
        <Content>
          <Table
            key="commodity"
            dataSet={this.tableDS}
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
