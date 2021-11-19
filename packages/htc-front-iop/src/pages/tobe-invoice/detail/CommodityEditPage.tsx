/**
 * @Description:商品信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-21 18:02:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { RouteComponentProps } from 'react-router-dom';
import { synchronizeSaveGood } from '@src/services/tobeInvoiceService';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Button, DataSet, Form, TextField, Lov, Select } from 'choerodon-ui/pro';
import { Col, Row } from 'choerodon-ui';
import notification from 'utils/notification';
import CommodityInfoDS from '../stores/CommodityInfoDS';

const modelCode = 'hiop.tobe-invoice';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  companyId: string;
  companyCode: string;
  employeeNumber: string;
}

interface CommodityInfoProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@connect()
export default class CommodityInfoPage extends Component<CommodityInfoProps> {
  commodityInfoDS = new DataSet({
    autoQuery: false,
    ...CommodityInfoDS(this.props.match.params),
  });

  async componentDidMount() {
    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      const { recordData } = invoiceInfo;
      this.commodityInfoDS.setQueryParameter('invoiceInfo', recordData);
      this.commodityInfoDS.query();
    }
  }

  // 保存并同步商品信息
  @Bind()
  async saveAndSynchronize() {
    const { companyId, companyCode, employeeNumber } = this.props.match.params;
    const validateValue = await this.commodityInfoDS.validate(false, false);
    const { dispatch } = this.props;
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
    const res = await this.commodityInfoDS.submit();
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
          title={intl.get(`${modelCode}.title`).d('商品信息')}
        />
        <Content>
          <Form dataSet={this.commodityInfoDS} columns={2}>
            <TextField name="projectNumber" />
            <TextField name="materialDescription" />
            <Lov name="commodityObj" />
            <TextField name="commodityServiceCateCode" />
            <TextField name="commodityName" />
            <TextField name="projectName" />
            <Select name="zeroTaxRateFlag" />
            <TextField name="model" />
            <Select name="preferentialPolicyFlag" />
            <TextField name="specialManagementVat" />
          </Form>
          <Row type="flex" justify="end">
            <Col span={6} style={{ textAlign: 'end' }}>
              <Button color={ButtonColor.primary} onClick={() => this.saveAndSynchronize()}>
                {intl.get(`${modelCode}.saveAndSynchronize`).d('保存并同步商品信息')}
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
