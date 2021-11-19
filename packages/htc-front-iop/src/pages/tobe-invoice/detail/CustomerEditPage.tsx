/**
 * @Description:客户信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-22 14:15:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { RouteComponentProps } from 'react-router-dom';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { synchronizeSaveCustomer } from '@src/services/tobeInvoiceService';
import notification from 'utils/notification';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Button, DataSet, Form, TextField, Select, Lov } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import CustomerInfoDS from '../stores/CustomerInfoDS';

const modelCode = 'hiop.tobe-invoice';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  companyId: string;
  companyCode: string;
  employeeNumber: string;
}

interface CustomerInfoPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@connect()
export default class CustomerInfoPage extends Component<CustomerInfoPageProps> {
  customerInfoDS = new DataSet({
    autoQuery: false,
    ...CustomerInfoDS(this.props.match.params),
  });

  async componentDidMount() {
    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    const { companyId } = this.props.match.params;
    const employeeRes = await getCurrentEmployeeInfo({ tenantId, companyId });
    const employeeInfo = employeeRes && employeeRes.content[0];
    if (invoiceInfoStr && employeeInfo) {
      const { employeeId } = employeeInfo;
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      const { recordData } = invoiceInfo;
      this.customerInfoDS.setQueryParameter('invoiceInfo', recordData);
      this.customerInfoDS.query().then(() => {
        this.customerInfoDS.current!.set('employeeId', employeeId);
      });
    }
  }

  // 保存并同步客户信息
  @Bind()
  async saveAndSynchronize() {
    const { companyId, companyCode, employeeNumber } = this.props.match.params;
    const { dispatch } = this.props;
    const validateValue = await this.customerInfoDS.validate(false, false);
    // 页面校验
    if (!validateValue) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
      return;
    }
    const recordData = this.customerInfoDS.current!.toData(true);
    const params = {
      tenantId,
      companyId,
      companyCode,
      employeeNumber,
      recordData,
    };
    const res = getResponse(await synchronizeSaveCustomer(params));
    if (res) {
      if (res.status === '1000') {
        notification.success({
          description: '',
          message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
        });
        dispatch(routerRedux.push({ pathname: '/htc-front-iop/tobe-invoice/list' }));
      } else {
        notification.error({
          description: '',
          message: res && res.message,
        });
      }
    }
  }

  @Bind()
  async save() {
    const { dispatch } = this.props;
    const res = await this.customerInfoDS.submit();
    if (res === undefined) {
      notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.noChange').d('请先修改数据'),
      });
    } else if (res === false) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
    } else if (res && res.content && res.content[0]) {
      dispatch(routerRedux.push({ pathname: '/htc-front-iop/tobe-invoice/list' }));
    }
  }

  render() {
    return (
      <>
        <Header
          backPath="/htc-front-iop/tobe-invoice/list"
          title={intl.get(`${modelCode}.title`).d('开票信息')}
        />
        <Content>
          <Form dataSet={this.customerInfoDS} columns={3}>
            <TextField name="receiptNumber" />
            <TextField name="receiptName" colSpan={2} />
            <TextField name="receiptTaxNo" />
            <TextField name="customerAddressPhone" colSpan={2} />
            <Select name="receiptEnterpriseType" />
            <TextField name="bankNumber" colSpan={2} />
            <Select name="invoiceType" />
            <Lov name="requestTypeObj" />
            <Select name="billFlag" />
            <TextField name="paperTicketReceiverName" />
            <TextField name="paperTicketReceiverAddress" colSpan={2} />
            <TextField name="paperTicketReceiverPhone" />
            <Select name="electronicType" />
            <TextField name="electronicReceiverInfo" />
          </Form>
          <Row type="flex" justify="end">
            <Col style={{ textAlign: 'end' }}>
              <Button color={ButtonColor.primary} onClick={() => this.saveAndSynchronize()}>
                {intl.get(`${modelCode}.saveAndSynchronize`).d('保存并同步客户信息')}
              </Button>
              <Button color={ButtonColor.primary} onClick={() => this.save()}>
                {intl.get(`${modelCode}.save`).d('保存')}
              </Button>
            </Col>
          </Row>
        </Content>
      </>
    );
  }
}
