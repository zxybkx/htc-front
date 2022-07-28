/*
 * @Description:退税勾选
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-03-24 14:23:33
 * @LastEditTime: 2022-07-26 17:24:35
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import { observer } from 'mobx-react-lite';
import { API_HOST } from 'utils/config';
import commonConfig from '@htccommon/config/commonConfig';
import {
  Button,
  Currency,
  DataSet,
  DatePicker,
  Dropdown,
  Form,
  Lov,
  Menu,
  Modal as ModalPro,
  Output,
  Password,
  Progress,
  Select,
  Spin,
  Table,
  Tabs,
  TextField,
  Upload,
} from 'choerodon-ui/pro';
import { Col, Icon, Modal, Row } from 'choerodon-ui';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import intl from 'utils/intl';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@htccommon/utils/utils';
import { getAccessToken, getCurrentOrganizationId, getResponse } from 'utils/utils';
import {
  getCurrentEmployeeInfo,
  getTenantAgreementCompany,
} from '@htccommon/services/commonService';
import {
  getTaskPassword,
  getTaxAuthorityCode,
  updateEnterpriseFile,
} from '@src/services/checkCertificationService';
import {
  batchOperationRefundInvoice,
  downloadFile,
  getProgress,
  refresh,
  refundInvoiceQuery,
  submitRefundCheckRequest,
} from '@src/services/taxRefundService';
import withProps from 'utils/withProps';
import moment from 'moment';
import uuidv4 from 'uuid/v4';
import notification from 'utils/notification';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { ProgressStatus } from 'choerodon-ui/lib/progress/enum';
import queryString from 'query-string';
import { isEmpty, split, uniq } from 'lodash';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import formatterCollections from 'utils/intl/formatterCollections';
import TaxRefundHeaderDS from '../stores/TaxRefundHeaderDS';
import CurrentTaxRefundHeaderDS from '../stores/CurrentTaxRefundHeaderDS';
import BatchTaxRefundHeaderDS from '../stores/BatchTaxRefundHeaderDS';
import BatchTaxRefundLineDS from '../stores/BatchTaxRefundLineDS';
import CompanyAndPasswordDS from '../../check-certification/stores/CompanyAndPasswordDS';
import styles from '../../check-certification/checkcertification.less';

const { TabPane } = Tabs;
const permissionPath = `${getPresentMenu().name}.ps`;
const { Option } = Select;
const { Item: MenuItem } = Menu;

const modelCode = 'hivp.taxRefund';
const tenantId = getCurrentOrganizationId();
const HIVP_API = commonConfig.IVP_API;

interface TaxRefundPageProps {
  dispatch: Dispatch<any>;
  location: any;
  taxRefundHeaderDS: DataSet;
  currentTaxRefundHeaderDS: DataSet;
  batchTaxRefundHeaderDS: DataSet;
  companyAndPassword: DataSet;
}

@withProps(
  () => {
    const taxRefundHeaderDS = new DataSet({
      autoQuery: false,
      ...TaxRefundHeaderDS(),
    });
    const currentTaxRefundHeaderDS = new DataSet({
      autoQuery: false,
      ...CurrentTaxRefundHeaderDS(),
    });
    const companyAndPassword = new DataSet({
      autoQuery: false,
      ...CompanyAndPasswordDS(),
    });
    return {
      taxRefundHeaderDS,
      currentTaxRefundHeaderDS,
      companyAndPassword,
    };
  },
  { cacheState: true }
)
@formatterCollections({
  code: [
    modelCode,
    'hivp.checkCertification',
    'hiop.invoiceWorkbench',
    'hiop.invoiceRule',
    'hiop.invoiceReq',
  ],
})
export default class TaxRefundListPage extends Component<TaxRefundPageProps> {
  state = {
    spinning: true,
    displayOptions: [] as any,
    checked: true, // 已勾选
    unchecked: false, // 未勾选
    progressValue: 0,
    progressStatus: ProgressStatus.active,
    visible: false, // 进度条是否显示
    empInfo: {} as any,
    loadingFlag: false,
    hide: true, // 数据汇总表格是否隐藏
    isBatchFreshDisabled: true, // 批量退税刷新是否可点
    currentTaxRefundMoreDisplay: false,
    batchTaxMoreDisplay: false,
  };

  multipleUpload;

  multipleUploadUuid;

  batchTaxRefundLineDS = new DataSet({
    autoQuery: false,
    ...BatchTaxRefundLineDS(),
  });

  batchTaxRefundHeaderDS = new DataSet({
    autoQuery: false,
    ...BatchTaxRefundHeaderDS(),
    children: {
      batchTaxRefundLineList: this.batchTaxRefundLineDS,
    },
  });

  @Bind()
  async getTaskPassword(companyObj, dataSet) {
    const res = await getTaskPassword({
      tenantId,
      companyCode: companyObj.companyCode,
    });
    if (res && res.content && !isEmpty(res.content)) {
      const { taxDiskPassword } = res.content[0];
      dataSet.current!.set({ taxDiskPassword });
    }
  }

  // 根据所属公司获取数据
  @Bind()
  async getDataFromCompany(companyObj) {
    const { queryDataSet } = this.props.taxRefundHeaderDS;
    const { queryDataSet: curTaxDs } = this.props.currentTaxRefundHeaderDS;
    const { queryDataSet: batchDs } = this.batchTaxRefundHeaderDS;
    const { companyId, companyCode, employeeNum } = companyObj;
    const resCop = await getTenantAgreementCompany({ companyId, tenantId });
    const { inChannelCode } = resCop;
    const { competentTaxAuthorities } = await getTaxAuthorityCode({ tenantId, companyId });
    if (queryDataSet && curTaxDs && batchDs) {
      queryDataSet.current!.set({ companyObj });
      curTaxDs.current!.set({ companyObj });
      batchDs.current!.set({ companyObj });
      // queryDataSet.current!.set({ inChannelCode });
      this.props.companyAndPassword.current!.set({ inChannelCode });
      curTaxDs.current!.set({ authorityCode: competentTaxAuthorities });
      batchDs.current!.set({ authorityCode: competentTaxAuthorities });
      if (inChannelCode === 'AISINO_IN_CHANNEL') {
        // queryDataSet.current!.set({ taxDiskPassword: '88888888' });
        this.props.companyAndPassword.current!.set({ taxDiskPassword: '88888888' });
      } else {
        // 获取税盘密码
        this.getTaskPassword(companyObj, this.props.companyAndPassword);
      }
    }
    this.setState({ empInfo: companyObj });
    this.props.taxRefundHeaderDS.setQueryParameter('companyId', companyId);
    this.props.currentTaxRefundHeaderDS.setQueryParameter('companyCode', companyCode);
    this.props.currentTaxRefundHeaderDS.setQueryParameter('employeeNumber', employeeNum);
    this.props.taxRefundHeaderDS.query();
  }

  async componentDidMount() {
    const { queryDataSet } = this.props.taxRefundHeaderDS;
    const { queryDataSet: currentTaxqs } = this.props.currentTaxRefundHeaderDS;
    const { queryDataSet: batchDs } = this.batchTaxRefundHeaderDS;
    const res = await getCurrentEmployeeInfo({ tenantId });
    const displayOptions = await queryIdpValue('HIVP.CHECK_CONFIRM_DISPLAY_OPTIONS');
    if (queryDataSet) {
      const curCompanyId = queryDataSet.current!.get('companyId');
      if (res && res.content) {
        const empInfo = res.content[0];
        if (empInfo && !curCompanyId) {
          this.getDataFromCompany(empInfo);
        }
        this.props.companyAndPassword.loadData(res.content);
      }
      if (curCompanyId) {
        const curInfo = await getCurrentEmployeeInfo({ tenantId, companyId: curCompanyId });
        const authorityCode = currentTaxqs && currentTaxqs.current!.get('authorityCode');
        if (curInfo && curInfo.content) {
          const empInfo = curInfo.content[0];
          if (batchDs) {
            batchDs.current!.set({ companyObj: empInfo });
            batchDs.current!.set({ authorityCode });
          }
          this.setState({ empInfo });
        }
      }
      this.setState({
        displayOptions,
        spinning: false,
      });
    }
    if (currentTaxqs && displayOptions) {
      const curDisplayOptions = currentTaxqs.current!.get('invoiceDisplayOptions');
      if (!curDisplayOptions) {
        currentTaxqs.current!.set({
          invoiceDisplayOptions: [
            'UNCHECKED',
            'ACCOUNTED',
            'DISACCOUNT',
            'DOCS_UNITED',
            'NON_DOCS',
          ],
        });
      } else {
        const invoiceDisplayOptionsArr = split(curDisplayOptions, ',');
        if (invoiceDisplayOptionsArr.indexOf('CURRENT_PERIOD_CHECKED') > -1) {
          this.setState({
            checked: false,
            unchecked: true,
          });
        } else {
          this.setState({
            unchecked: false,
          });
        }
        if (invoiceDisplayOptionsArr.indexOf('UNCHECKED') > -1) {
          this.setState({
            unchecked: false,
            checked: true,
          });
        } else {
          this.setState({
            checked: false,
          });
        }
      }
    }
  }

  /**
   * 更新企业档案
   * @returns
   */
  @Bind()
  async updateEnterprise() {
    const { queryDataSet } = this.props.taxRefundHeaderDS;
    if (queryDataSet) {
      const curInfo = queryDataSet.current!.toData();
      const { companyId, companyCode, employeeNumber, employeeId } = curInfo;
      const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
      const res = await updateEnterpriseFile({
        tenantId,
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        taxDiskPassword,
      });
      if (res && !res.failed) {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        this.props.taxRefundHeaderDS.query();
      } else {
        notification.error({
          description: '',
          message: res && res.message,
        });
      }
    }
  }

  @Bind()
  async companyChange(value) {
    const { taxRefundHeaderDS } = this.props;
    const { queryDataSet } = taxRefundHeaderDS;
    if (queryDataSet && value) {
      this.getDataFromCompany(value);
    }
  }

  saveMultipleUpload = node => {
    this.multipleUpload = node;
  };

  get columns(): ColumnProps[] {
    return [
      { name: 'checkState' },
      { name: 'annotation', width: 200 },
      { name: 'abnormalSign' },
      { name: 'entryAccountState' },
      { name: 'receiptsState' },
      { name: 'invoiceType', width: 150 },
      { name: 'invoiceState' },
      { name: 'invoiceCode', width: 150 },
      { name: 'invoiceNo' },
      { name: 'invoiceDate', width: 150 },
      { name: 'invoiceAmountGross' },
      { name: 'invoiceTheAmount' },
      { name: 'buyerName' },
      { name: 'buyerTaxNo', width: 150 },
      { name: 'salerTaxName' },
      { name: 'salerTaxNo', width: 150 },
      { name: 'checkDate', width: 150 },
      { name: 'confirmState' },
      { name: 'confirmDate', width: 150 },
      { name: 'authenticationMethod' },
      { name: 'infoSource' },
      { name: 'managementState' },
      { name: 'batchNo' },
      { name: 'failReason' },
      { name: 'requestTime', width: 150 },
      { name: 'completeTime', width: 150 },
    ];
  }

  @Bind()
  async batchOperation(record) {
    const { empInfo } = this.state;
    const { companyId, companyCode, employeeId, employeeNum, taxpayerNumber } = empInfo;

    const { queryDataSet: batchDs } = this.batchTaxRefundHeaderDS;
    // const taxDiskPassword = queryDataSet && queryDataSet.current!.get('taxDiskPassword');
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    const queryData = batchDs && batchDs.current!.toData(true);
    const currentPeriod = moment().format('YYYYMM');
    const salerTaxNo = this.props.taxRefundHeaderDS.current!.get('currentTaxpayerNumber');
    const params = {
      tenantId,
      companyId,
      companyCode,
      employeeId,
      employeeNumber: employeeNum,
      taxpayerNumber,
      currentPeriod,
      taxDiskPassword,
      batchNo: record.get('batchNo'),
      salerTaxNo,
      ...queryData,
    };
    const res = getResponse(await batchOperationRefundInvoice(params));
    if (res && res.status === '1000') {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.batchTaxRefundHeaderDS.query();
    } else {
      notification.error({
        description: '',
        message: res && res.message,
      });
    }
  }

  get batchHeaderColumns(): ColumnProps[] {
    return [
      { name: 'checkState' },
      { name: 'invoiceNum' },
      { name: 'totalInvoiceAmountGross' },
      { name: 'totalInvoiceTheAmount' },
      { name: 'batchNo' },
      { name: 'failReason' },
      { name: 'requestTime' },
      { name: 'completeTime' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        command: ({ record }): Commands[] => {
          const checkState = record.get('checkState');
          return [
            <Button onClick={() => this.batchOperation(record)} funcType={FuncType.link}>
              {checkState === '0'
                ? intl.get(`${modelCode}.status.checkFlag`).d('全部勾选')
                : intl.get(`${modelCode}.status.checkNotFlag`).d('全部撤销')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  get batchLineColumns(): ColumnProps[] {
    return [
      { name: 'uploadDate' },
      { name: 'checkResult' },
      { name: 'invoiceNum' },
      { name: 'invoiceAllAmountGross' },
      { name: 'invoiceAllAmount' },
    ];
  }

  @Bind()
  handleOpChange(value) {
    if (value) {
      if (value.indexOf('CURRENT_PERIOD_CHECKED') > -1) {
        this.setState({
          checked: false,
          unchecked: true,
        });
      } else {
        this.setState({
          unchecked: false,
        });
      }

      if (value.indexOf('UNCHECKED') > -1) {
        this.setState({
          unchecked: false,
          checked: true,
        });
      } else {
        this.setState({
          checked: false,
        });
      }
    }
  }

  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, buttons, dataSet } = props;
    const { displayOptions, currentTaxRefundMoreDisplay } = this.state;
    let optionList = [];
    if (displayOptions.length > 0) {
      optionList = displayOptions.map((item: any) => {
        const { unchecked, checked } = this.state;
        let disabledParam;
        if (item.value === 'CURRENT_PERIOD_CHECKED') {
          disabledParam = checked;
        }
        if (item.value === 'UNCHECKED') {
          disabledParam = unchecked;
        }
        return (
          <Option value={item.value} key={item.value} disabled={disabledParam}>
            {item.meaning}
          </Option>
        );
      });
    }
    const queryMoreArray: JSX.Element[] = [];
    queryMoreArray.push(<TextField name="invoiceNo" />);
    queryMoreArray.push(<DatePicker name="invoiceDateFrom" />);
    queryMoreArray.push(<DatePicker name="invoiceDateTo" />);
    queryMoreArray.push(<TextField name="salerTaxNo" />);
    queryMoreArray.push(<Select name="manageState" />);
    queryMoreArray.push(<Select name="invoiceState" />);
    queryMoreArray.push(
      <Select name="invoiceDisplayOptions" multiple colSpan={3} onChange={this.handleOpChange}>
        {optionList}
      </Select>
    );
    queryMoreArray.push(
      <TextField
        name="number"
        newLine
        renderer={value =>
          value.text && `${value.text}${intl.get('hivp.checkCertification.view.share').d('份')}`
        }
      />
    );
    queryMoreArray.push(<Currency name="amount" />);
    queryMoreArray.push(<Currency name="taxAmount" />);
    return (
      <div style={{ marginBottom: '0.1rem' }}>
        <Row>
          <Col span={18}>
            <Form dataSet={queryDataSet} columns={3}>
              <TextField name="checkMonth" />
              <Select
                name="invoiceType"
                optionsFilter={record =>
                  record.get('value') === '01' || record.get('value') === '17'
                }
              />
              <TextField name="invoiceCode" />
              {currentTaxRefundMoreDisplay && queryMoreArray}
            </Form>
          </Col>
          <Col span={6} style={{ textAlign: 'end' }}>
            <Button
              funcType={FuncType.link}
              onClick={() =>
                this.setState({ currentTaxRefundMoreDisplay: !currentTaxRefundMoreDisplay })
              }
            >
              {currentTaxRefundMoreDisplay ? (
                <span>
                  {intl.get('hzero.common.table.column.option').d('更多')}
                  <Icon type="expand_more" />
                </span>
              ) : (
                <span>
                  {intl.get('hzero.common.table.column.option').d('更多')}
                  <Icon type="expand_less" />
                </span>
              )}
            </Button>
            <Button
              onClick={() => {
                queryDataSet.reset();
                queryDataSet.create();
              }}
            >
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
          </Col>
        </Row>
        {buttons}
      </div>
    );
  }

  @Bind()
  handleBatchQuery() {
    // const { queryDataSet } = this.props.taxRefundHeaderDS;
    // if (queryDataSet) {
    // const taxDiskPassword = queryDataSet.current!.get('taxDiskPassword');
    // }
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    this.batchTaxRefundHeaderDS.setQueryParameter('taxDiskPassword', taxDiskPassword);
    this.batchTaxRefundLineDS.setQueryParameter('taxDiskPassword', taxDiskPassword);
    this.batchTaxRefundHeaderDS.query();
  }

  @Bind()
  renderBatchQueryBar(props) {
    const { queryDataSet, buttons, dataSet } = props;
    const { empInfo, batchTaxMoreDisplay } = this.state;
    const { companyId, companyCode, employeeId, employeeNum, taxpayerNumber } = empInfo;
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    const checkMonth = moment().format('YYYYMM');
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
      },
      data: {},
      action: `${API_HOST}${HIVP_API}/v1/${tenantId}/refund-invoice-operation/upload-refund-file?companyId=${companyId}&companyCode=${companyCode}&employeeId=${employeeId}&employeeNumber=${employeeNum}&taxpayerNumber=${taxpayerNumber}&taxDiskPassword=${taxDiskPassword}&checkMonth=${checkMonth}`,
      multiple: false,
      uploadImmediately: false,
      showUploadBtn: false,
      showPreviewImage: true,
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleUploadError,
    };
    const queryMoreArray: JSX.Element[] = [];
    queryMoreArray.push(<TextField name="salerTaxNo" />);
    queryMoreArray.push(
      <Select
        name="checkFlag"
        clearButton={false}
        optionsFilter={record => record.get('value') !== '-1' && record.get('value') !== 'R'}
      />
    );
    queryMoreArray.push(
      <Output
        label={intl.get(`${modelCode}.table.batchTaxHeader`).d('文件选择')}
        colSpan={2}
        renderer={() => (
          <Upload
            ref={this.saveMultipleUpload}
            {...uploadProps}
            accept={[
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-excel',
            ]}
          />
        )}
      />
    );
    return (
      <div style={{ marginBottom: '0.1rem' }}>
        <Row>
          <Col span={19}>
            <Form dataSet={queryDataSet} columns={3}>
              <TextField name="checkMonth" />
              <DatePicker name="invoiceDateFrom" />
              <DatePicker name="invoiceDateTo" />
              {batchTaxMoreDisplay && queryMoreArray}
            </Form>
          </Col>
          <Col span={5} style={{ textAlign: 'end' }}>
            <Button
              funcType={FuncType.link}
              onClick={() => this.setState({ batchTaxMoreDisplay: !batchTaxMoreDisplay })}
            >
              {batchTaxMoreDisplay ? (
                <span>
                  {intl.get('hzero.common.table.column.option').d('更多')}
                  <Icon type="expand_more" />
                </span>
              ) : (
                <span>
                  {intl.get('hzero.common.table.column.option').d('更多')}
                  <Icon type="expand_less" />
                </span>
              )}
            </Button>
            <Button
              onClick={() => {
                queryDataSet.reset();
                queryDataSet.create();
              }}
            >
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
          </Col>
        </Row>
        {buttons}
        <div className="c7n-pro-table-header">
          {intl.get(`${modelCode}.table.DataSummary`).d('数据汇总情况')}
        </div>
      </div>
    );
  }

  @Bind()
  handleTaxComfirm() {
    const { dispatch } = this.props;
    const { queryDataSet } = this.props.taxRefundHeaderDS;
    const { queryDataSet: curQS } = this.props.currentTaxRefundHeaderDS;
    const authorityCode = curQS && curQS.current!.get('authorityCode');
    // const taxDiskPassword = queryDataSet && queryDataSet.current!.get('taxDiskPassword');
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    const taxInfo = {
      authorityCode,
      taxDiskPassword,
    };
    if (queryDataSet && queryDataSet.current) {
      const companyId = queryDataSet.current.get('companyId');
      dispatch(
        routerRedux.push({
          pathname: `/htc-front-ivp/tax-refund/texRefundConfirm/${companyId}`,
          search: queryString.stringify({
            taxInfo: encodeURIComponent(JSON.stringify(taxInfo)),
          }),
        })
      );
    }
  }

  // 退税发票实时查询
  @Bind()
  async handleRealTimeTaxRefund() {
    const { taxRefundHeaderDS, currentTaxRefundHeaderDS } = this.props;
    const { queryDataSet: mainQueryDataSet } = taxRefundHeaderDS;
    const { queryDataSet } = currentTaxRefundHeaderDS;
    if (queryDataSet && mainQueryDataSet) {
      const mainQueryData = mainQueryDataSet.current!.toData(true);
      const queryData = queryDataSet.current!.toData(true);
      const { companyId, companyCode, employeeNumber, employeeId } = mainQueryData;
      const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
      const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
      const findParams = {
        tenantId,
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        taxDiskPassword,
        timestamp,
        queryData,
      };
      const progressParams = {
        tenantId,
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        timestamp,
      };
      const res = getResponse(await refundInvoiceQuery(findParams));
      if (res) {
        this.setState({
          progressValue: 0,
          progressStatus: ProgressStatus.active,
          visible: true,
        });
        this.loopRequest(progressParams);
      }
    }
  }

  /**
   * 循环查看进度
   * @returns
   */
  async loopRequest(params) {
    const res = getResponse(await getProgress(params));
    this.setState({
      progressValue: res,
    });
    if (res && res < 100) {
      this.loopRequest(params);
    } else {
      this.setState({
        progressValue: res,
        progressStatus: ProgressStatus.success,
        visible: false,
      });
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      await this.props.currentTaxRefundHeaderDS.query();
    }
  }

  @Bind()
  async handleRefundRequest(selectedList, type) {
    const { empInfo } = this.state;

    const { queryDataSet: curQS } = this.props.currentTaxRefundHeaderDS;
    // const taxDiskPassword = queryDataSet && queryDataSet.current!.get('taxDiskPassword');
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    const authorityCode = curQS && curQS.current!.get('authorityCode');
    const params = {
      tenantId,
      empInfo,
      taxDiskPassword,
      authorityCode,
      selectedList,
      checkFlag: type,
    };
    const res = getResponse(await submitRefundCheckRequest(params));
    if (res && res.status === '1000') {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      await this.props.currentTaxRefundHeaderDS.query();
    } else {
      notification.error({
        description: '',
        message: res && res.message,
      });
    }
  }

  // 提交退税发票勾选请求
  @Bind()
  async handleSubmitTax() {
    const selectedList = this.props.currentTaxRefundHeaderDS.selected.map(rec => rec.toData());
    if (selectedList.some(item => item.checkState !== '0')) {
      notification.warning({
        description: '',
        message: intl
          .get('hivp.checkCertification.view.tickInvalid')
          .d('存在勾选状态为非未勾选状态的发票，无法提交'),
      });
      return;
    }
    this.handleRefundRequest(selectedList, '1');
  }

  // 提交退税发票取消勾选请求
  @Bind()
  async handleCancelTax() {
    const selectedList = this.props.currentTaxRefundHeaderDS.selected.map(rec => rec.toData());
    if (selectedList.some(item => item.checkState !== '1')) {
      notification.warning({
        description: '',
        message: intl
          .get('hivp.checkCertification.view.tickInvalid1')
          .d('存在勾选状态为非已勾选状态的发票，无法提交'),
      });
      return;
    }
    this.handleRefundRequest(selectedList, '0');
  }

  // 刷新状态
  @Bind()
  async refresh(type) {
    const { empInfo } = this.state;
    let unPass;
    let batchNoList;
    if (type === 0) {
      const selectedList = this.props.currentTaxRefundHeaderDS.selected.map(rec => rec.toData());
      unPass = selectedList.some(item => item.checkState !== 'R');
      batchNoList = uniq(selectedList.map(item => item.batchNo));
    }
    if (unPass) {
      notification.warning({
        description: '',
        message: intl
          .get('hivp.checkCertification.view.tickInvalid2')
          .d('存在勾选状态为非请求中状态的发票，无法刷新'),
      });
      return;
    }
    const params = { tenantId, empInfo, batchNoList };
    const res = getResponse(await refresh(params));
    if (res && res.status === '1000') {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      if (type === 0) {
        this.props.currentTaxRefundHeaderDS.query();
      } else {
        this.batchTaxRefundHeaderDS.query();
        this.setState({
          hide: false,
          isBatchFreshDisabled: true,
        });
      }
    } else {
      notification.error({
        description: '',
        message: res && res.message,
      });
    }
  }

  get buttons(): Buttons[] {
    const { empInfo } = this.state;
    const { companyId } = empInfo;
    const HeaderButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      const { condition } = props;
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={condition === 'refresh' ? FuncType.flat : FuncType.link}
          // color={ButtonColor.primary}
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
    const btnMenu = (
      <Menu>
        <MenuItem>
          <HeaderButtons
            key="submitTaxRefund"
            onClick={() => this.handleSubmitTax()}
            dataSet={this.props.currentTaxRefundHeaderDS}
            title={intl.get('hivp.checkCertification.button.submitTickRequest').d('提交勾选')}
            permissionCode="submit-tax-refund"
            permissionMeaning="按钮-提交退税发票勾选请求"
          />
        </MenuItem>
        <MenuItem>
          <HeaderButtons
            key="cancelTaxRefund"
            onClick={() => this.handleCancelTax()}
            dataSet={this.props.currentTaxRefundHeaderDS}
            title={intl.get('hivp.checkCertification.button.submitCancelTickRequest').d('取消勾选')}
            permissionCode="cancel-tax-refund"
            permissionMeaning="按钮-提交退税发票取消勾选请求"
          />
        </MenuItem>
      </Menu>
    );
    return [
      <Dropdown overlay={btnMenu}>
        <Button color={ButtonColor.primary}>
          {intl.get(`${modelCode}.button.dataRefundCheck`).d('退税勾选')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
      <PermissionButton
        type="c7n-pro"
        key="getVerifiableInvoices"
        disabled={!companyId}
        onClick={this.handleRealTimeTaxRefund}
        permissionList={[
          {
            code: `${permissionPath}.button.get-verifiableinvoices`,
            type: 'button',
            meaning: '按钮-退税发票实时查询',
          },
        ]}
      >
        {intl.get(`${modelCode}.button.getVerifiableInvoices`).d('退税发票实时查询')}
      </PermissionButton>,
      <PermissionButton
        type="c7n-pro"
        key="taxRefund"
        disabled={!companyId}
        onClick={this.handleTaxComfirm}
        color={ButtonColor.default}
        permissionList={[
          {
            code: `${permissionPath}.button.confirm-tax-refund`,
            type: 'button',
            meaning: '按钮-退税勾选确认',
          },
        ]}
      >
        {intl.get('hivp.checkCertification.title.refund').d('退税勾选确认')}
      </PermissionButton>,
      <HeaderButtons
        key="refresh"
        onClick={() => this.refresh(0)}
        dataSet={this.props.currentTaxRefundHeaderDS}
        title={intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态')}
        permissionCode="refresh"
        permissionMeaning="按钮-刷新状态"
        condition="refresh"
      />,
    ];
  }

  @Bind()
  handleUploadSuccess(response) {
    try {
      const multipleData = JSON.parse(response);
      const res = getResponse(multipleData);
      if (res && res.status === '1000') {
        notification.success({
          description: '',
          message: intl.get('hzero.c7nProUI.Upload.upload_success').d('上传成功'),
        });
        this.setState({ isBatchFreshDisabled: false });
      }
    } catch (err) {
      notification.error({
        description: '',
        message: err.message,
      });
    }
    this.setState({ loadingFlag: false });
  }

  @Bind()
  handleUploadError(response) {
    this.setState({ loadingFlag: false });
    notification.error({
      description: '',
      message: response,
    });
  }

  // 下载发票文件
  @Bind()
  async downLoad() {
    const { empInfo } = this.state;
    const { companyId, companyCode, employeeId, employeeNum, taxpayerNumber } = empInfo;
    const needDownloadKey = this.batchTaxRefundHeaderDS.current!.get('needDownloadKey');
    const params = {
      tenantId,
      companyId,
      companyCode,
      employeeId,
      employeeNumber: employeeNum,
      needDownloadKey,
    };
    const res = getResponse(await downloadFile(params));
    if (res) {
      const date = moment().format('YYYY-MM-DD HH:mm:ss');
      const blob = new Blob([res]); // 字节流
      if ((window.navigator as any).msSaveBlob) {
        try {
          (window.navigator as any).msSaveBlob(blob, `${taxpayerNumber}_${date}.zip`);
        } catch (e) {
          notification.error({
            description: '',
            message: intl.get('hiop.invoiceRule.notification.error.upload').d('下载失败'),
          });
        }
      } else {
        const aElement = document.createElement('a');
        const blobUrl = window.URL.createObjectURL(blob);
        aElement.href = blobUrl; // 设置a标签路径
        aElement.download = `${taxpayerNumber}_${date}.zip`;
        aElement.click();
        window.URL.revokeObjectURL(blobUrl);
      }
    }
  }

  // 上传
  @Bind()
  upload() {
    this.multipleUploadUuid = uuidv4();
    this.multipleUpload.startUpload();
    if (this.multipleUpload.fileList.length > 0) {
      this.setState({ loadingFlag: true });
    }
  }

  get batchButtons(): Buttons[] {
    const { empInfo, loadingFlag, isBatchFreshDisabled } = this.state;
    const { companyId } = empInfo;
    const HeaderButtons = observer((props: any) => {
      let isDisabled;
      if (props.type === 'downLoad') {
        isDisabled = props.dataSet!.length === 0;
      } else {
        isDisabled = props.dataSet!.selected.length === 0 || isBatchFreshDisabled;
      }
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
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
    return [
      <PermissionButton
        type="c7n-pro"
        key="upload"
        disabled={!companyId}
        onClick={this.upload}
        loading={loadingFlag}
        permissionList={[
          {
            code: `${permissionPath}.button.upload`,
            type: 'button',
            meaning: '按钮-上传',
          },
        ]}
      >
        {intl.get('hzero.common.button.upload').d('上传')}
      </PermissionButton>,
      <HeaderButtons
        key="downloadFile"
        onClick={this.downLoad}
        dataSet={this.batchTaxRefundHeaderDS}
        title={intl.get(`${modelCode}.button.downloadFile`).d('下载发票文件')}
        permissionCode="download-file"
        permissionMeaning="按钮-下载发票文件"
        type="downLoad"
      />,
      <HeaderButtons
        key="refresh"
        onClick={() => this.refresh(1)}
        dataSet={this.batchTaxRefundHeaderDS}
        title={intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态')}
        permissionCode="batch-refresh"
        permissionMeaning="按钮-刷新状态"
        type="refresh"
      />,
    ];
  }

  // @Bind()
  // getTaxDiskPassword(value) {
  //   if (value) {
  //     this.setState({
  //       taxDiskPassword: value,
  //     });
  //   }
  // }

  @Bind()
  async handlePasswordSave(modal) {
    const validate = await this.props.companyAndPassword.validate(false, false);
    if (validate) {
      const res = await this.props.companyAndPassword.submit();
      if (res && res.status === 'H1014') {
        modal.close();
      }
    }
  }

  @Bind()
  taxDiskPasswordChange(record) {
    const modal = ModalPro.open({
      title: intl.get(`${modelCode}.title.editDiskPass`).d('编辑税盘密码'),
      children: (
        <Form record={record}>
          <TextField name="companyName" />
          <Password name="taxDiskPassword" />
        </Form>
      ),
      closable: true,
      onOk: () => this.handlePasswordSave(modal),
      onCancel: () => this.props.companyAndPassword.reset(),
    });
  }

  @Bind()
  showDetail() {
    const modal = ModalPro.open({
      title: intl.get('hiop.invoiceReq.title.companyInfo').d('公司信息'),
      drawer: true,
      children: (
        <Form dataSet={this.props.taxRefundHeaderDS}>
          <Output name="companyName" renderer={({ value }) => value || '-'} />
          <Output name="currentTaxpayerNumber" renderer={({ value }) => value || '-'} />
          <Output name="usedTaxpayerNumber" renderer={({ value }) => value || '-'} />
          <Output name="declarePeriod" renderer={({ value, text }) => (value ? text : '-')} />
          {/* --- */}
          <Output name="parentComInfo" renderer={({ value }) => value || '-'} />
          <Output name="isParentCom" renderer={({ value, text }) => (value ? text : '-')} />
          <Output name="isSpecificCom" renderer={({ value, text }) => (value ? text : '-')} />
          <Output name="creditRating" renderer={({ value }) => value || '-'} />
          {/* --- */}
          <Output name="taxpayerType" renderer={({ value, text }) => (value ? text : '-')} />
          <Output
            name="taxpayerRegisterDateFrom"
            renderer={({ value, text }) => (value ? text : '-')}
          />
          <Output
            name="taxpayerRegisterDateTo"
            renderer={({ value, text }) => (value ? text : '-')}
          />
          <Output name="exportComType" renderer={({ value, text }) => (value ? text : '-')} />
          {/* --- */}
          <Output
            name="fileSynchronizationTime"
            renderer={({ value, text }) => (value ? text : '-')}
          />
          <Output name="oilsComType" renderer={({ value, text }) => (value ? text : '-')} />
          <Output name="oilsComTaxPeriod" renderer={({ value, text }) => (value ? text : '-')} />
          <Output name="ethylAlcoholOilsCom" renderer={({ value, text }) => (value ? text : '-')} />
        </Form>
      ),
      closable: true,
      footer: (
        <Button color={ButtonColor.primary} onClick={() => modal.close()}>
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      ),
    });
  }

  get companyAndPasswordColumns(): ColumnProps[] {
    const { empInfo } = this.state;
    const curCompanyId = empInfo.companyId;
    return [
      {
        name: 'companyInfo',
        aggregation: true,
        align: ColumnAlign.left,
        width: 100,
        children: [
          {
            name: 'companyName',
            title: '',
            renderer: ({ value, record }) => {
              const companyId = record?.get('companyId');
              return (
                <div>
                  {curCompanyId === companyId ? (
                    <a onClick={() => this.showDetail()}>{value}</a>
                  ) : (
                    <span>{value}</span>
                  )}
                </div>
              );
            },
          },
          {
            name: 'taxDiskPassword',
            renderer: ({ record, value }) => {
              const companyId = record?.get('companyId');
              const inChannelCode = record?.get('inChannelCode');
              return (
                <div>
                  <span>{value ? '.......' : ''}</span>
                  {curCompanyId === companyId && inChannelCode !== 'AISINO_IN_CHANNEL' && (
                    <a onClick={() => this.taxDiskPasswordChange(record)}>
                      &emsp;{intl.get('hzero.common.button.edit').d('编辑')}
                    </a>
                  )}
                </div>
              );
            },
          },
        ],
      },
    ];
  }

  @Bind()
  handleRow(record) {
    return {
      onClick: () => this.companyChange(record.toData()),
    };
  }

  @Bind()
  renderCompany() {
    return (
      <div className={styles.companyList}>
        <Table
          dataSet={this.props.companyAndPassword}
          columns={this.companyAndPasswordColumns}
          aggregation
          showHeader={false}
          onRow={({ record }) => this.handleRow(record)}
        />
      </div>
    );
  }

  render() {
    const { spinning, progressStatus, progressValue, visible, hide, empInfo } = this.state;
    return (
      <>
        <Header title={intl.get(`${modelCode}.button.dataRefundCheck`).d('退税勾选')}>
          <Button onClick={() => this.updateEnterprise()}>
            {intl.get(`${modelCode}.button.updateEnterpriseFile`).d('更新企业档案')}
          </Button>
        </Header>
        <Row gutter={8} style={{ height: 'calc(100%)' }}>
          <Col span={5} style={{ height: 'calc(100%)' }}>
            <div className={styles.header}>
              <Form
                dataSet={this.props.taxRefundHeaderDS.queryDataSet}
                style={{ marginLeft: '-20px' }}
              >
                <Output name="employeeDesc" />
                <Output name="curDate" />
              </Form>
            </div>
            <Content>
              <Form dataSet={this.props.taxRefundHeaderDS.queryDataSet}>
                <Lov
                  name="companyObj"
                  colSpan={2}
                  onChange={this.companyChange}
                  placeholder={intl.get(`${modelCode}.placeholder.company`).d('搜索公司')}
                />
              </Form>
              {this.renderCompany()}
            </Content>
          </Col>
          <Col span={19} style={{ height: 'calc(100%)' }}>
            <Content style={{ height: 'calc(90%)' }}>
              <div className={styles.topTitle}>
                <span className={styles.topName}>{empInfo.companyName}</span>
              </div>
              <Spin spinning={spinning}>
                <Tabs className={styles.tabsTitle}>
                  <TabPane
                    tab={intl.get(`${modelCode}.tab.currentTaxRefund`).d('当期退税勾选可确认发票')}
                  >
                    <Table
                      buttons={this.buttons}
                      dataSet={this.props.currentTaxRefundHeaderDS}
                      columns={this.columns}
                      queryBar={this.renderQueryBar}
                      style={{ height: 320 }}
                    />
                  </TabPane>
                  <TabPane
                    tab={intl.get(`${modelCode}.tab.batchTaxRefund`).d('批量退税勾选可确认发票')}
                  >
                    <Table
                      buttons={this.batchButtons}
                      dataSet={this.batchTaxRefundHeaderDS}
                      columns={this.batchHeaderColumns}
                      queryBar={this.renderBatchQueryBar}
                      style={{ height: 320 }}
                    />
                    <Table
                      header={intl.get(`${modelCode}.table.batchTaxLine`).d('批量勾选日志')}
                      dataSet={this.batchTaxRefundLineDS}
                      columns={this.batchLineColumns}
                      style={{ display: hide ? 'none' : 'block', height: 200 }}
                    />
                  </TabPane>
                </Tabs>
              </Spin>
              <Modal title="" visible={visible} closable={false} footer={null}>
                <Progress percent={progressValue} status={progressStatus} />
              </Modal>
            </Content>
          </Col>
        </Row>
      </>
    );
  }
}
