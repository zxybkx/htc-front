/*
 * @Description:发票作废
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-14 9:37:22
 * @LastEditTime: 2021-3-01 14:06:13
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import { RouteComponentProps } from 'react-router-dom';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@common/utils/utils';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { PageHeaderWrapper } from 'hzero-boot/lib/components/Page';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import notification from 'utils/notification';
import { Form, DataSet, TextField, Select, Radio, Output, Lov, SelectBox } from 'choerodon-ui/pro';
import { Row, Col, Card } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { batchSave, review, batchInvalid } from '@src/services/invoiceOrderService';
import InvoiceVoidHeaderDS from '../stores/InvoiceVoidHeaderDS';

const modelCode = 'hiop.invoice-void';
const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;
const { Option } = SelectBox;

interface InvoiceVoidPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  match: any;
}

@connect()
export default class InvoiceVoidPage extends Component<InvoiceVoidPageProps> {
  invoiceVoidHeaderDS = new DataSet({
    autoQuery: false,
    ...InvoiceVoidHeaderDS(),
  });

  state = { empInfo: {} as any };

  async componentDidMount() {
    const { match } = this.props;
    const { invoicingOrderHeaderId, invoicingReqHeaderId, companyId } = match.params;
    const { queryDataSet } = this.invoiceVoidHeaderDS;
    if (queryDataSet) {
      const employeeInfo = await getCurrentEmployeeInfo({ tenantId, companyId });
      const currentEmployee = employeeInfo && employeeInfo.content[0];
      const { companyCode, employeeNum, employeeName, mobile } = currentEmployee;
      const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
      queryDataSet.current!.set({ companyObj: currentEmployee });
      queryDataSet.current!.set({ employeeDesc });
      if (invoicingOrderHeaderId) {
        this.invoiceVoidHeaderDS.setQueryParameter('orderHeaderId', invoicingOrderHeaderId);
        this.invoiceVoidHeaderDS.query();
      } else {
        this.invoiceVoidHeaderDS.query();
      }
      if (invoicingReqHeaderId) {
        this.invoiceVoidHeaderDS.setQueryParameter('orderHeaderId', invoicingReqHeaderId);
        this.invoiceVoidHeaderDS.setQueryParameter('headerId', invoicingReqHeaderId);
        this.invoiceVoidHeaderDS.query();
      }
      this.setState({ empInfo: currentEmployee });
    }
  }

  // 保存（作废订单）
  @Bind()
  async save(type) {
    const { dispatch } = this.props;
    const { empInfo } = this.state;
    const { match } = this.props;
    const { invoicingOrderHeaderId, invoicingReqHeaderId } = match.params;
    const validateValue = await this.invoiceVoidHeaderDS.validate(false, false);
    // 页面校验
    if (!validateValue) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
      return;
    }
    const pageData = this.invoiceVoidHeaderDS.current!.toData(true);
    const { invoiceVariety } = pageData;
    if (!invoiceVariety) {
      notification.error({
        description: '发票种类未选',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
      return;
    }
    let params;
    if (invoicingOrderHeaderId || invoicingReqHeaderId) {
      params = {
        curEmployeeId: empInfo.employeeId,
        ...pageData,
        tenantId,
      };
    } else {
      // 空白废
      params = {
        invoiceSourceType: 'VOID',
        curEmployeeId: empInfo.employeeId,
        ...pageData,
        tenantId,
      };
    }
    // 保存（作废订单）0|作废审核（提交）1
    const res = getResponse(type === 0 ? await batchSave(params) : await review(params));
    if (res) {
      if (type === 1) {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        dispatch(
          routerRedux.push({
            pathname: '/htc-front-iop/invoice-workbench/list',
          })
        );
      } else {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('保存成功'),
        });
        this.invoiceVoidHeaderDS.loadData(res);
      }
    }
  }

  // 申请单保存
  @Bind()
  async requestSave(type) {
    const { dispatch } = this.props;
    const { empInfo } = this.state;
    const validateValue = await this.invoiceVoidHeaderDS.validate(false, false);
    // 页面校验
    if (!validateValue) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
      return;
    }
    const pageData = this.invoiceVoidHeaderDS.current!.toData(true);
    const { invoiceVariety } = pageData;
    if (!invoiceVariety) {
      notification.error({
        description: '发票种类未选',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
      return;
    }
    const { companyCode, employeeNum, employeeId } = empInfo;
    const params = {
      organizationId: tenantId,
      headerCompanyCode: companyCode,
      headerEmployeeNumber: employeeNum,
      headerReviewerId: employeeId,
      submit: type === 1 && true,
      ...pageData,
    };
    const res = getResponse(await batchInvalid(params));
    if (res) {
      if (type === 1) {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        dispatch(
          routerRedux.push({
            pathname: '/htc-front-iop/invoice-req/list',
          })
        );
      } else {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('保存成功'),
        });
        this.invoiceVoidHeaderDS.loadData(res);
      }
    }
  }

  @Bind()
  renderHeaderBts() {
    const { match } = this.props;
    const { sourceType } = match.params;
    if (sourceType) {
      return (
        <>
          <PermissionButton
            type="c7n-pro"
            color={ButtonColor.dark}
            onClick={() => this.requestSave(1)}
            permissionList={[
              {
                code: `${permissionPath}.void-reqsubmit`,
                type: 'button',
                meaning: '按钮-作废-提交（作废申请）',
              },
            ]}
          >
            {intl.get(`${modelCode}.button.submit`).d('提交（作废申请）')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            color={ButtonColor.dark}
            onClick={() => this.requestSave(0)}
            permissionList={[
              {
                code: `${permissionPath}.void-reqsave`,
                type: 'button',
                meaning: '按钮-作废-保存（作废申请）',
              },
            ]}
          >
            {intl.get(`${modelCode}.button.submit`).d('保存（作废申请）')}
          </PermissionButton>
        </>
      );
    } else {
      return (
        <>
          <PermissionButton
            type="c7n-pro"
            color={ButtonColor.dark}
            onClick={() => this.save(0)}
            permissionList={[
              {
                code: `${permissionPath}.void-save`,
                type: 'button',
                meaning: '按钮-作废-保存（作废订单）',
              },
            ]}
          >
            {intl.get(`${modelCode}.button.save`).d('保存（作废订单）')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            color={ButtonColor.dark}
            onClick={() => this.save(1)}
            permissionList={[
              {
                code: `${permissionPath}.void-submit`,
                type: 'button',
                meaning: '按钮-作废-作废审核（提交）',
              },
            ]}
          >
            {intl.get(`${modelCode}.button.submit`).d('作废审核（提交）')}
          </PermissionButton>
        </>
      );
    }
  }

  render() {
    const { match } = this.props;
    const { sourceType } = match.params;
    let backPath = '/htc-front-iop/invoice-workbench/list';
    if (sourceType) {
      backPath = '/htc-front-iop/invoice-req/list';
    }
    return (
      <PageHeaderWrapper
        title={intl.get(`${modelCode}.title`).d('发票作废')}
        header={this.renderHeaderBts()}
        headerProps={{ backPath }}
      >
        <Content>
          <Form dataSet={this.invoiceVoidHeaderDS.queryDataSet} columns={5}>
            <Output name="companyName" colSpan={2} />
            <Output name="employeeDesc" colSpan={2} />
            <Output
              colSpan={1}
              value={moment().format(DEFAULT_DATE_FORMAT)}
              label={intl.get(`${modelCode}.view.curDate`).d('当前日期')}
            />
          </Form>
          <Form dataSet={this.invoiceVoidHeaderDS} columns={5}>
            <SelectBox name="invoiceVariety" colSpan={2}>
              <Option value="0">专票</Option>
              <Option value="2">普票</Option>
              <Option value="41">卷票</Option>
            </SelectBox>
            <Lov name="extNumberObj" />
            <SelectBox name="billingType" colSpan={2}>
              <Option value="3">空白作废</Option>
              <Option value="4">蓝票作废</Option>
              <Option value="5">红票作废</Option>
            </SelectBox>
          </Form>
          <Row gutter={8}>
            <Col span={12}>
              <Card title="购买方">
                <Form
                  columns={3}
                  dataSet={this.invoiceVoidHeaderDS}
                  excludeUseColonTagList={['Output']}
                >
                  <TextField name="buyerName" colSpan={3} />
                  <TextField name="buyerTaxpayerNumber" colSpan={2} />
                  <Output
                    colSpan={1}
                    renderer={() => <Select name="buyerCompanyType" placeholder="企业类型" />}
                  />
                  <TextField name="buyerCompanyAddressPhone" colSpan={3} />
                  <TextField name="buyerBankNumber" colSpan={3} />
                </Form>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="销售方">
                <Form
                  columns={3}
                  dataSet={this.invoiceVoidHeaderDS}
                  excludeUseColonTagList={['Output']}
                >
                  <TextField name="sellerName" colSpan={3} />
                  <TextField name="sellerTaxpayerNumber" colSpan={2} />
                  <Output
                    colSpan={1}
                    renderer={() => <Select name="sellerCompanyType" placeholder="企业类型" />}
                  />
                  <TextField name="sellerCompanyAddressPhone" colSpan={3} />
                  <TextField name="sellerBankNumber" colSpan={3} />
                </Form>
              </Card>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={12}>
              <Form
                columns={3}
                dataSet={this.invoiceVoidHeaderDS}
                excludeUseColonTagList={['Radio']}
              >
                <Lov name="payeeNameObj" />
                <Lov name="issuerNameObj" />
                <Lov name="reviewerNameObj" />
                {/*---*/}
                <Radio name="originalBillingType" value="1" style={{ color: 'blue' }}>
                  蓝字发票
                </Radio>
                <TextField
                  name="blueInvoiceCode"
                  label={<span style={{ color: 'blue' }}>发票代码</span>}
                />
                <TextField
                  name="blueInvoiceNo"
                  label={<span style={{ color: 'blue' }}>发票号码</span>}
                />
                {/*---*/}
                <Radio name="originalBillingType" value="2" newLine style={{ color: 'red' }}>
                  红字发票
                </Radio>
                <TextField
                  name="invoiceCode"
                  label={<span style={{ color: 'red' }}>发票代码</span>}
                />
                <TextField
                  name="invoiceNo"
                  label={<span style={{ color: 'red' }}>发票号码</span>}
                />
              </Form>
            </Col>
            <Col span={12} style={{ marginTop: 10 }}>
              <Card title="开票订单">
                <Form
                  columns={3}
                  dataSet={this.invoiceVoidHeaderDS}
                  excludeUseColonTagList={['Output', 'Radio']}
                >
                  <TextField name="invoiceSourceOrder" colSpan={2} />
                  <TextField name="originalInvoiceDate" colSpan={1} />
                  {/* --- */}
                  <Select name="originalSourceType" colSpan={2} />
                  <TextField name="originalInvoiceSourceOrder" colSpan={1} />
                </Form>
              </Card>
            </Col>
          </Row>
        </Content>
      </PageHeaderWrapper>
    );
  }
}
