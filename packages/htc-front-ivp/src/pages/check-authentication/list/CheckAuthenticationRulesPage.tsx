/**
 * @Description: 进项发票规则维护
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-10-09 14:51:37
 * @LastEditTime: 2022-10-21 14:37:02
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Button, DataSet, Form, Lov, Spin, TextField } from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import { Col, Row } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import { getBusinessTime } from '@src/services/checkAuthenticationService';
import notification from 'utils/notification';
import CheckRuleHeaderForm from './CheckAuthenticationRulesForm';
import CheckAuthenticationRulesDS from '../stores/CheckAuthenticationRulesDS';
import CheckAuthenticationManualRulesDS from '../stores/CheckAuthenticationManualRulesDS';

const tenantId = getCurrentOrganizationId();

interface CheckRuleListPageProps {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [
    'hivp.checkRule',
    'htc.common',
    'hivp.batchCheck',
    'hivp.checkCertification',
    'hivp.invoices',
    'hivp.invoicesArchiveUpload',
    'hivp.bill',
    'hivp.taxRefund',
  ],
})
export default class CheckAuthenticationRulesPage extends Component<CheckRuleListPageProps> {
  checkRuleDS = new DataSet({
    autoQuery: false,
    autoCreate: true,
    ...CheckAuthenticationRulesDS(),
  });

  checkRuleManualDS = new DataSet({
    autoQuery: false,
    autoCreate: true,
    ...CheckAuthenticationManualRulesDS(),
  });

  @Bind()
  async handleChangeCompanyCallBack(empInfo) {
    const { companyCode, companyId, employeeId, employeeNum: employeeNumber } = empInfo;
    const { queryDataSet } = this.checkRuleDS;
    const { current } = this.checkRuleManualDS;
    if (current) {
      current.set({
        companyId,
        companyCode,
        employeeNumber,
      });
    }
    if (queryDataSet && queryDataSet.current) {
      queryDataSet.current.set({ companyObj: empInfo });
    }
    this.loadData(empInfo);
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
  }

  @Bind()
  async componentDidMount() {
    const res = getResponse(await getCurrentEmployeeInfoOut({ tenantId }));
    if (res && res.content) {
      const empInfo = res.content[0];
      this.handleChangeCompanyCallBack(empInfo);
    }
  }

  @Bind()
  loadData(empInfo) {
    this.checkRuleDS.query().then(res => {
      if (!res) {
        this.checkRuleDS.create(
          {
            companyId: empInfo.companyId,
            companyName: empInfo.companyName,
            employeeId: empInfo.employeeId,
            employeeNum: empInfo.employeeNum,
          },
          0
        );
      }
    });
  }

  @Bind()
  async handleSaveRule() {
    const validate = await this.checkRuleDS.validate();
    if (validate) {
      const res = await this.checkRuleDS.submit();
      if (res === undefined) {
        notification.warning({
          description: '',
          message: intl.get('htc.common.notification.noChange').d('请先修改数据'),
        });
      }
      if (res && res.content && res.content[0]) this.checkRuleDS.query();
    }
  }

  @Bind()
  async handleCompanyChange(value) {
    // if (this.checkRuleDS.dirty) {
    //   await Modal.confirm({
    //     title: intl.get('htc.common.view.changeRemind').d('当前页面有修改信息未保存！'),
    //     children: (
    //       <span style={{ fontSize: '12px' }}>
    //         {intl
    //           .get('hiop.invoiceRule.message.operation')
    //           .d('点击下方“确定”按钮，即可保存，或点击“取消”放弃保存内容')}
    //       </span>
    //     ),
    //     onOk: async () => {
    //       await this.checkRuleDS.submit(false, false);
    //       this.handleChangeCompanyCallBack(value);
    //     },
    //     onCancel: () => {
    //       const { queryDataSet } = this.checkRuleDS;
    //       const { current } = this.checkRuleManualDS;
    //       if (queryDataSet && queryDataSet.current) {
    //         queryDataSet.current.set({ companyObj: oldValue });
    //         current!.set('companyId', oldValue.companyId);
    //         this.setState({ curCompanyId: oldValue.companyId });
    //       }
    //     },
    //   });
    // }
    this.handleChangeCompanyCallBack(value);
  }

  render() {
    return (
      <>
        <Header title={intl.get('hivp.checkRule.title.invoiceRule').d('进项发票规则维护')} />
        <Content style={{ paddingBottom: '60px' }}>
          <Row type="flex">
            <Col span={20}>
              <Form dataSet={this.checkRuleDS.queryDataSet} columns={3}>
                <Lov
                  dataSet={this.checkRuleDS.queryDataSet}
                  name="companyObj"
                  clearButton={false}
                  onChange={this.handleCompanyChange}
                />
                <TextField name="employeeDesc" />
                <TextField name="currentPeriod" />
                <TextField name="currentOperationalDeadline" />
                <TextField name="checkableTimeRange" />
                <TextField name="taxpayerNumber" />
              </Form>
            </Col>
            <Col span={4} style={{ textAlign: 'end' }}>
              <Button onClick={() => this.handleSaveRule()} color={ButtonColor.primary}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </Col>
          </Row>

          <Spin dataSet={this.checkRuleDS}>
            <CheckRuleHeaderForm
              manualDataSet={this.checkRuleManualDS}
              dataSet={this.checkRuleDS}
            />
          </Spin>
        </Content>
      </>
    );
  }
}
