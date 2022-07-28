/**
 * @Description:分配商品映射
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-05-19 10:25:54
 * @LastEditTime: 2022-06-15 14:00
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Button, DataSet, Table } from 'choerodon-ui/pro';
import { assignCommodity } from '@src/services/customerService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import AssignCommodityListDS from '../stores/AssignCommodityListDS';

const tenantId = getCurrentOrganizationId();

interface AssignCommodityListDSProps {
  companyCode: string;
  taxpayerNumber: string;
  goodsMappingList: any;
  customerInformationId: number;
  onCloseModal: any;
}

@formatterCollections({
  code: ['hiop.customerInfo', 'htc.common'],
})
export default class AssignCommodityListPage extends Component<AssignCommodityListDSProps> {
  assignCommodityListDS = new DataSet({
    autoQuery: false,
    ...AssignCommodityListDS(),
  });

  componentDidMount() {
    const { companyCode, taxpayerNumber, customerInformationId } = this.props;
    this.assignCommodityListDS.setQueryParameter('companyCode', companyCode);
    this.assignCommodityListDS.setQueryParameter('taxpayerNumber', taxpayerNumber);
    this.assignCommodityListDS.setQueryParameter('customerInformationId', customerInformationId);
    this.assignCommodityListDS.query();
  }

  /**
   *分配商品
   */
  @Bind()
  async assignCommodity() {
    const customerInformationList = this.assignCommodityListDS.selected.map(record =>
      record.toData()
    );
    const { goodsMappingList } = this.props;
    const params = {
      tenantId,
      goodsMappingList,
      customerInformationList,
    };
    const res = getResponse(await assignCommodity(params));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
      this.props.onCloseModal();
    }
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [{ name: 'customerCode' }, { name: 'customerName' }, { name: 'customerTaxpayerNumber' }];
  }

  render() {
    return (
      <>
        <Table
          key="assignCommodity"
          dataSet={this.assignCommodityListDS}
          columns={this.columns}
          style={{ height: 450 }}
        />
        <div style={{ position: 'absolute', right: '0.3rem', bottom: '0.3rem' }}>
          <Button onClick={() => this.props.onCloseModal()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button onClick={() => this.assignCommodity()} color={ButtonColor.primary}>
            {intl.get('hiop.customerInfo.button.synchronize').d('分配')}
          </Button>
        </div>
      </>
    );
  }
}
