/**
 * @page:自动催收管理-提醒内容
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-04-06 11:48
 * @LastEditTime: 2022-06-20 10:28
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

const modelCode = 'hmdm.automatic-collection-manage';

interface RouterInfo {}

interface BillViewPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

export default class BillViewPage extends Component<BillViewPageProps> {
  /**
   * 渲染自动催收提醒内容
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
          title={intl.get(`${modelCode}.title`).d('自动催收提醒')}
          backPath="/htc-front-mdm/automatic-collection-manage/list"
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
