/**
 * @Description:商品信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-21 18:02:22
 * @LastEditTime: 2021-11-23 15:32:15
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { synchronizeSaveGood } from '@src/services/tobeInvoiceService';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Button, DataSet, Form, Lov, Select, TextField } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import CommodityInfoDS from '../stores/CommodityInfoDS';

const tenantId = getCurrentOrganizationId();

interface CommodityInfoProps {
  recordData: any;
  companyId: number;
  companyCode: string;
  employeeNumber: string;
  onCloseModal: any;
  dataSet: any;
}

@formatterCollections({
  code: [
    'hiop.tobeInvoice',
    'hiop.invoiceWorkbench',
    'htc.common',
    'hiop.redInvoiceInfo',
    'hiop.invoiceReq',
  ],
})
export default class CommodityEditPage extends Component<CommodityInfoProps> {
  commodityInfoDS = new DataSet({
    autoQuery: false,
    ...CommodityInfoDS(this.props),
  });

  async componentDidMount() {
    const { recordData } = this.props;
    this.commodityInfoDS.setQueryParameter('invoiceInfo', recordData);
    this.commodityInfoDS.query();
  }

  /**
   * 保存并同步商品信息
   */
  @Bind()
  async saveAndSynchronize() {
    const { companyId, companyCode, employeeNumber } = this.props;
    const validateValue = await this.commodityInfoDS.validate(false, false);
    // 页面校验
    if (!validateValue) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
      return;
    }
    const recordData = this.commodityInfoDS.current!.toData(true);
    const params = {
      tenantId,
      companyId,
      companyCode,
      employeeNumber,
      recordData,
    };
    const res = getResponse(await synchronizeSaveGood(params));
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
          message: res.message,
        });
      }
    }
  }

  /**
   * 保存商品信息
   */
  @Bind()
  async handleSaveCommodity() {
    const res = await this.commodityInfoDS.submit();
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
        <Form dataSet={this.commodityInfoDS}>
          <TextField name="projectNumber" />
          <Lov name="commodityObj" />
          <TextField name="commodityServiceCateCode" />
          <TextField name="commodityName" />
          <TextField name="projectName" />
          <TextField name="projectUnit" />
          <Select name="zeroTaxRateFlag" />
          <TextField name="model" />
          <Select name="preferentialPolicyFlag" />
          <TextField name="specialManagementVat" />
        </Form>
        <div style={{ position: 'absolute', right: '0.3rem', bottom: '0.3rem' }}>
          <Button onClick={() => this.props.onCloseModal()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button onClick={() => this.saveAndSynchronize()}>
            {intl.get('hiop.tobeInvoice.button.saveAndSynchronize').d('保存并同步')}
          </Button>
          <Button color={ButtonColor.primary} onClick={() => this.handleSaveCommodity()}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
      </>
    );
  }
}
