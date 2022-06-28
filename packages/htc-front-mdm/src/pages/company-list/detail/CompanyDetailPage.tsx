/**
 * @Description:公司明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2020-11-26 11:22:49
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import intl from 'utils/intl';
import { getTenantAgreement } from '@src/services/companyListService';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import AgreementLinesForm from './AgreementLinesForm';

const modelCode = 'hmdm.company-detail';

interface RouterInfo {
  companyId: any;
}
interface CompanyDetailPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
@formatterCollections({
  code: [modelCode],
})
export default class CompanyDetailPage extends Component<CompanyDetailPageProps> {
  state = {
    agreementId: null,
  };

  async componentDidMount() {
    const res = await getTenantAgreement({ tenantId: getCurrentOrganizationId() });
    const agreementId = res.content[0] && res.content[0].agreementId;
    this.setState({ agreementId });
  }

  render() {
    const { agreementId } = this.state;
    const { companyId } = this.props.match.params;
    const agreementParams = { companyId, agreementId };
    return (
      <>
        <Header
          title={intl.get(`${modelCode}.agreementTitle`).d('协议信息')}
          backPath="/htc-front-mdm/company/list"
        />
        <Content>
          <AgreementLinesForm agreementParams={agreementParams} />
        </Content>
      </>
    );
  }
}
