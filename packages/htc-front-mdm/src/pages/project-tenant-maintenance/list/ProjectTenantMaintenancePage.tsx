/**
 * @Description: 项目费用分摊
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-03-28 9:45:22
 * @LastEditTime: 2022-06-20 17:20:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import ExcelExport from 'components/ExcelExport';
import queryString from 'query-string';
import { Content, Header } from 'components/Page';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Button, DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { openTab } from 'utils/menuTab';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import costSharingListDS from '../stores/TenantMaintenanceListDS';

const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.MDM_API || '';
const modelCode = 'hmdm.company-list';

interface CostSharingListPageProps {
  dispatch: Dispatch<any>;
}
export default class ProjectTenantMaintenancePage extends Component<CostSharingListPageProps> {
  tableDS = new DataSet({
    autoQuery: true,
    ...costSharingListDS(),
  });

  @Bind()
  create() {
    const record = this.tableDS.create({}, 0);
    record.setState('editing', true);
  }

  /**
   * 项目租户维护保存
   */
  @Bind()
  handleSave() {
    this.tableDS.submit();
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? record.index + 1 : '';
        },
      },
      { name: 'tenantObject', width: 200, editor: true },
      { name: 'projectNumber', width: 150, editor: true },
      { name: 'projectName', width: 150, editor: true },
      { name: 'associationStartDate', width: 150, editor: true },
      { name: 'associationEndDate', width: 150, editor: true },
      { name: 'deliveryDocker', width: 150, editor: true },
      { name: 'dockerContact', width: 200, editor: true },
      { name: 'administrator', width: 150, editor: true },
      { name: 'adminEmail', width: 250, editor: true },
      { name: 'termination', editor: true },
      { name: 'enabledFlag', editor: true },
    ];
  }

  /**
   * 导入
   */
  @Bind()
  handleImport() {
    const code = 'HMDM.PROJECT_TENANT';
    openTab({
      key: `/himp/commentImport/${code}`,
      title: intl.get('hzero.common.button.import').d('导入'),
      search: queryString.stringify({
        prefixPath: API_PREFIX,
        action: intl.get(`${modelCode}.view.companyImport`).d('项目租户导入'),
        tenantId,
      }),
    });
  }

  /**
   * 导出
   */
  @Bind()
  exportParams() {
    const queryParams = this.tableDS.queryDataSet!.map(data => data.toData()) || {};
    const { companyObj, ...otherData } = queryParams[0];
    const _queryParams = {
      ...companyObj,
      ...otherData,
    };
    return { ..._queryParams } || {};
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const SaveButtons = observer((props: any) => {
      const isDisabled = !props.dataSet!.dirty;
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
      <Button icon="add" onClick={this.create}>
        {intl.get(`${modelCode}.add`).d('新增')}
      </Button>,
      <SaveButtons
        key="save"
        onClick={() => this.handleSave()}
        dataSet={this.tableDS}
        title={intl.get(`${modelCode}.button.save`).d('保存')}
      />,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('项目租户维护')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/project-tenant-opts/export`}
            queryParams={() => this.exportParams()}
          />
          <Button onClick={() => this.handleImport()}>
            {intl.get(`${modelCode}.import`).d('导入')}
          </Button>
        </Header>
        <Content>
          <Table
            dataSet={this.tableDS}
            columns={this.columns}
            buttons={this.buttons}
            style={{ height: 500 }}
          />
        </Content>
      </>
    );
  }
}
