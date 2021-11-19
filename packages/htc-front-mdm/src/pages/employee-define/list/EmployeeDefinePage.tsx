/**
 * page - 公司列表入口页面
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-06-29
 * @LastEditeTime: 2020-06-29
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import queryString from 'query-string';
import {
  ColumnAlign,
  ColumnLock,
  TableButtonType,
  TableCommandType,
  TableEditMode,
} from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Button, DataSet, Dropdown, Icon, Menu, Modal, Table, Tooltip } from 'choerodon-ui/pro'; // Lov
import { openTab, closeTab } from 'utils/menuTab';
import { saveAndCreateAccount, batchForbiddenEmployee } from '@src/services/employeeDefineService';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { enableRender } from 'utils/renderer'; // yesOrNoRender
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import querystring from 'querystring';
import commonConfig from '@common/config/commonConfig';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import employeeDefendDS from '../stores/employeeDefineDS';

const modelCode = 'hmdm.company-list';
const modalKey = Modal.key();
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.MDM_API || '';

interface CompanyListPageProps {
  dispatch: Dispatch<any>;
  tableDS: DataSet;
}

@withProps(
  () => {
    const tableDS = new DataSet({
      autoQuery: false,
      ...employeeDefendDS(),
    });
    return { tableDS };
  },
  { cacheState: true }
)
@connect()
export default class CompanyListPage extends Component<CompanyListPageProps> {
  componentDidMount() {
    const { queryDataSet } = this.props.tableDS;
    if (queryDataSet && queryDataSet.current) {
      const companyId = queryDataSet.current!.get('companyId');
      if (companyId) {
        this.props.tableDS.query(this.props.tableDS.currentPage);
      }
    }
  }

  /**
   * 新增
   * @returns
   */
  @Bind()
  handleAddLine() {
    const { queryDataSet } = this.props.tableDS;
    this.props.tableDS.create({}, 0);
    this.props.tableDS.current!.set({
      attachmentUuid: uuidv4(),
      companyName: queryDataSet ? queryDataSet.records[0].get('companyName') : '',
      companyId: queryDataSet ? queryDataSet.records[0].get('companyId') : '',
    });
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const AddBtn = observer((props: any) => {
      let isDisabled = true;
      if (props.dataSet) {
        const { queryDataSet } = props.dataSet;
        if (queryDataSet && queryDataSet.current) {
          isDisabled = !queryDataSet.current!.get('companyId');
        }
      }
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
    const CreateBtn = observer((props: any) => {
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
      <AddBtn
        key="add"
        onClick={() => this.handleAddLine()}
        dataSet={this.props.tableDS}
        title={intl.get('hzero.common.button.assetChange').d('添加')}
      />,
      TableButtonType.delete,
      <CreateBtn
        key="certifiedDetails"
        onClick={() => this.handleCreateAccountButton()}
        dataSet={this.props.tableDS}
        title={intl.get('hzero.common.button.createAccount').d('新建账户')}
      />,
    ];
  }

  /**
   * 处理保存事件
   */
  @Bind()
  async handleSave(record) {
    const validateValue = await this.props.tableDS.validate(false, false);
    if (!validateValue) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
      return;
    }
    const res = await this.props.tableDS.submit();
    if (res === undefined) {
      notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.noChange').d('请先修改数据'),
      });
    } else if (res && res.failed && res.message) {
      throw new Error(res);
    } else {
      const params = {
        organizationId: tenantId,
        employeeInfosList: [record],
      };
      await batchForbiddenEmployee(params);
      await this.props.tableDS.query();
    }
  }

  /**
   * 禁用/启用
   *
   * @param {*} [params={}]
   * @memberof FileAggregate
   */
  @Bind()
  handleEnableFlag(records) {
    if (records.enabledFlag === 0) {
      // 禁用转启用，单据状态为禁用时显示，点击按钮直接将单据状态更新为启用
      this.props.tableDS.current!.set({ enabledFlag: 1 });
      this.handleSave(records);
    } else {
      const title = intl.get(`${modelCode}.view.disableConfirm`).d('确认禁用？');
      Modal.confirm({
        key: modalKey,
        title,
      }).then((button) => {
        if (button === 'ok') {
          this.props.tableDS.current!.set({ enabledFlag: 0 });
          this.handleSave(records);
        }
      });
    }
  }

  /**
   * 获取FilterForm的值
   */
  @Bind
  getFilterFormValues() {
    const selectList = this.props.tableDS.selected.map((item) => item.toData());
    const selectRowKeys = selectList.map((item) => item.archivesId);
    const exportParam = selectRowKeys
      ? {
          archivesIdList: selectRowKeys.join(','),
        }
      : {
          archivesIdList: null,
        };
    return exportParam;
  }

  /**
   * 导出条件
   */
  @Bind()
  handleGetQueryParams() {
    const queryParams = this.props.tableDS.queryDataSet!.map((data) => data.toData()) || {};
    const exportParams = { ...queryParams[0] } || {};
    return exportParams;
  }

  /**
   * 导入
   */
  @Bind()
  async handleImport() {
    const code = 'HMDM.EMPLOYEE';
    const { queryDataSet } = this.props.tableDS;
    const companyCode = queryDataSet && queryDataSet.current?.get('companyCode');
    const params = {
      companyCode,
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
          action: intl.get(`${modelCode}.view.employeeImport`).d('员工导入'),
          args: argsParam,
        }),
      });
    }
  }

  /**
   * 员工信息维护批量创建或更新
   */
  @Bind()
  async handleSaveAndCreateAccount(record) {
    const res = getResponse(
      await saveAndCreateAccount({
        organizationId: tenantId,
        employeeInfosList: [record],
      })
    );
    if (res && res.data) {
      notification.success({
        description: '',
        message: res && res.message,
      });
      // this.props.tableDS.query();
      this.props.tableDS.unSelectAll();
    }
  }

  /**
   * 员工信息维护批量创建或更新【按钮】
   */
  @Bind()
  async handleCreateAccountButton() {
    const employeeInfosList = this.props.tableDS.selected.map((rec) => rec.toData());
    const res = getResponse(
      await saveAndCreateAccount({
        organizationId: tenantId,
        employeeInfosList,
      })
    );
    if (res && res.data) {
      notification.success({
        description: '',
        message: res && res.message,
      });
      // this.props.tableDS.query();
      this.props.tableDS.unSelectAll();
    }
  }

  // 修改手机号（跳转）
  @Bind()
  handlePhoneModify(record) {
    const companyId = record.get('companyId');
    const mobile = record.get('mobile');
    const email = record.get('email');
    const companyCode = record.get('companyCode');
    const companyName = record.get('companyName');
    const companyDesc = `${companyCode || ''}-${companyName || ''}`;
    const phoneInfo = { email, companyDesc };
    const pathname = `/htc-front-mdm/employee-define/mobile/${companyId}/${mobile}`;
    this.props.dispatch(
      routerRedux.push({
        pathname,
        search: querystring.stringify({
          phoneInfo: encodeURIComponent(JSON.stringify(phoneInfo)),
        }),
      })
    );
  }

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.order`).d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      {
        name: 'companyName',
        width: 200,
        renderer: ({ value }) => {
          return (
            <Tooltip placement="topLeft" title={value}>
              <span>{value}</span>
            </Tooltip>
          );
        },
      },
      { name: 'employeeTypeCode', editor: true },
      { name: 'employeeNum', editor: (record) => isNaN(record.get('employeeId')) },
      { name: 'employeeName', editor: true },
      { name: 'internationalTelCode', width: 130, editor: true },
      { name: 'mobile', width: 130, editor: (record) => isNaN(record.get('employeeId')) },
      { name: 'email', width: 130, editor: true },
      { name: 'status', editor: true },
      { name: 'rolesObject', editor: true, width: 200 },
      { name: 'enabledFlag', width: 90, renderer: ({ value }) => enableRender(value) },
      {
        name: 'department',
        width: 130,
        editor: true,
        renderer: ({ value }) => {
          return (
            <Tooltip placement="topLeft" title={value}>
              <span>{value}</span>
            </Tooltip>
          );
        },
      },
      { name: 'startDate', width: 110, editor: true },
      { name: 'endDate', width: 110, editor: true },
      // 第一阶段暂时不显示
      // {
      //   name: 'caseProductFlag',
      //   width: 90,
      //   editor: true,
      //   renderer: ({ value }) => yesOrNoRender(Number(value)),
      // },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 180,
        command: ({ record }): Commands[] => {
          const curFlag = record.get('enabledFlag');
          const records = record.toData();

          const operators = [
            {
              key: 'saveAndCreate',
              ele: (
                <a onClick={() => this.handleSaveAndCreateAccount(records)}>
                  {intl.get(`${modelCode}.button.saveAndCreate`).d('新建账户')}
                </a>
              ),
              len: 6,
              title: intl.get(`${modelCode}.button.saveAndCreate`).d('新建账户'),
            },
            {
              key: 'phoneModify',
              ele: (
                <a onClick={() => this.handlePhoneModify(record)}>
                  {intl.get(`${modelCode}.button.phoneModify`).d('修改手机号')}
                </a>
              ),
              len: 6,
              title: intl.get(`${modelCode}.button.phoneModify`).d('修改手机号'),
            },
          ];
          const btnMenu = (
            <Menu>
              {operators.map((action) => {
                const { key } = action;
                return <Menu.Item key={key}>{action.ele}</Menu.Item>;
              })}
            </Menu>
          );
          return [
            TableCommandType.edit,
            <Button
              key="disable"
              onClick={() => this.handleEnableFlag(records)}
              style={{ marginRight: '7px' }}
            >
              {curFlag === 0
                ? intl.get('hzero.common.status.enableFlag').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')}
            </Button>,
            <Dropdown overlay={btnMenu}>
              <a>
                {intl.get('hzero.common.button.action').d('操作')}
                <Icon type="arrow_drop_down" />
              </a>
            </Dropdown>,
          ];
        },
        // renderer: ({ record }) => this.optionsRender(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  render() {
    const ImportBtn = observer((props: any) => {
      let isDisabled = true;
      if (props.dataSet) {
        const { queryDataSet } = props.dataSet;
        const companyId = queryDataSet && queryDataSet.current?.get('companyId');
        if (companyId) isDisabled = false;
      }
      return (
        <Button key={props.key} onClick={props.onClick} disabled={isDisabled}>
          {props.title}
        </Button>
      );
    });
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('员工信息维护')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/employee-infos/export`}
            queryParams={() => this.handleGetQueryParams()}
          />
          <ImportBtn
            key="import"
            onClick={() => this.handleImport()}
            dataSet={this.props.tableDS}
            title={intl.get(`${modelCode}.button.import`).d('导入')}
          />
        </Header>
        <Content>
          <Table
            queryFieldsLimit={3}
            dataSet={this.props.tableDS}
            columns={this.columns}
            editMode={TableEditMode.inline}
            buttons={this.buttons}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
