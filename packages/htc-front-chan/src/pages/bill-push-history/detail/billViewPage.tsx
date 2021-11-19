import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Col, Row } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { getAccessToken } from 'utils/utils';

const modelCode = 'chan.bill-push-history';

interface RouterInfo {}

interface BillViewPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

export default class BillViewPage extends Component<BillViewPageProps> {
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
          title={intl.get(`${modelCode}.title`).d('账单信息')}
          backPath="/htc-front-chan/bill-push-history/list"
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
