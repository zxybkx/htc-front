/*
 * @Description: 抵扣统计报表
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-24 10:56:29
 * @LastEditTime: 2022-10-11 11:00:04
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { DataSet, Form, Lov, TextField, Table, Tabs } from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import { Col, Row } from 'choerodon-ui';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import { getBusinessTime } from '@src/services/checkAuthenticationService';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import { RouteComponentProps } from 'react-router-dom';
import withProps from 'utils/withProps';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@htccommon/config/commonConfig';
import DeductionStatementHeaderDS from '../stores/DeductionStatementHeaderDS';
import DeductTableDS from '../stores/DeductTableDS';
import DeductibleTableDS from '../stores/DeductibleTableDS';
import NotDeductibleTableDS from '../stores/NotDeductibleTableDS';
import VerifiedTableDS from '../stores/VerifiedTableDS';
// import notification from 'utils/notification';
export enum ActiveKey {
  deductibleTable = 'export-deduction-report',
  verifiedTable = 'export-certified-report',
  notDeductibleTable = 'export-undeduction-all',
  deductTable = 'export-deduction-detail',
}
const API_PREFIX = commonConfig.IVP_API || '';
const tenantId = getCurrentOrganizationId();
const { TabPane } = Tabs;
const modelCode = 'hivp.deductionStatement';

interface DeductionStatementListPageProps extends RouteComponentProps {
  deductionStatementHeaderDS: DataSet;
  deductibleTableDS: DataSet;
  verifiedTableDS: DataSet;
  notDeductibleTableDS: DataSet;
  deductTableDS: DataSet;
  location;
}
enum DetilType {
  deductibleCopies = 0,
  deductibleShare = 1,
  numberDeductButNot = 2,
  numberOfCopiesChecked = 3,
  certifiedQuantity = 4,
  checkedInvoiceNumber = 5,
  checkedInvoiceNumberInPool = 6,
}

@formatterCollections({
  code: ['hivp.deductionStatement', 'htc.common'],
})
@withProps(
  () => {
    const deductionStatementHeaderDS = new DataSet({
      autoQuery: true,
      autoCreate: true,
      ...DeductionStatementHeaderDS(),
    });
    const deductibleTableDS = new DataSet({
      autoQuery: false,
      ...DeductibleTableDS(),
    });

    const verifiedTableDS = new DataSet({
      autoQuery: false,
      autoCreate: true,
      ...VerifiedTableDS(),
    });

    const notDeductibleTableDS = new DataSet({
      autoQuery: false,
      autoCreate: true,
      ...NotDeductibleTableDS(),
    });

    const deductTableDS = new DataSet({
      autoQuery: false,
      autoCreate: true,
      ...DeductTableDS(),
    });
    return {
      deductionStatementHeaderDS,
      deductibleTableDS,
      verifiedTableDS,
      notDeductibleTableDS,
      deductTableDS,
    };
  },
  { cacheState: true }
)
export default class CheckRuleListPage extends Component<DeductionStatementListPageProps> {
  state = {
    activeKey: ActiveKey.deductibleTable,
  };

  @Bind()
  async componentDidMount() {
    const { location } = this.props;
    if (location && location.query && location.query.activeKey) {
      this.setState({
        activeKey: location.query.activeKey,
      });
    } else {
      const res = await getCurrentEmployeeInfoOut({ tenantId });
      if (res && res.content) {
        const empInfo = res.content[0];
        this.handleChangeCompanyCallBack(empInfo);
      }
    }
  }

  @Bind()
  async handleCompanyChange(value) {
    this.handleChangeCompanyCallBack(value);
  }

  @Bind()
  handleSetCommonRes(dataSet, timeRes, empInfo) {
    const { companyId, companyCode, employeeNum: employeeNumber } = empInfo || {};
    const { currentPeriod, currentOperationalDeadline, checkableTimeRange } = timeRes || {};
    if (dataSet) {
      /* eslint-disable */
      dataSet.myState = {
        currentPeriod,
        currentOperationalDeadline,
        checkableTimeRange,
        companyId,
        companyCode,
        employeeNumber,
      };
      /* eslint-enable */
    }
  }

  @Bind()
  handleSetDefaultConfig(dataSet, timeRes, empInfo) {
    const { companyId, companyCode, employeeNum: employeeNumber } = empInfo;
    const { currentPeriod, currentOperationalDeadline, checkableTimeRange } = timeRes;
    if (dataSet) {
      /* eslint-disable */
      dataSet.myState = {
        currentPeriod,
        currentOperationalDeadline,
        checkableTimeRange,
        companyId,
        companyCode,
        employeeNumber,
      };
      /* eslint-enable */
    }
  }

  @Bind()
  async handleChangeCompanyCallBack(empInfo) {
    const { companyCode, companyId, employeeId, employeeNum: employeeNumber } = empInfo;
    const { queryDataSet, current } = this.props.deductionStatementHeaderDS;
    if (current) {
      current.set('companyId', empInfo.companyId);
    }
    if (queryDataSet && queryDataSet.current) {
      queryDataSet.current.set({ companyObj: empInfo });
    }
    const timeRes = getResponse(
      await getBusinessTime({
        tenantId,
        companyCode,
        companyId,
        employeeId,
        employeeNumber,
      })
    );
    if (queryDataSet && queryDataSet.current && timeRes) {
      queryDataSet.current.set({
        currentPeriod: timeRes.currentPeriod,
        currentOperationalDeadline: timeRes.currentOperationalDeadline,
        checkableTimeRange: timeRes.checkableTimeRange,
      });
    }
    if (timeRes || empInfo) {
      [
        this.props.deductibleTableDS,
        this.props.verifiedTableDS,
        this.props.notDeductibleTableDS,
        this.props.deductTableDS,
      ].forEach(item => {
        this.handleSetCommonRes(item, timeRes, empInfo);
      });
    }
    if (timeRes && empInfo) {
      [
        this.props.deductibleTableDS,
        this.props.verifiedTableDS,
        this.props.notDeductibleTableDS,
        this.props.deductTableDS,
      ].forEach(item => {
        this.handleSetDefaultConfig(item, timeRes, empInfo);
      });
    }
  }

  @Bind()
  handleGotoDetailTablePage(record, type) {
    let otherParms = {};
    switch (type) {
      case DetilType.deductibleCopies:
        otherParms = {
          checkState: '0',
        };
        break;
      case DetilType.deductibleShare:
        otherParms = {
          checkState: '0,1',
        };
        break;
      case DetilType.numberDeductButNot:
        otherParms = {
          checkState: '0',
          authenticationType: '1',
        };
        break;
      case DetilType.numberOfCopiesChecked:
        otherParms = {
          checkState: '1',
          authenticationType: '1',
        };
        break;
      case DetilType.certifiedQuantity:
        otherParms = {
          authenticationState: '1',
        };
        break;

      case DetilType.checkedInvoiceNumber:
        otherParms = {
          isPool: '0',
        };
        break;
      case DetilType.checkedInvoiceNumberInPool:
        otherParms = {
          isPool: '1',
        };
        break;
      default:
        break;
    }
    let queryData = {};
    switch (this.state.activeKey) {
      case ActiveKey.deductTable:
        queryData = this.props.deductibleTableDS.queryDataSet?.current?.toData();
        break;
      case ActiveKey.deductibleTable:
        queryData = this.props.verifiedTableDS.queryDataSet?.current?.toData();
        break;
      case ActiveKey.notDeductibleTable:
        queryData = this.props.notDeductibleTableDS.queryDataSet?.current?.toData();
        break;
      default:
        break;
    }
    const { history, deductionStatementHeaderDS } = this.props;
    const headerInfo = deductionStatementHeaderDS.queryDataSet?.current?.toData();
    const { companyObj, ...otheInfo } = headerInfo;
    history.push({
      pathname: '/htc-front-ivp/deduction-statement/detail',
      state: {
        ...queryData,
        ...otheInfo,
        ...otherParms,
        invoiceType: record ? record.get('invoiceType') : null,
        invoiceTypes: record ? record.get('invoiceType') : null,
        activeKey: this.state.activeKey,
      },
    });
  }

  // 渲染列脚
  @Bind()
  renderColumnFooter(dataSet, name) {
    let total;
    dataSet.forEach(record => {
      const _total = Number(total) || 0;
      const _amount = Number(record.get(name)) || 0;
      total = ((_total * 100 + _amount * 100) / 100).toFixed(2);
    });
    total =
      total &&
      total.toString().replace(/\d+/, n => {
        return n.replace(/(\d)(?=(\d{3})+$)/g, i => {
          return `${i},`;
        });
      });
    return `${total || 0}`;
  }

  get deductibleTableColumns(): ColumnProps[] {
    return [
      {
        name: 'invoiceType',
        width: 200,
        footer: () => `${intl.get('hivp.invoices.view.total').d('合计')}：`,
      },
      {
        name: 'deductibleCopies',
        width: 120,
        help: intl
          .get('hivp.deductionStatement.title.invoiceRule')
          .d('截止更新时间在开票时间范围内获取的税局全量可抵扣发票份数'),
        showHelp: ShowHelp.label,
        renderer: ({ record }) => {
          const deductibleCopies = record && record.get('deductibleCopies');
          return (
            <a onClick={() => this.handleGotoDetailTablePage(record, DetilType.deductibleCopies)}>
              {deductibleCopies}
            </a>
          );
        },
        footer: (dataSet, name) => (
          <a onClick={() => this.handleGotoDetailTablePage(null, DetilType.deductibleCopies)}>
            {this.renderColumnFooter(dataSet, name).replace('.00', '')}
          </a>
        ),
      },
      {
        name: 'totalDeductibleInvoiceAmount',
        width: 140,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'totalValidTaxAmountDeductible',
        width: 180,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'deductibleShare',
        width: 120,
        help: intl
          .get('hivp.deductionStatement.title.invoiceRule')
          .d('截止更新时间满足除开票时间条件外的在池应抵扣发票份数，包含已勾选和未勾选的发票'),
        showHelp: ShowHelp.label,
        renderer: ({ record }) => {
          const deductibleShare = record && record.get('deductibleShare');
          return (
            <a onClick={() => this.handleGotoDetailTablePage(record, DetilType.deductibleShare)}>
              {deductibleShare}
            </a>
          );
        },
        footer: (dataSet, name) => (
          <a onClick={() => this.handleGotoDetailTablePage(null, DetilType.deductibleShare)}>
            {this.renderColumnFooter(dataSet, name).replace('.00', '')}
          </a>
        ),
      },
      {
        name: 'totalInvoiceAmountDeducted',
        width: 140,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'totalValidTaxAmountDeducted',
        width: 180,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'numberOfCopiesChecked',
        width: 120,
        help: intl
          .get('hivp.deductionStatement.title.invoiceRule')
          .d('截止更新时间满足除开票时间条件外的已抵扣勾选发票份数，不包括不抵扣勾选发票'),
        showHelp: ShowHelp.label,
        renderer: ({ record }) => {
          const numberOfCopiesChecked = record && record.get('numberOfCopiesChecked');
          return (
            <a
              onClick={() =>
                this.handleGotoDetailTablePage(record, DetilType.numberOfCopiesChecked)
              }
            >
              {numberOfCopiesChecked}
            </a>
          );
        },
        footer: (dataSet, name) => (
          <a onClick={() => this.handleGotoDetailTablePage(null, DetilType.numberOfCopiesChecked)}>
            {this.renderColumnFooter(dataSet, name).replace('.00', '')}
          </a>
        ),
      },
      {
        name: 'totalInvoiceAmountChecked',
        width: 140,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'totalValidTaxAmountChecked',
        width: 180,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'numberDeductButNot',
        width: 160,
        help: intl
          .get('hivp.deductionStatement.title.invoiceRule')
          .d('截止更新时间满足除开票时间条件外应抵未抵的发票份数'),
        showHelp: ShowHelp.label,
        renderer: ({ record }) => {
          const numberDeductButNot = record && record.get('numberDeductButNot');
          return (
            <a onClick={() => this.handleGotoDetailTablePage(record, DetilType.numberDeductButNot)}>
              {numberDeductButNot}
            </a>
          );
        },
        footer: (dataSet, name) => (
          <a onClick={() => this.handleGotoDetailTablePage(null, DetilType.numberDeductButNot)}>
            {this.renderColumnFooter(dataSet, name).replace('.00', '')}
          </a>
        ),
      },
      {
        name: 'totalAmountDeductButNot',
        width: 160,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'totalTaxAmountDeductButNot',
        width: 180,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
    ];
  }

  get verifiedTableColumns(): ColumnProps[] {
    return [
      {
        name: 'invoiceType',
        footer: () => `${intl.get('hivp.invoices.view.total').d('合计')}：`,
      },
      {
        name: 'certifiedQuantity',
        help: intl
          .get('hivp.deductionStatement.title.invoiceRule')
          .d('截止更新时间条件内获取的税局全量已认证发票份数'),
        showHelp: ShowHelp.label,
        renderer: ({ record }) => {
          const certifiedQuantity = record && record.get('certifiedQuantity');
          return (
            <a onClick={() => this.handleGotoDetailTablePage(record, DetilType.certifiedQuantity)}>
              {certifiedQuantity}
            </a>
          );
        },
        footer: (dataSet, name) => (
          <a onClick={() => this.handleGotoDetailTablePage(null, DetilType.certifiedQuantity)}>
            {this.renderColumnFooter(dataSet, name).replace('.00', '')}
          </a>
        ),
      },
      {
        name: 'certifiedTotalAmount',
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'certifiedTotalValidTaxAmount',
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
    ];
  }

  get notDeductibleTableColumns(): ColumnProps[] {
    return [
      {
        name: 'invoiceType',
        footer: () => `${intl.get('hivp.invoices.view.total').d('合计')}：`,
      },
      {
        name: 'checkedInvoiceNumber',
        help: intl
          .get('hivp.deductionStatement.title.invoiceRule')
          .d('截止更新时间满足开票时间和勾选时间范围内获取的税局全量不抵扣发票份数'),
        showHelp: ShowHelp.label,
        renderer: ({ record }) => {
          const checkedInvoiceNumber = record && record.get('checkedInvoiceNumber');
          return (
            <a
              onClick={() => this.handleGotoDetailTablePage(record, DetilType.checkedInvoiceNumber)}
            >
              {checkedInvoiceNumber}
            </a>
          );
        },
        footer: (dataSet, name) => (
          <a onClick={() => this.handleGotoDetailTablePage(null, DetilType.checkedInvoiceNumber)}>
            {this.renderColumnFooter(dataSet, name).replace('.00', '')}
          </a>
        ),
      },
      {
        name: 'checkedInvoiceTotalAmount',
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'checkedInvoiceTotalTaxAmount',
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'checkedInvoiceNumberInPool',
        help: intl
          .get('hivp.deductionStatement.title.invoiceRule')
          .d('截止更新时间条件内发票池内不抵扣已勾选的发票'),
        showHelp: ShowHelp.label,
        renderer: ({ record }) => {
          const checkedInvoiceNumberInPool = record && record.get('checkedInvoiceNumberInPool');
          return (
            <a
              onClick={() =>
                this.handleGotoDetailTablePage(record, DetilType.checkedInvoiceNumberInPool)
              }
            >
              {checkedInvoiceNumberInPool}
            </a>
          );
        },
        footer: (dataSet, name) => (
          <a
            onClick={() =>
              this.handleGotoDetailTablePage(null, DetilType.checkedInvoiceNumberInPool)
            }
          >
            {this.renderColumnFooter(dataSet, name).replace('.00', '')}
          </a>
        ),
      },
      {
        name: 'checkedInvoiceTotalAmountInPool',
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'checkedInvoiceTotalTaxAmountInPool',
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
    ];
  }

  @Bind()
  async handleTabChange(newActiveKey) {
    this.setState({ activeKey: newActiveKey });
  }

  /**
   * 导出
   */
  @Bind()
  exportParams() {
    let queryDataSet: any = {};
    const { deductibleTableDS, verifiedTableDS, notDeductibleTableDS, deductTableDS } = this.props;
    switch (this.state.activeKey) {
      case ActiveKey.deductTable:
        ({ queryDataSet } = deductibleTableDS);
        break;
      case ActiveKey.deductibleTable:
        ({ queryDataSet } = verifiedTableDS);
        break;
      case ActiveKey.notDeductibleTable:
        ({ queryDataSet } = notDeductibleTableDS);
        break;
      default:
        ({ queryDataSet } = deductTableDS);
        break;
    }
    const queryParams = queryDataSet.map(data => data.toData()) || {};
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

  get deductTableColumns(): ColumnProps[] {
    return [
      { name: 'invoiceType' },
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

  render() {
    const { activeKey } = this.state;
    const {
      deductionStatementHeaderDS,
      deductibleTableDS,
      verifiedTableDS,
      notDeductibleTableDS,
      deductTableDS,
    } = this.props;
    const { queryDataSet } = deductionStatementHeaderDS;
    const { deductibleTable, verifiedTable, notDeductibleTable, deductTable } = ActiveKey;
    return (
      <>
        <Header title={intl.get('hivp.deductionStatement.title.invoiceRule').d('抵扣统计报表')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/deduction-report/${activeKey}`}
            queryParams={() => this.exportParams()}
          />
        </Header>
        <Content style={{ paddingBottom: '60px' }}>
          <Row type="flex">
            <Col span={20}>
              <Form dataSet={queryDataSet} columns={3}>
                <Lov dataSet={queryDataSet} name="companyObj" onChange={this.handleCompanyChange} />
                <TextField name="employeeDesc" />
                <TextField name="currentPeriod" />
                <TextField name="currentOperationalDeadline" />
                <TextField name="checkableTimeRange" />
                {/* <TextField name="taxpayerNumber" /> */}
              </Form>
            </Col>
          </Row>

          <Tabs activeKey={activeKey} onChange={this.handleTabChange}>
            <TabPane
              tab={intl.get(`${modelCode}.tabPane.certifiableInvoiceTitle`).d('可抵扣发票统计')}
              key={deductibleTable}
            >
              <Table
                dataSet={deductibleTableDS}
                columns={this.deductibleTableColumns}
                style={{ height: 320 }}
              />
            </TabPane>
            <TabPane
              tab={intl.get(`${modelCode}.tabPane.certifiableInvoiceTitle`).d('已认证发票统计')}
              key={verifiedTable}
            >
              <Table
                dataSet={verifiedTableDS}
                columns={this.verifiedTableColumns}
                style={{ height: 320 }}
              />
            </TabPane>
            <TabPane
              tab={intl.get(`${modelCode}.tabPane.certifiableInvoiceTitle`).d('不抵扣发票统计')}
              key={notDeductibleTable}
            >
              <Table
                dataSet={notDeductibleTableDS}
                columns={this.notDeductibleTableColumns}
                style={{ height: 320 }}
              />
            </TabPane>
            <TabPane
              tab={intl.get(`${modelCode}.tabPane.certifiableInvoiceTitle`).d('抵扣报表明细')}
              key={deductTable}
            >
              <Table
                dataSet={deductTableDS}
                columns={this.deductTableColumns}
                style={{ height: 450 }}
              />
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}
