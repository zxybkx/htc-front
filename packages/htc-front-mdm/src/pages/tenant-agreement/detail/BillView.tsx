/**
 * DS - 租户协议-账单信息:PDF
 * @Author: xinyan.zhou <zhou.xinyan@hand-china.com>
 * @Date: 2021-06-01
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Header, Content } from 'components/Page';
import { connect } from 'dva';
import { Dispatch } from 'redux';
import intl from 'utils/intl';

const modelCode = 'hpln.index-plan';

interface RouterInfo {
  agreementId: any;
  tenantId: any;
}
interface Props extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
// 定义 State 类型
interface State {
  planStatus: string;
}

@connect()
export default class TenantAgreementDetailPage extends Component<Props, State> {
  render() {
    return (
      <>
        <Header
          title={intl.get(`${modelCode}.title`).d('详细信息')}
          backPath="/htc-front-mdm/tenant-agreement/list"
        />
        <Content>123</Content>
      </>
    );
  }
}
