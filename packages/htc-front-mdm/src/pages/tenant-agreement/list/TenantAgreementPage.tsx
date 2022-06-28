/**
 * @Description: 租户协议维护页面
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-09
 * @LastEditeTime: 2020-07-09
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { Bind } from 'lodash-decorators';
import ExcelExport from 'components/ExcelExport';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { isUndefined } from 'util';
import commonConfig from '@htccommon/config/commonConfig';
import {
  ColumnAlign,
  ColumnLock,
  TableButtonType,
  TableCommandType,
  TableEditMode,
} from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Button, DataSet, Table } from 'choerodon-ui/pro';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { RouteComponentProps } from 'react-router-dom';
import { openTab } from 'utils/menuTab';
import tenantAgreementDS from '../stores/TenantAgreementDS';

const modelCode = 'hmdm.tenant-agreement';
const API_PREFIX = commonConfig.MDM_API || '';

interface TenantAgreementPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
}

@connect()
export default class TenantAgreementPage extends Component<TenantAgreementPageProps> {
  tableDS = new DataSet({
    autoQuery: true,
    ...tenantAgreementDS(),
  });

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    return [TableButtonType.add, TableButtonType.delete];
  }

  /**
   * 进入详情
   * @params {object} record-行记录
   */
  @Bind()
  async handleShowDetial(record) {
    const agreementId = record.get('agreementId');
    const tenantId = record.get('tenantId');
    const { history } = this.props;
    const pathname = `/htc-front-mdm/tenant-agreement/detail/${tenantId}/${agreementId}`;
    history.push(pathname);
    // dispatch(
    //   routerRedux.push({
    //     pathname,
    //   })
    // );
  }

  /**
   * 获取FilterForm的值
   */
  @Bind
  getFilterFormValues() {
    const selectList = this.tableDS.selected.map((item) => item.toData());
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
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      { name: 'tenantObject', width: 200, editor: true },
      { name: 'enableDate', width: 200, editor: true },
      { name: 'customerName', width: 200, editor: true },
      { name: 'tenantContacts', width: 200, editor: true },
      { name: 'email', width: 200, editor: true },
      { name: 'contactPhone', width: 200, editor: true },
      { name: 'startDate', width: 200, editor: true },
      { name: 'endDate', width: 200, editor: true },
      { name: 'billDay', width: 200, editor: true },
      { name: 'billingCycle', width: 200, editor: true },
      { name: 'billingModelCode', width: 200, editor: true },
      { name: 'invoiceModelCode', width: 200, editor: true },
      { name: 'settlementModelCode', width: 200, editor: true },
      { name: 'contractNo', width: 200, editor: true },
      { name: 'parentProjectNumber', width: 200, editor: true },
      { name: 'childrenProjectNumber', width: 200, editor: true },
      { name: 'agreementNumber', width: 200, editor: true },
      { name: 'collectionBalance', width: 200, editor: true, align: ColumnAlign.right },
      { name: 'effectiveStatusCode', width: 200, editor: true },
      { name: 'remark', width: 200, editor: true },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 140,
        command: ({ record }): Commands[] => {
          const agreementId = record.get('agreementId');
          return [
            <Button
              key="detial"
              onClick={() => this.handleShowDetial(record)}
              disabled={isUndefined(agreementId)}
            >
              {intl.get('hzero.common.status.detial').d('明细')}
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
   * 导出
   */
  @Bind()
  exportParams() {
    const queryParams = this.tableDS.queryDataSet!.map((data) => data.toData()) || {};
    const { companyObj, ...otherData } = queryParams[0];
    const _queryParams = {
      ...companyObj,
      ...otherData,
    };
    return { ..._queryParams } || {};
  }

  /**
   * 导入
   */
  @Bind()
  async handleBatchExport() {
    const code = 'HMDM.TENANT_AGREEMENT';
    openTab({
      key: `/himp/commentImport/${code}`,
      title: intl.get('hzero.common.button.import').d('导入'),
    });
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('租户协议维护')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/tenant-agreementss/export`}
            queryParams={() => this.exportParams()}
          />
          <Button onClick={() => this.handleBatchExport()}>
            {intl.get(`${modelCode}.import`).d('导入')}
          </Button>
        </Header>
        <Content>
          <Table
            queryFieldsLimit={3}
            dataSet={this.tableDS}
            columns={this.columns}
            editMode={TableEditMode.inline}
            buttons={this.buttons}
          />
        </Content>
      </>
    );
  }
}
