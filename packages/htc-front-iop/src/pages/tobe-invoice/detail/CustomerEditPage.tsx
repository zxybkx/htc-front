/**
 * @Description:客户信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-22 14:15:22
 * @LastEditTime: 2021-11-23 15:32:15
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { synchronizeSaveCustomer } from '@src/services/tobeInvoiceService';
import notification from 'utils/notification';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Button, DataSet, Form, Lov, Select, TextField } from 'choerodon-ui/pro';
import CustomerInfoDS from '../stores/CustomerInfoDS';

const tenantId = getCurrentOrganizationId();

interface CustomerInfoPageProps {
  recordData: any;
  companyId: number;
  companyCode: string;
  employeeNumber: string;
  employeeId: number;
  onCloseModal: any;
  dataSet: any;
}

@connect()
@formatterCollections({
  code: [
    'hiop.tobeInvoice',
    'hiop.invoiceWorkbench',
    'htc.common',
    'hiop.redInvoiceInfo',
    'hiop.invoiceReq',
  ],
})
export default class CustomerInfoPage extends Component<CustomerInfoPageProps> {
  customerInfoDS = new DataSet({
    autoQuery: false,
    ...CustomerInfoDS(this.props),
  });

  async componentDidMount() {
    const { recordData, employeeId } = this.props;
    this.customerInfoDS.setQueryParameter('invoiceInfo', recordData);
    this.customerInfoDS.query().then(() => {
      this.customerInfoDS.current!.set('employeeId', employeeId);
    });
  }

  /**
   * 保存并同步客户信息
   */
  @Bind()
  async saveAndSynchronize() {
    const { companyId, companyCode, employeeNumber } = this.props;
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
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        this.props.onCloseModal();
        this.props.dataSet.query();
      } else {
        notification.error({
          description: '',
          message: res && res.message,
        });
      }
    }
  }

  /**
   * 保存客户信息
   */
  @Bind()
  async handleSaveCustomer() {
    const res = await this.customerInfoDS.submit();
    if (res === undefined) {
      notification.warning({
        description: '',
        message: intl.get('htc.common.notification.noChange').d('请先修改数据'),
      });
    } else if (res === false) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
    } else if (res && res.content && res.content[0]) {
      this.props.onCloseModal();
      this.props.dataSet.query();
    }
  }

  render() {
    return (
      <>
        <Form dataSet={this.customerInfoDS}>
          <TextField name="receiptName" />
          <TextField name="receiptNumber" />
          <TextField name="receiptTaxNo" />
          <TextField name="customerAddressPhone" />
          <Select name="receiptEnterpriseType" />
          <TextField name="bankNumber" />
          <Lov name="invoiceTypeObj" />
          <Lov name="requestTypeObj" />
          <Select name="billFlag" />
          <TextField name="paperTicketReceiverName" />
          <TextField name="paperTicketReceiverAddress" />
          <TextField name="paperTicketReceiverPhone" />
          <Select name="electronicType" />
          <TextField name="electronicReceiverInfo" />
        </Form>
        <div style={{ position: 'absolute', right: '0.3rem', bottom: '0.3rem' }}>
          <Button onClick={() => this.props.onCloseModal()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button color={ButtonColor.primary} onClick={() => this.saveAndSynchronize()}>
            {intl.get('hiop.tobeInvoice.button.saveAndSynchronize').d('保存并同步')}
          </Button>
          <Button color={ButtonColor.primary} onClick={() => this.handleSaveCustomer()}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
      </>
    );
  }
}
