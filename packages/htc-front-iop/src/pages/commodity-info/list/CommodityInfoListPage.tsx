/*
 * @Descripttion:开票商品页面
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
import { Header, Content } from 'components/Page';
import {
  TableButtonType,
  TableEditMode,
  TableCommandType,
  ColumnLock,
  ColumnAlign,
} from 'choerodon-ui/pro/lib/table/enum';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import ExcelExport from 'components/ExcelExport';
import { getCurrentEmployeeInfoOut } from '@common/services/commonService';
import commonConfig from '@common/config/commonConfig';
import { openTab } from 'utils/menuTab';
import queryString from 'query-string';
import { initCommodity } from '@src/services/commodityInfoService';
import CommodityListDS from '../stores/CommodityListDS';

const modelCode = 'hiop.commodity-info';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IOP_API || '';

interface CommodityInfoPageProps {}
@formatterCollections({
  code: [modelCode],
})
export default class CommodityInfoPage extends Component<CommodityInfoPageProps> {
  tableDS = new DataSet({
    autoQuery: false,
    ...CommodityListDS(),
  });

  async componentDidMount() {
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
   */
  @Bind()
  handleEnabledFlag(record) {
    if (record.get('enabledFlag') === 0) {
      record.set({ enabledFlag: 1 });
      this.tableDS.submit();
    } else {
      const title = intl.get(`${modelCode}.view.disableConfirm`).d('确认禁用？');
      Modal.confirm({
        key: Modal.key,
        title,
      }).then((button) => {
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
        message: intl.get(`${modelCode}.view.saveCommodity`).d(`请先保存数据！`),
      });
      return;
    }
    const title = intl.get(`${modelCode}.view.initConfirm`).d('初始化商品信息');
    const confirm = await Modal.confirm({
      key: Modal.key,
      title,
      children: (
        <div>
          <p>
            {intl
              .get(`${modelCode}.view.initConfirmDesc`)
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

  // 新增行
  @Bind()
  handleAddLine() {
    const { queryDataSet } = this.tableDS;
    if (queryDataSet) {
      this.tableDS.create({ companyId: queryDataSet.current?.get('companyId') }, 0);
    }
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
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
        dataSet={this.tableDS.queryDataSet}
        title={intl.get(`${modelCode}.button.add`).d('新增')}
      />,
      TableButtonType.delete,
      <ObserverButtons
        key="initComd"
        onClick={() => this.handleInitCommodity()}
        dataSet={this.tableDS.queryDataSet}
        title={intl.get(`${modelCode}.button.initComd`).d('初始化商品信息')}
      />,
    ];
  }

  /**
   * 商品明细信息
   */
  get columns(): ColumnProps[] {
    return [
      { name: 'sourceCode', width: 200 },
      { name: 'originSpId', width: 120 },
      { name: 'projectNumber', width: 180, editor: true },
      { name: 'projectName', width: 300, editor: true },
      { name: 'model', width: 200, editor: true },
      { name: 'projectUnit', editor: true },
      { name: 'projectUnitPrice', editor: true, width: 150, align: ColumnAlign.right },
      { name: 'commodityObj', width: 180, editor: true },
      { name: 'commodityName', width: 180 },
      { name: 'commodityServiceCateCode', width: 180 },
      { name: 'taxRate', editor: true, width: 150, align: ColumnAlign.right },
      { name: 'preferentialPolicyFlag', width: 120 },
      {
        name: 'zeroTaxRateFlag',
        width: 130,
        editor: true,
      },
      { name: 'specialManagementVat', width: 140 },
      { name: 'enabledFlag', renderer: ({ value }) => enableRender(value) },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        command: ({ record }): Commands[] => {
          const curFlag = record.get('enabledFlag');
          return [
            <Button key="disable" onClick={() => this.handleEnabledFlag(record)}>
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
   * 导出条件
   */
  @Bind()
  handleGetQueryParams() {
    const queryParams = this.tableDS.queryDataSet!.map((data) => data.toData(true)) || {};
    const exportParams = { ...queryParams[0] } || {};
    return exportParams;
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
        action: intl.get(`${modelCode}.view.commodityImport`).d('开票商品管理导入'),
        tenantId,
      }),
    });
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('开票商品管理')}>
          <Button onClick={() => this.handleImport()}>
            {intl.get(`${modelCode}.import`).d('导入')}
          </Button>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/commodity-list-infos/export`}
            queryParams={() => this.handleGetQueryParams()}
          />
        </Header>
        <Content>
          <Table
            key="commodity"
            dataSet={this.tableDS}
            columns={this.columns}
            queryFieldsLimit={4}
            buttons={this.buttons}
            editMode={TableEditMode.inline}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
