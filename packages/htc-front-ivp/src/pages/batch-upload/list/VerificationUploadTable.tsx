import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { observer } from 'mobx-react-lite';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { Button, DataSet, Table, Upload } from 'choerodon-ui/pro';
import { Col, Row } from 'choerodon-ui';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import commonConfig from '@htccommon/config/commonConfig';
import { API_HOST } from 'utils/config';
import { batchUploadRefresh } from '@src/services/invoicesService';
import { getAccessToken, getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import formatterCollections from 'utils/intl/formatterCollections';
import BatchUploadDS from '../stores/VerficationUploadDS';
import styles from '../batchUpload.less';

const modelCode = 'hivp.invoicesArchiveUpload';
const tenantId = getCurrentOrganizationId();
const HIVP_API = commonConfig.IVP_API;

interface RouterInfo {
  sourceCode: string;
  sourceHeaderId: any;
  companyId: any;
}

interface ArchiveUploadPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [
    modelCode,
    'htc.common',
    'hivp.checkCertification',
    'hivp.batchCheck',
    'hivp.bill',
    'hivp.invoicesFileArchive',
    'hiop.invoiceWorkbench',
  ],
})
export default class VerificationUploadTable extends Component<ArchiveUploadPageProps> {
  state = {
    companyCode: '',
    employeeNum: '',
    backPath: '',
  };

  multipleDS = new DataSet({
    autoQuery: false,
    ...BatchUploadDS(),
  });

  async componentDidMount() {
    const { companyId } = this.props.match.params;
    const { search } = this.props.location;
    this.multipleDS.setQueryParameter('companyId', companyId);
    this.multipleDS.query();
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      const empRes = await getCurrentEmployeeInfo({ tenantId, companyId });
      const currentEmp = empRes && empRes.content[0];
      this.setState({
        companyCode: currentEmp.companyCode,
        employeeNum: currentEmp && currentEmp.employeeNum,
        backPath: invoiceInfo.backPath,
      });
    }
  }

  handleUploadSuccess = response => {
    try {
      const multipleData = JSON.parse(response);
      const res = getResponse(multipleData);
      if (res) {
        this.multipleDS.query();
      }
    } catch (err) {
      notification.error({
        description: err.message,
        message: intl.get(`${modelCode}.view.uploadInvalid`).d('上传返回数据无效'),
      });
    }
  };

  handleUploadError = response => {
    notification.error({
      description: '',
      message: response,
    });
  };

  @Bind()
  async handleDelete() {
    const list = this.multipleDS.selected;
    this.multipleDS.delete(list);
  }

  /**
   * 操作列按钮
   * @params {object} record-行记录
   * @returns {*[]}
   */
  @Bind()
  commands(record) {
    const btns: any = [];
    if (['3', '4'].includes(record.get('dataStatus'))) {
      btns.push(
        <a onClick={() => this.refresh(record)}>
          {intl.get('hzero.common.button.refresh').d('刷新')}
        </a>,
        <a onClick={() => this.multipleDS.delete(record)}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </a>
      );
    } else {
      btns.push(
        <a onClick={() => this.refresh(record)}>
          {intl.get('hzero.common.button.refresh').d('刷新')}
        </a>
      );
    }
    return [
      <span className="action-link" key="action">
        {btns}
      </span>,
    ];
  }

  @Bind()
  gotoDetail(record) {
    const { history } = this.props;
    const { sourceCode, companyId } = this.props.match.params;
    const uploadArchivesHeaderId = record.get('uploadArchivesHeaderId');
    const pathname = `/htc-front-ivp/invoices/batch-upload/detail/${sourceCode}/${uploadArchivesHeaderId}/${companyId}`;
    history.push(pathname);
  }

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      {
        name: 'batchNo',
        width: 200,
        renderer: ({ value, record }) => <a onClick={() => this.gotoDetail(record)}>{value}</a>,
      },
      { name: 'fileName', width: 150 },
      { name: 'dataStatus', width: 120 },
      { name: 'statusDescription', width: 240 },
      { name: 'creationDate', width: 160 },
      { name: 'lastUpdateDate', width: 160 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        renderer: ({ record }) => this.commands(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  @Bind()
  async refresh(record) {
    let batchNos = this.multipleDS.selected.map(_record => _record.get('batchNo'));
    if (record) {
      batchNos = [record.get('batchNo')];
    }
    const res = getResponse(await batchUploadRefresh({ tenantId, batchNos }));
    if (res) {
      this.multipleDS.query();
    }
  }

  get buttons(): Buttons[] {
    const ObserverButton = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          color={ButtonColor.default}
          funcType={FuncType.link}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <ObserverButton
        key="batchRefresh"
        onClick={() => this.refresh(null)}
        dataSet={this.multipleDS}
        title={intl.get(`${modelCode}.button.batchRefresh`).d('批量刷新')}
      />,
      <ObserverButton
        key="batchDelete"
        onClick={() => this.handleDelete()}
        dataSet={this.multipleDS}
        title={intl.get('hiop.invoiceWorkbench.button.batchDelete').d('批量删除')}
      />,
    ];
  }

  @Bind()
  renderQueryBar(tableProps) {
    const { buttons } = tableProps;
    const { sourceCode, companyId } = this.props.match.params;
    const { companyCode, employeeNum } = this.state;
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
      },
      data: {
        companyId,
        companyCode,
        employeeNo: employeeNum,
        sourceCode,
        uuid: uuidv4(),
      },
      multiple: false,
      showUploadBtn: false,
      showPreviewImage: true,
      showUploadList: false,
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleUploadError,
    };
    return (
      <>
        <Row>
          <Col span={18}>
            <div className={styles.upload}>
              <Upload
                {...uploadProps}
                accept={['.zip', '.rar', '.7z']}
                action={`${API_HOST}${HIVP_API}/v1/${tenantId}/archives-update/batch-upload-and-check`}
              >
                <Button color={ButtonColor.primary}>
                  {intl.get('hivp.invoicesArchiveUpload.upload.txt').d('校验上传')}
                </Button>
              </Upload>
            </div>
          </Col>
          <Col span={6} style={{ textAlign: 'end' }}>
            {buttons}
          </Col>
        </Row>
      </>
    );
  }

  render() {
    const { backPath } = this.state;
    return (
      <>
        <Header
          backPath={backPath}
          title={intl.get(`${modelCode}.title.uploadFile`).d('档案上传')}
        />
        <Content>
          <Table
            dataSet={this.multipleDS}
            columns={this.columns}
            buttons={this.buttons}
            queryBar={this.renderQueryBar}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
