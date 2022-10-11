/*
 * @Description: 抵扣统计报表
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-24 10:56:29
 * @LastEditTime: 2022-10-11 15:44:16
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import notification from 'utils/notification';
import { downLoadReport } from '@src/services/checkAuthenticationService';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@htccommon/config/commonConfig';
import InvoiceDetailDS from '../stores/InvoiceDetailDS';
import { ActiveKey } from '../list/DeductionStatementListPage';

const tenantId = getCurrentOrganizationId();
// const modelCode = 'hivp.deductionStatement';
const API_PREFIX = commonConfig.IVP_API || '';
interface DeductionStatementListPageProps {
  location: {
    state: Object | any;
  };
}
@formatterCollections({
  code: ['hivp.deductionStatement', 'htc.common'],
})
export default class CheckRuleListPage extends Component<DeductionStatementListPageProps> {
  invoiceDetailDS = new DataSet({
    autoQuery: false,
    ...InvoiceDetailDS(),
  });

  state = {
    activeExportUrl: 'export-invoice-master-info',
  };

  @Bind()
  async componentDidMount() {
    const { queryDataSet } = this.invoiceDetailDS;
    if (this.props?.location.state.activeKey === ActiveKey.notDeductibleTable) {
      this.setState({
        activeExportUrl: 'export-undeduction-detail',
      });
    }
    if (queryDataSet && queryDataSet.current) {
      queryDataSet.current.set(this.props?.location.state);
      this.invoiceDetailDS.query();
    }
  }

  /**
   * 导出
   */
  @Bind()
  exportParams() {
    const queryParams = this.invoiceDetailDS.queryDataSet!.map(data => data.toData()) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    const { companyObj, ...otherData } = queryParams[0];
    const _queryParams = {
      ...companyObj,
      ...otherData,
    };
    return { ..._queryParams } || {};
  }

  get invoiceDetailTableColumns(): ColumnProps[] {
    return [
      { name: 'invoiceType', width: 200 },
      { name: 'invoiceCode' },
      { name: 'invoiceNo' },
      { name: 'invoiceDate' },
      { name: 'salerName' },
      { name: 'salerTaxNo', width: 140 },
      { name: 'invoiceAmount' },
      { name: 'taxAmount' },
      { name: 'validTaxAmount' },
      { name: 'invoiceState' },
      { name: 'checkState' },
      { name: 'authenticationType' },
      { name: 'reasonsForNonDeduction' },
      { name: 'isPoolFlag' },
      { name: 'entryAccountState' },
      { name: 'receiptsState', width: 140 },
      { name: 'systemCode' },
      { name: 'documentTypeCode' },
      { name: 'documentNumber' },
      { name: 'authenticationState' },
      { name: 'checkDate' },
      { name: 'authenticationDate' },
      { name: 'recordState' },
      { name: 'fileUrl' },
    ];
  }

  @Bind()
  renderQueryBar() {
    return '';
  }

  @Bind()
  async handleDown() {
    const data = this.invoiceDetailDS.queryDataSet?.current?.toData();
    const res = getResponse(
      await downLoadReport({
        ...data,
        tenantId,
      })
    );
    if (res) {
      notification.success({ message: intl.get(`hivp.checkRule`).d('认证结果通知书下载') });
    }
  }

  render() {
    return (
      <>
        <Header
          title={intl.get('hivp.checkRule.title.invoiceRule').d('发票明细查看')}
          backPath={`/htc-front-ivp/deduction-statement/list?activeKey=${this.props?.location.state.activeKey}`}
        >
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/deduction-report/${this.state.activeExportUrl}`}
            queryParams={() => this.exportParams()}
          />
          {this.props?.location.state.authenticationState && (
            <Button
              key="currentPeriod"
              dataSet={this.invoiceDetailDS}
              onClick={() => this.handleDown()}
              color={ButtonColor.primary}
            >
              {intl.get(`hivp.checkRule`).d('认证结果通知书下载')}
            </Button>
          )}
        </Header>
        <Content style={{ paddingBottom: '60px' }}>
          <Table
            dataSet={this.invoiceDetailDS}
            queryBar={this.renderQueryBar}
            columns={this.invoiceDetailTableColumns}
            style={{ height: 420 }}
          />
        </Content>
      </>
    );
  }
}
