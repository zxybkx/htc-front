/*
 * @Description:分配商品映射
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-05-19 10:25:54
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { assignCommodity } from '@src/services/customerService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { RouteComponentProps } from 'react-router-dom';
import AssignCommodityListDS from '../stores/AssignCommodityListDS';

const modelCode = 'hiop.commodity-info';
const tenantId = getCurrentOrganizationId();

interface AssignCommodityListDS extends RouteComponentProps {
  match: any;
}

@formatterCollections({
  code: [modelCode],
})
export default class CommodityInfoPage extends Component<AssignCommodityListDS> {
  assignCommodityListDS = new DataSet({
    autoQuery: false,
    ...AssignCommodityListDS(),
  });

  componentDidMount(): void {
    const { search } = this.props.location;
    const companyInfoStr = new URLSearchParams(search).get('companyInfo');
    if (companyInfoStr) {
      const companyInfo = JSON.parse(decodeURIComponent(companyInfoStr));
      const { companyCode, taxpayerNumber, customerInformationId } = companyInfo;
      this.assignCommodityListDS.setQueryParameter('companyCode', companyCode);
      this.assignCommodityListDS.setQueryParameter('taxpayerNumber', taxpayerNumber);
      this.assignCommodityListDS.setQueryParameter('customerInformationId', customerInformationId);
      this.assignCommodityListDS.query();
    }
  }

  @Bind()
  async assignCommodity() {
    const customerInformationList = this.assignCommodityListDS.selected.map((record) =>
      record.toData()
    );
    const { search } = this.props.location;
    const companyInfoStr = new URLSearchParams(search).get('companyInfo');
    if (companyInfoStr) {
      const companyInfo = JSON.parse(decodeURIComponent(companyInfoStr));
      const { goodsMappingList } = companyInfo;
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
      }
    }
  }

  get buttons(): Buttons[] {
    const ObserverButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <ObserverButtons
        key="add"
        onClick={() => this.assignCommodity()}
        dataSet={this.assignCommodityListDS}
        title={intl.get(`${modelCode}.button.add`).d('分配')}
      />,
    ];
  }

  get columns(): ColumnProps[] {
    return [{ name: 'customerCode' }, { name: 'customerName' }, { name: 'customerTaxpayerNumber' }];
  }

  render() {
    return (
      <>
        <Header
          backPath="/htc-front-iop/customer-info/list"
          title={intl.get(`${modelCode}.title`).d('分配商品映射')}
        />
        <Content>
          <Table
            key="assignCommodity"
            dataSet={this.assignCommodityListDS}
            columns={this.columns}
            buttons={this.buttons}
          />
        </Content>
      </>
    );
  }
}
