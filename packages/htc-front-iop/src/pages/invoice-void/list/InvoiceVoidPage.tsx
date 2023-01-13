/**
 * @Description:发票作废
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-14 9:37:22
 * @LastEditTime: 2021-3-01 14:06:13
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header } from 'components/Page';
import { RouteComponentProps } from 'react-router-dom';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@htccommon/utils/utils';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import notification from 'utils/notification';
import { DataSet, Form, Lov, Output, Select, TextField } from 'choerodon-ui/pro';
import { Card, Col, Row } from 'choerodon-ui';
import { batchInvalid, batchSave, review } from '@src/services/invoiceOrderService';
import InvoiceVoidHeaderDS from '../stores/InvoiceVoidHeaderDS';

const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

interface InvoiceVoidPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  match: any;
}

@formatterCollections({
  code: ['hiop.invoiceVoid', 'hiop.invoiceWorkbench', 'hiop.invoiceReq', 'htc.common'],
})
export default class InvoiceVoidPage extends Component<InvoiceVoidPageProps> {
  invoiceVoidHeaderDS = new DataSet({
    autoQuery: false,
    ...InvoiceVoidHeaderDS(),
  });

  state = { empInfo: {} as any, billingType: null };

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
      }
      if (invoicingReqHeaderId) {
        this.invoiceVoidHeaderDS.setQueryParameter('orderHeaderId', invoicingReqHeaderId);
        this.invoiceVoidHeaderDS.setQueryParameter('headerId', invoicingReqHeaderId);
      }
      this.invoiceVoidHeaderDS.query().then(res => {
        const { billingType } = res;
        this.setState({ billingType, empInfo: currentEmployee });
      });
    }
  }

  /**
   * 保存（作废订单）
   * @params {number} type 0-保存 1-提交
   */
  @Bind()
  async handleSaveOrder(type) {
    const { history } = this.props;
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
        history.push('/htc-front-iop/invoice-workbench/list');
      } else {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success.save').d('保存成功'),
        });
        this.invoiceVoidHeaderDS.loadData(res);
      }
    }
  }

  /**
   * 申请单保存
   * @params {number} type 0-保存 1-提交
   */
  @Bind()
  async requestSave(type) {
    const { history } = this.props;
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
      submit: type === 1,
      ...pageData,
    };
    const res = getResponse(await batchInvalid(params));
    if (res) {
      if (type === 1) {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        history.push('/htc-front-iop/invoice-req/list');
      } else {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success.save').d('保存成功'),
        });
        this.invoiceVoidHeaderDS.loadData(res);
      }
    }
  }

  /**
   * 渲染header按钮
   */
  @Bind()
  renderHeaderBts() {
    const { match } = this.props;
    const { sourceType } = match.params;
    if (sourceType) {
      return (
        <>
          <PermissionButton
            type="c7n-pro"
            onClick={() => this.requestSave(0)}
            permissionList={[
              {
                code: `${permissionPath}.void-reqsave`,
                type: 'button',
                meaning: '按钮-作废-保存（作废申请）',
              },
            ]}
          >
            {intl.get('hiop.invoiceVoid.button.reqSave').d('保存（作废申请）')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            onClick={() => this.requestSave(1)}
            permissionList={[
              {
                code: `${permissionPath}.void-reqsubmit`,
                type: 'button',
                meaning: '按钮-作废-提交（作废申请）',
              },
            ]}
          >
            {intl.get('hiop.invoiceVoid.button.reqSubmit').d('提交（作废申请）')}
          </PermissionButton>
        </>
      );
    } else {
      return (
        <>
          <PermissionButton
            type="c7n-pro"
            onClick={() => this.handleSaveOrder(1)}
            permissionList={[
              {
                code: `${permissionPath}.void-submit`,
                type: 'button',
                meaning: '按钮-作废-作废审核（提交）',
              },
            ]}
          >
            {intl.get('hiop.invoiceVoid.button.voidSubmit').d('作废审核（提交）')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            onClick={() => this.handleSaveOrder(0)}
            permissionList={[
              {
                code: `${permissionPath}.void-save`,
                type: 'button',
                meaning: '按钮-作废-保存（作废订单）',
              },
            ]}
          >
            {intl.get('hiop.invoiceVoid.button.voidSave').d('保存（作废订单）')}
          </PermissionButton>
        </>
      );
    }
  }

  render() {
    const { match } = this.props;
    const { billingType } = this.state;
    const { sourceType } = match.params;
    let backPath = '/htc-front-iop/invoice-workbench/list';
    if (sourceType) {
      backPath = '/htc-front-iop/invoice-req/list';
    }
    const blueInvoice: JSX.Element[] = [
      <TextField name="blueInvoiceCode" label={<span style={{ color: 'blue' }}>发票代码</span>} />,
      <TextField name="blueInvoiceNo" label={<span style={{ color: 'blue' }}>发票号码</span>} />,
    ];
    const redInvoice: JSX.Element[] = [
      <TextField name="invoiceCode" label={<span style={{ color: 'red' }}>发票代码</span>} />,
      <TextField name="invoiceNo" label={<span style={{ color: 'red' }}>发票号码</span>} />,
    ];
    return (
      <>
        <Header
          title={intl.get('hiop.invoiceVoid.title.invoiceVoid').d('发票作废')}
          backPath={backPath}
        >
          {this.renderHeaderBts()}
        </Header>
        <div style={{ overflow: 'auto' }}>
          <Card style={{ marginTop: 10 }}>
            <Form dataSet={this.invoiceVoidHeaderDS.queryDataSet} columns={3}>
              <TextField name="companyName" />
              <Output name="employeeDesc" />
              <Output
                colSpan={1}
                value={moment().format(DEFAULT_DATE_FORMAT)}
                label={intl.get('hiop.invoiceReq.modal.curDate').d('当前日期')}
              />
            </Form>
            <Form dataSet={this.invoiceVoidHeaderDS} columns={3}>
              <Select
                name="invoiceVariety"
                optionsFilter={record => ['0', '2', '41'].includes(record.get('value'))}
              />
              <Lov name="extNumberObj" />
            </Form>
          </Card>
          <Card style={{ marginTop: 10 }}>
            <Row gutter={8}>
              <Col span={12}>
                <div style={{ backgroundColor: '#f6f6f6', padding: '10px 20px 0 20px' }}>
                  <h3>
                    <b>{intl.get('hiop.invoiceWorkbench.label.buyer').d('购买方')}</b>
                  </h3>
                  <Form columns={2} dataSet={this.invoiceVoidHeaderDS}>
                    <TextField name="buyerName" colSpan={2} />
                    <TextField name="buyerTaxpayerNumber" />
                    <Select name="buyerCompanyType" />
                    <TextField name="buyerCompanyAddressPhone" colSpan={2} />
                    <TextField name="buyerBankNumber" colSpan={2} />
                  </Form>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ backgroundColor: '#f6f6f6', padding: '10px 20px 0 20px' }}>
                  <h3>
                    <b>{intl.get('hiop.invoiceWorkbench.label.seller').d('销售方')}</b>
                  </h3>
                  <Form columns={2} dataSet={this.invoiceVoidHeaderDS}>
                    <TextField name="sellerName" colSpan={2} />
                    <TextField name="sellerTaxpayerNumber" />
                    <Select name="sellerCompanyType" />
                    <TextField name="sellerCompanyAddressPhone" colSpan={2} />
                    <TextField name="sellerBankNumber" colSpan={2} />
                  </Form>
                </div>
              </Col>
            </Row>
            <Form dataSet={this.invoiceVoidHeaderDS} columns={3} style={{ marginTop: 10 }}>
              <Lov name="payeeNameObj" />
              <Lov name="issuerNameObj" />
              <Lov name="reviewerNameObj" />
              {/*---*/}
              <Select name="billingType" />
              {billingType === 4 && blueInvoice}
              {billingType === 5 && redInvoice}
            </Form>
          </Card>
          <Card style={{ marginTop: 10, marginBottom: 10 }}>
            <div style={{ marginBottom: 20 }}>
              <h3>
                <b>{intl.get('hiop.invoiceWorkbench.title.invoiceOrder').d('开票订单')}</b>
              </h3>
            </div>
            <Form
              columns={3}
              dataSet={this.invoiceVoidHeaderDS}
              excludeUseColonTagList={['Output', 'Radio']}
            >
              <TextField name="invoiceSourceOrder" />
              <TextField name="originalInvoiceDate" />
              {/* --- */}
              <Select name="originalSourceType" />
              <TextField name="originalInvoiceSourceOrder" />
            </Form>
          </Card>
        </div>
      </>
    );
  }
}
