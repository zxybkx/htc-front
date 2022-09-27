/*
 * @Description: 抵扣统计报表
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-24 10:56:29
 * @LastEditTime: 2022-09-27 10:06:26
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
    DataSet, Form, Lov, Spin, TextField, Table,
    Tabs,
} from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import { Col, Row } from 'choerodon-ui';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
// import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { getCurrentOrganizationId } from 'utils/utils';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
// import CheckRuleHeaderForm from './CheckAuthenticationRulesForm';
import { getBusinessTime } from '@src/services/checkAuthenticationService';
import DeductionStatementHeaderDS from '../stores/DeductionStatementHeaderDS';
import DeductTableDS from '../stores/DeductTableDS';
import DeductibleTableDS from '../stores/DeductibleTableDS';
import NotDeductibleTableDS from '../stores/NotDeductibleTableDS';
import VerifiedTableDS from '../stores/VerifiedTableDS';
// import notification from 'utils/notification';

const tenantId = getCurrentOrganizationId();
const { TabPane } = Tabs;
const modelCode = 'hivp.deductionStatement';
interface DeductionStatementListPageProps {
    dispatch: Dispatch<any>;
}

@formatterCollections({
    code: ['hivp.deductionStatement', 'htc.common'],
})
export default class CheckRuleListPage extends Component<DeductionStatementListPageProps> {
    // state = {
    //     curCompanyId: '',
    // };
    deductionStatementHeaderDS = new DataSet({
        autoQuery: true,
        autoCreate: true,
        ...DeductionStatementHeaderDS(),
    });

    deductibleTableDS = new DataSet({
        autoQuery: false,
        ...DeductibleTableDS(),
    });

    verifiedTableDS = new DataSet({
        autoQuery: true,
        autoCreate: true,
        ...VerifiedTableDS(),
    });

    notDeductibleTableDS = new DataSet({
        autoQuery: true,
        autoCreate: true,
        ...NotDeductibleTableDS(),
    });

    deductTableDS = new DataSet({
        autoQuery: true,
        autoCreate: true,
        ...DeductTableDS(),
    });

    @Bind()
    async componentDidMount() {
        const res = await getCurrentEmployeeInfoOut({ tenantId });
        if (res && res.content) {
            const empInfo = res.content[0];
            this.handleChangeCompanyCallBack(empInfo);
        }
    }

    @Bind()
    async handleCompanyChange(value) {
        this.handleChangeCompanyCallBack(value);
    }

    @Bind()
    async handleChangeCompanyCallBack(empInfo) {
        const { companyCode, companyId, employeeId, employeeNum: employeeNumber } = empInfo;
        const timeRes = await getBusinessTime({
            tenantId,
            companyCode,
            companyId,
            employeeId,
            employeeNumber,
        });
        const { queryDataSet } = this.deductionStatementHeaderDS;
        const { current } = this.deductionStatementHeaderDS;
        if (queryDataSet && queryDataSet.current) {
            queryDataSet.current.set({ companyObj: empInfo });
            if (timeRes) {
                queryDataSet.current.set({
                    currentPeriod: timeRes.currentPeriod,
                    currentOperationalDeadline: timeRes.currentOperationalDeadline,
                    checkableTimeRange: timeRes.checkableTimeRange,
                });
            }
            current!.set('companyId', empInfo.companyId);
            // this.setState({ curCompanyId: empInfo.companyId });
        }
    }

    get deductibleTableColumns(): ColumnProps[] {
        return [
            { name: 'invoiceType' },
            { name: 'deductibleCopies' },
            { name: 'totalDeductibleInvoiceAmount' },
            { name: 'totalValidTaxAmountDeductible' },
            { name: 'deductibleShare' },
            { name: 'totalInvoiceAmountDeducted' },
            { name: 'totalValidTaxAmountDeducted' },
            { name: 'numberOfCopiesChecked' },
            { name: 'totalInvoiceAmountChecked' },
            { name: 'totalValidTaxAmountChecked' },
            { name: 'numberDeductButNot' },
            { name: 'totalAmountDeductButNot' },
            { name: 'totalTaxAmountDeductButNot' },
        ];
    }

    get verifiedTableColumns(): ColumnProps[] {
        return [

        ];
    }

    get notDeductibleTableColumns(): ColumnProps[] {
        return [
            {},
        ];
    }

    get deductTableColumns(): ColumnProps[] {
        return [
            {}, {},
        ];
    }

    render() {
        // const { curCompanyId } = this.state;
        return (
          <>
            <Header title={intl.get('hivp.checkRule.title.invoiceRule').d('抵扣统计报表')} />
            <Content style={{ paddingBottom: '60px' }}>
              <Row type="flex">
                <Col span={20}>
                  <Form dataSet={this.deductionStatementHeaderDS.queryDataSet} columns={3}>
                    <Lov
                      dataSet={this.deductionStatementHeaderDS.queryDataSet}
                      name="companyObj"
                      onChange={this.handleCompanyChange}
                    />
                    <TextField name="employeeDesc" />
                    <TextField name="currentPeriod" />
                    <TextField name="currentOperationalDeadline" />
                    <TextField name="checkableTimeRange" />
                    <TextField name="taxpayerNumber" />
                  </Form>
                </Col>
              </Row>

              <Spin dataSet={this.deductibleTableDS}>
                <Tabs>
                  <TabPane
                    tab={intl
                                    .get(`${modelCode}.tabPane.certifiableInvoiceTitle`)
                                    .d('可抵扣发票统计')}
                    key="deductibleTable"
                  >
                    <Table
                      dataSet={this.deductibleTableDS}
                      columns={this.deductibleTableColumns}
                      style={{ height: 320 }}
                    />
                  </TabPane>
                  <TabPane
                    tab={intl
                                    .get(`${modelCode}.tabPane.certifiableInvoiceTitle`)
                                    .d('已认证发票统计')}
                    key="verifiedTable"
                  >
                    <Table
                      dataSet={this.verifiedTableDS}
                      columns={this.verifiedTableColumns}
                      style={{ height: 320 }}
                    />
                  </TabPane>
                  <TabPane
                    tab={intl
                                    .get(`${modelCode}.tabPane.certifiableInvoiceTitle`)
                                    .d('不抵扣发票统计')}
                    key="notDeductibleTable"
                  >
                    <Table
                      dataSet={this.notDeductibleTableDS}
                      columns={this.notDeductibleTableColumns}
                      style={{ height: 320 }}
                    />
                  </TabPane>
                  <TabPane
                    tab={intl
                                    .get(`${modelCode}.tabPane.certifiableInvoiceTitle`)
                                    .d('抵扣报表明细')}
                    key="deductTable"
                  >
                    <Table
                      dataSet={this.deductTableDS}
                      columns={this.deductTableColumns}
                      style={{ height: 320 }}
                    />
                  </TabPane>
                </Tabs>
              </Spin>
            </Content>
          </>
        );
    }
}
