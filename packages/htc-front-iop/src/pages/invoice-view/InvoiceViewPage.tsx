import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Header, Content } from 'components/Page';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import { Button as PermissionButton } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import { getPresentMenu } from '@common/utils/utils';
import { DataSet, Button, Spin, notification } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import Viewer from 'react-viewer';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import moment from 'moment';
import 'react-viewer/dist/index.css';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, getAccessToken, getResponse } from 'utils/utils';
import { urlTojpg } from '@src/services/invoiceOrderService';
import InvoiceViewDS from './stores/InvoiceViewDS';

const modelCode = 'hiop.invoice-view';
const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

interface RouterInfo {
  sourceType: string;
  headerId: string;
  employeeId: string;
}

interface InvoiceViewPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [modelCode],
})
@connect()
export default class InvoiceViewPage extends Component<InvoiceViewPageProps> {
  state = {
    backPath: '',
    recordType: '',
    curImgUrl: '',
    viewerVisible: false,
    fileName: 'archive',
  };

  queryDS = new DataSet({
    autoQuery: false,
    ...InvoiceViewDS(this.props.match.params),
  });

  @Bind()
  async getState() {
    const recordType = this.queryDS.current && this.queryDS.current.get('downloadFileType');
    let curImgUrl = this.queryDS.current && this.queryDS.current.get('downloadUrl');
    const curUrlDescription = this.queryDS.current && this.queryDS.current.get('downloadUrlDescription');
    const companyCode = this.queryDS.current && this.queryDS.current.get('companyCode');
    const employeeNumber = this.queryDS.current && this.queryDS.current.get('employeeNumber');
    const billingType = this.queryDS.current && this.queryDS.current.get('billingType');
    if(billingType!==3){
      // 当为空白废时不提示 1->蓝字发票 2->红字发票 3->空白废 4->蓝废 5->红废
      if (curUrlDescription) {
        return notification.error({
          description: '',
          placement: 'bottomRight',
          message: intl.get(`${modelCode}.view.preview`).d('获取局端文件异常，请联系系统管理员'),
        });
      }
      if (!curImgUrl) {
        return notification.warning({
          description: '',
          placement: 'bottomRight',
          message: intl.get(`${modelCode}.view.preview`).d('获取局端文件中，请稍后重试'),
        });
      }
    }
    if (recordType === 'OFD') {
      const params = {
        tenantId,
        companyCode,
        employeeNumber,
        file: curImgUrl,
        encryptCode: 0,
      };
      const pdfRes = getResponse(await urlTojpg(params));
      if (pdfRes && pdfRes.status === '1000') {
        curImgUrl = pdfRes.data;
      }
    }
    this.setState({
      curImgUrl,
      recordType,
      fileName: this.queryDS.current && this.queryDS.current.get('invoiceSourceOrder'),
    });
  }

