/**
 * @Description:账单报表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-09-07 13:44:22
 * @LastEditTime: 2022-06-20 15:23
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Col, Row } from 'choerodon-ui';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { getAccessToken } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

interface RouterInfo {}

interface BillViewPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: ['hmdm.billStatement'],
})
export default class BillViewPage extends Component<BillViewPageProps> {
  /**
   * 渲染账单信息
   */
  renderBillView = () => {
    const { search } = this.props.location;
    const fileUrlInfoStr = new URLSearchParams(search).get('fileUrlInfo');
    if (fileUrlInfoStr) {
      const fileUrlInfo = JSON.parse(decodeURIComponent(fileUrlInfoStr));
      const { fileUrl } = fileUrlInfo;
      const bucketName = 'hmdm';
      const tokenUrl = `${HZERO_FILE}/v1/file-preview/by-url?url=${encodeURIComponent(
        fileUrl
      )}&bucketName=${bucketName}&access_token=${getAccessToken()}`;
      return <iframe title="archive" src={tokenUrl} height="600" width="90%" frameBorder="0" />;
    }
    return <div />;
  };

  render() {
    return (
      <>
        <Header
          title={intl.get('hmdm.billStatement.title.billingInformation').d('账单信息')}
          backPath="/htc-front-mdm/bill-statement/list"
        />
        <Content>
          <Row>
            <Col span={24} style={{ textAlign: 'center' }}>
              {this.renderBillView()}
            </Col>
          </Row>
        </Content>
      </>
    );
  }
}