  componentDidMount() {
    const { search } = this.props.location;
    const { sourceType, headerId, employeeId } = this.props.match.params;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      this.setState({
        backPath: invoiceInfo.backPath,
      });
    }
    if (sourceType === 'REQUEST') {
      this.queryDS.setQueryParameter('headerId', headerId);
    }
    if (sourceType === 'ORDER') {
      this.queryDS.setQueryParameter('employeeId', employeeId);
    }
    this.queryDS.query().then(async () => {
      this.getState();
    });
  }

  // 上一张
  handleShowLast = () => {
    this.queryDS.pre();
    this.getState();
  };

  // 上一张
  handleShowNext = () => {
    this.queryDS.next();
    this.getState();
  };

  setViewerVisible = () => {
    this.setState({ viewerVisible: false });
  };

  renderArchives = () => {
    const { curImgUrl, recordType, viewerVisible, fileName } = this.state;
    if (curImgUrl) {
      const bucketName = 'hivp';
      const tokenUrl = `${HZERO_FILE}/v1/${tenantId}/file-preview/by-url?url=${encodeURIComponent(
        curImgUrl
      )}&bucketName=${bucketName}&access_token=${getAccessToken()}`;

      if (recordType === 'PDF') {
        return <iframe title="archive" src={tokenUrl} height="600" width="90%" frameBorder="0" />;
      } else if (recordType === 'OFD') {
        // return <ArchiveOfdPage recordType={recordType} curImgUrl={tokenUrl} />;
        return (
          <div>
            <img
              style={{ maxWidth: '50%' }}
              alt="archiveShow"
              src={`data:image/jpeg;base64,${curImgUrl}`}
              onClick={() => {
                this.setState({ viewerVisible: true });
              }}
            />
            <Viewer
              visible={viewerVisible}
              onClose={this.setViewerVisible}
              onMaskClick={this.setViewerVisible}
              images={[{ src: `data:image/jpeg;base64,${curImgUrl}`, alt: fileName }]}
            />
          </div>
        );
      } else {
        // return <img alt="archive" src={curImgUrl} />;
        return (
          <div>
            <img
              style={{ maxWidth: '50%' }}
              alt="archiveShow"
              src={tokenUrl}
              onClick={() => this.setState({ viewerVisible: true })}
            />
            <Viewer
              visible={viewerVisible}
              onClose={this.setViewerVisible}
              onMaskClick={this.setViewerVisible}
              images={[{ src: tokenUrl, alt: fileName }]}
            />
          </div>
        );
      }
    }
    return <div />;
  };

  // 红冲申请
  handleInvoiceRed = () => {
    const { dispatch } = this.props;
    const invoicingOrderHeaderId = this.queryDS.current!.get('invoicingOrderHeaderId');
    const companyId = this.queryDS.current!.get('companyId');
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-iop/invoice-req/invoiceRedFlush/REQUEST/${invoicingOrderHeaderId}/${companyId}`,
      })
    );
  };

  // 作废申请
  handleInvoiceVoid = () => {
    const { dispatch } = this.props;
    const invoiceVariety = this.queryDS.current!.get('invoiceVariety');
    const invoicingOrderHeaderId = this.queryDS.current!.get('invoicingOrderHeaderId');
    const companyId = this.queryDS.current!.get('companyId');
    if (invoiceVariety === '51' || invoiceVariety === '52') {
      notification.warning({
        message: intl.get(`${modelCode}.view.submitInvalid`).d('非纸质发票不可进行作废操作'),
        description: '',
      });
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/htc-front-iop/invoice-req/invoice-void/REQUEST/${invoicingOrderHeaderId}/${companyId}`,
        })
      );
    }
  };

  renderHeaderButtons = () => {
    const { sourceType } = this.props.match.params;
    const lastRec = this.queryDS.currentIndex < 0 ? 0 : this.queryDS.currentIndex;
    const headerBtns: JSX.Element[] = [];
    const VoidButtons = observer((props: any) => {
      const invoiceDate = props.dataSet.current && props.dataSet.current!.get('invoiceDate');
      const invoiceSourceType =
        props.dataSet.current && props.dataSet.current!.get('invoiceSourceType');
      const invoiceVariety = props.dataSet.current && props.dataSet.current!.get('invoiceVariety');
      const date = invoiceDate && invoiceDate.substring(0, 7);
      const currentDate = moment().format('YYYY-MM');
      let isDisabled = true;
      if (
        date === currentDate &&
        invoiceVariety !== '51' &&
        invoiceVariety !== '52' &&
        (invoiceSourceType === 'APPLY' || invoiceSourceType === 'RED_MARK')
      ) {
        isDisabled = false;
      }
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.raised}
          permissionList={[
            {
              code: `${permissionPath}.button.${props.permissionCode}`,
              type: 'button',
              meaning: `${props.permissionMeaning}`,
            },
          ]}
        >
          {props.title}
        </PermissionButton>
      );
    });
    const RedButtons = observer((props: any) => {
      const invoiceSourceType =
        props.dataSet.current && props.dataSet.current!.get('invoiceSourceType');
      const isDisabled = invoiceSourceType === 'RED_MARK';
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.raised}
          permissionList={[
            {
              code: `${permissionPath}.button.${props.permissionCode}`,
              type: 'button',
              meaning: `${props.permissionMeaning}`,
            },
          ]}
        >
          {props.title}
        </PermissionButton>
      );
    });
    if (sourceType === 'REQUEST') {
      headerBtns.push(
        <Button
          onClick={() => this.handleShowNext()}
          disabled={!this.queryDS.length || this.queryDS.currentIndex + 1 === this.queryDS.length}
        >
          {intl.get(`${modelCode}.button.next`).d('下一张')}({this.queryDS.currentIndex + 2})
        </Button>
      );
      headerBtns.push(
        <span style={{ marginLeft: '5px' }}>
          {this.queryDS.currentIndex + 1}/{this.queryDS.totalCount}
        </span>
      );
      headerBtns.push(
        <Button onClick={() => this.handleShowLast()} disabled={lastRec < 1}>
          {intl.get(`${modelCode}.button.last`).d('上一张')}({lastRec})
        </Button>
      );
      headerBtns.push(
        <RedButtons
          key="invoiceViewRedFlush"
          onClick={() => this.handleInvoiceRed()}
          dataSet={this.queryDS}
          title={intl.get(`${modelCode}.button.invoiceRedFlush`).d('红冲申请')}
          permissionCode="invoice-view-red"
          permissionMeaning="按钮-红冲申请"
        />
      );
      headerBtns.push(
        <VoidButtons
          key="invoiceViewVoid"
          onClick={() => this.handleInvoiceVoid()}
          dataSet={this.queryDS}
          title={intl.get(`${modelCode}.button.invoiceVoid`).d('作废申请')}
          permissionCode="invoice-view-void"
          permissionMeaning="按钮-作废申请"
        />
      );
    }
    return headerBtns;
  };

  render() {
    const { backPath } = this.state;
    return (
      <>
        <Header
          title={intl.get(`${modelCode}.title`).d('发票预览')}
          backPath={backPath || this.props.history.goBack}
        >
          {this.renderHeaderButtons()}
        </Header>
        <Content>
          <Spin dataSet={this.queryDS}>
            <Row>
              <Col span={24} style={{ textAlign: 'center' }}>
                {this.renderArchives()}
              </Col>
            </Row>
          </Spin>
        </Content>
      </>
    );
  }
}
