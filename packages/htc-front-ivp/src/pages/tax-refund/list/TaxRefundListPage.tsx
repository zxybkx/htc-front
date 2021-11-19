/*
 * @Description:退税勾选
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-03-24 14:23:33
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import { observer } from 'mobx-react-lite';
import { API_HOST } from 'utils/config';
import commonConfig from '@common/config/commonConfig';
import {
  Button,
  DataSet,
  Form,
  Lov,
  Output,
  Password,
  Spin,
  Tabs,
  Table,
  TextField,
  Select,
  DatePicker,
  Currency,
  Progress,
  Upload,
} from 'choerodon-ui/pro';
import { Row, Col, Modal } from 'choerodon-ui';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import intl from 'utils/intl';
import { TabsType } from 'choerodon-ui/lib/tabs/enum';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@common/utils/utils';
import { getCurrentOrganizationId, getAccessToken, getResponse } from 'utils/utils';
import { getCurrentEmployeeInfo, getTenantAgreementCompany } from '@common/services/commonService';
import { updateEnterpriseFile, getTaxAuthorityCode } from '@src/services/checkCertificationService';
import {
  submitRefundCheckRequest,
  refresh,
  refundInvoiceQuery,
  getProgress,
  downloadFile,
  batchOperationRefundInvoice,
} from '@src/services/taxRefundService';
import withProps from 'utils/withProps';
import moment from 'moment';
import uuidv4 from 'uuid/v4';
import notification from 'utils/notification';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { ProgressStatus } from 'choerodon-ui/lib/progress/enum';
import querystring from 'querystring';
import { split, uniq } from 'lodash';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import TaxRefundHeaderDS from '../stores/TaxRefundHeaderDS';
import CurrentTaxRefundHeaderDS from '../stores/CurrentTaxRefundHeaderDS';
import BatchTaxRefundHeaderDS from '../stores/BatchTaxRefundHeaderDS';
import BatchTaxRefundLineDS from '../stores/BatchTaxRefundLineDS';

const modelCode = 'hivp.tax-refund';
const tenantId = getCurrentOrganizationId();
const { TabPane } = Tabs;
const permissionPath = `${getPresentMenu().name}.ps`;
const { Option } = Select;
const HIVP_API = commonConfig.IVP_API;

// const HIVP_API = `${commonConfig.IVP_API}-31183`;

interface TaxRefundPageProps {
  dispatch: Dispatch<any>;
  location: any;
  taxRefundHeaderDS: DataSet;
  currentTaxRefundHeaderDS: DataSet;
  batchTaxRefundHeaderDS: DataSet;
}

@connect()
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
    return {
      taxRefundHeaderDS,
      currentTaxRefundHeaderDS,
    };
  },
  { cacheState: true }
)
export default class CheckCertificationPage extends Component<TaxRefundPageProps> {
  state = {
    spinning: true,
    displayOptions: [] as any,
    checked: true, // 已勾选
    unchecked: false, // 未勾选
    progressValue: 0,
    progressStatus: ProgressStatus.active,
    visible: false, // 进度条是否显示
    empInfo: {} as any,
    taxDiskPassword: '88888888',
    loadingFlag: false,
    hide: true, // 数据汇总表格是否隐藏
    isBatchFreshDisabled: true, // 批量退税刷新是否可点
    showMore: false,
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
      queryDataSet.current!.set({ inChannelCode });
      curTaxDs.current!.set({ authorityCode: competentTaxAuthorities });
      batchDs.current!.set({ authorityCode: competentTaxAuthorities });
      if (inChannelCode === 'AISINO_IN_CHANNEL') {
        queryDataSet.current!.set({ taxDiskPassword: '88888888' });
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
      const { companyId, companyCode, employeeNumber, taxDiskPassword, employeeId } = curInfo;
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
          message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
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

  saveMultipleUpload = (node) => {
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
    const { queryDataSet } = this.props.taxRefundHeaderDS;
    const { queryDataSet: batchDs } = this.batchTaxRefundHeaderDS;
    const taxDiskPassword = queryDataSet && queryDataSet.current!.get('taxDiskPassword');
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
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
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
            <Button onClick={() => this.batchOperation(record)}>
              {checkState === '0'
                ? intl.get('hzero.common.status.checkFlag').d('全部勾选')
                : intl.get('hzero.common.status.checkFlag').d('全部撤销')}
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
    const { displayOptions } = this.state;
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
    return (
      <>
        <Form dataSet={queryDataSet} columns={4}>
          <TextField name="checkMonth" />
          <Select
            name="invoiceType"
            optionsFilter={(record) => record.get('value') === '01' || record.get('value') === '17'}
          />
          <TextField name="invoiceCode" />
          <TextField name="invoiceNo" />
          <DatePicker name="invoiceDateFrom" />
          <DatePicker name="invoiceDateTo" />
          <TextField name="salerTaxNo" />
          <Select name="manageState" />
          <Select name="invoiceState" />
          <Select name="invoiceDisplayOptions" multiple colSpan={2} onChange={this.handleOpChange}>
            {optionList}
          </Select>
          <TextField name="number" newLine renderer={(value) => value.text && `${value.text}份`} />
          <Currency name="amount" />
          <Currency name="taxAmount" />
        </Form>
        <Row type="flex" justify="space-between">
          <Col span={20}>{buttons}</Col>
          <Col span={4} style={{ textAlign: 'end', marginBottom: '2px' }}>
            <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
              {intl.get(`${modelCode}.button.save`).d('查询')}
            </Button>
          </Col>
        </Row>
      </>
    );
  }

  @Bind()
  handleBatchQuery() {
    const { queryDataSet } = this.props.taxRefundHeaderDS;
    if (queryDataSet) {
      const taxDiskPassword = queryDataSet.current!.get('taxDiskPassword');
      this.batchTaxRefundHeaderDS.setQueryParameter('taxDiskPassword', taxDiskPassword);
      this.batchTaxRefundLineDS.setQueryParameter('taxDiskPassword', taxDiskPassword);
      this.batchTaxRefundHeaderDS.query();
    }
  }

  @Bind()
  renderBatchQueryBar(props) {
    const { queryDataSet, buttons, dataSet } = props;
    const { empInfo, taxDiskPassword } = this.state;
    const { companyId, companyCode, employeeId, employeeNum, taxpayerNumber } = empInfo;
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
    return (
      <>
        <Form dataSet={queryDataSet} columns={3}>
          <TextField name="checkMonth" />
          <DatePicker name="invoiceDateFrom" />
          <DatePicker name="invoiceDateTo" />
          <TextField name="salerTaxNo" />
          <Select
            name="checkFlag"
            clearButton={false}
            optionsFilter={(record) => record.get('value') !== '-1' && record.get('value') !== 'R'}
          />
          <Output
            label="文件选择"
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
        </Form>
        <Row type="flex" justify="space-between">
          <Col span={20}>{buttons}</Col>
          <Col span={4} style={{ textAlign: 'end', marginBottom: '2px' }}>
            <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
              {intl.get(`${modelCode}.button.save`).d('查询')}
            </Button>
          </Col>
        </Row>
        <div className="c7n-pro-table-header">
          {intl.get(`${modelCode}.table.batchTaxHeader`).d('数据汇总情况')}
        </div>
      </>
    );
  }

  @Bind()
  handleTaxComfirm() {
    const { dispatch } = this.props;
    const { queryDataSet } = this.props.taxRefundHeaderDS;
    const { queryDataSet: curQS } = this.props.currentTaxRefundHeaderDS;
    const authorityCode = curQS && curQS.current!.get('authorityCode');
    const taxDiskPassword = queryDataSet && queryDataSet.current!.get('taxDiskPassword');
    const taxInfo = {
      authorityCode,
      taxDiskPassword,
    };
    if (queryDataSet && queryDataSet.current) {
      const companyId = queryDataSet.current!.get('companyId');
      dispatch(
        routerRedux.push({
          pathname: `/htc-front-ivp/tax-refund/texRefundConfirm/${companyId}`,
          search: querystring.stringify({
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
      const { companyId, companyCode, employeeNumber, taxDiskPassword, employeeId } = mainQueryData;
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
        // notification.success({
        //   description: '',
        //   message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
        // });
        // await this.props.currentTaxRefundHeaderDS.query();
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
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
      });
      await this.props.currentTaxRefundHeaderDS.query();
    }
  }

  @Bind()
  async handleRefundRequest(selectedList, type) {
    const { empInfo } = this.state;
    const { queryDataSet } = this.props.taxRefundHeaderDS;
    const { queryDataSet: curQS } = this.props.currentTaxRefundHeaderDS;
    const taxDiskPassword = queryDataSet && queryDataSet.current!.get('taxDiskPassword');
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
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
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
    const selectedList = this.props.currentTaxRefundHeaderDS.selected.map((rec) => rec.toData());
    if (selectedList.some((item) => item.checkState !== '0')) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.unSubmit`)
          .d('存在勾选状态为非未勾选状态的发票，无法提交'),
      });
      return;
    }
    this.handleRefundRequest(selectedList, '1');
  }

  // 提交退税发票取消勾选请求
  @Bind()
  async handleCancelTax() {
    const selectedList = this.props.currentTaxRefundHeaderDS.selected.map((rec) => rec.toData());
    if (selectedList.some((item) => item.checkState !== '1')) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.unSubmit`)
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
      const selectedList = this.props.currentTaxRefundHeaderDS.selected.map((rec) => rec.toData());
      unPass = selectedList.some((item) => item.checkState !== 'R');
      batchNoList = uniq(selectedList.map((item) => item.batchNo));
    }
    if (unPass) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.unSubmit`)
          .d('存在勾选状态为非请求中状态的发票，无法刷新'),
      });
      return;
    }
    const params = { tenantId, empInfo, batchNoList };
    const res = getResponse(await refresh(params));
    if (res && res.status === '1000') {
      notification.success({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
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
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
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
        key="taxRefund"
        disabled={!companyId}
        onClick={this.handleTaxComfirm}
        permissionList={[
          {
            code: `${permissionPath}.button.confirm-tax-refund`,
            type: 'button',
            meaning: '按钮-退税勾选确认',
          },
        ]}
      >
        {intl.get(`${modelCode}.button.taxRefund`).d('退税勾选确认')}
      </PermissionButton>,
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
      <HeaderButtons
        key="submitTaxRefund"
        onClick={() => this.handleSubmitTax()}
        dataSet={this.props.currentTaxRefundHeaderDS}
        title={intl.get(`${modelCode}.button.submitTaxRefund`).d('提交退税发票勾选请求')}
        permissionCode="submit-tax-refund"
        permissionMeaning="按钮-提交退税发票勾选请求"
      />,
      <HeaderButtons
        key="cancelTaxRefund"
        onClick={() => this.handleCancelTax()}
        dataSet={this.props.currentTaxRefundHeaderDS}
        title={intl.get(`${modelCode}.button.cancelTaxRefund`).d('提交退税发票取消勾选请求')}
        permissionCode="cancel-tax-refund"
        permissionMeaning="按钮-提交退税发票取消勾选请求"
      />,
      <HeaderButtons
        key="refresh"
        onClick={() => this.refresh(0)}
        dataSet={this.props.currentTaxRefundHeaderDS}
        title={intl.get(`${modelCode}.button.refresh`).d('刷新状态')}
        permissionCode="refresh"
        permissionMeaning="按钮-刷新状态"
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
          message: intl.get(`${modelCode}.view.uploadInvalid`).d('上传成功'),
        });
        this.setState({ isBatchFreshDisabled: false });
      } else {
        // notification.error({
        //   description: '',
        //   message: res.message,
        // });
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
      if (window.navigator.msSaveBlob) {
        try {
          window.navigator.msSaveBlob(blob, `${taxpayerNumber}_${date}.zip`);
        } catch (e) {
          notification.error({
            description: '',
            message: intl.get(`${modelCode}.view.ieUploadInfo`).d('下载失败'),
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
          color={ButtonColor.primary}
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
      <HeaderButtons
        key="downloadFile"
        onClick={this.downLoad}
        dataSet={this.batchTaxRefundHeaderDS}
        title={intl.get(`${modelCode}.button.downloadFile`).d('下载发票文件')}
        permissionCode="download-file"
        permissionMeaning="按钮-下载发票文件"
        type="downLoad"
      />,
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
        {intl.get(`${modelCode}.button.getVerifiableInvoices`).d('上传')}
      </PermissionButton>,
      <HeaderButtons
        key="refresh"
        onClick={() => this.refresh(1)}
        dataSet={this.batchTaxRefundHeaderDS}
        title={intl.get(`${modelCode}.button.batchRefresh`).d('刷新状态')}
        permissionCode="batch-refresh"
        permissionMeaning="按钮-刷新状态"
        type="refresh"
      />,
    ];
  }

  @Bind()
  getTaxDiskPassword(value) {
    if (value) {
      this.setState({
        taxDiskPassword: value,
      });
    }
  }

  render() {
    const { spinning, progressStatus, progressValue, visible, hide, showMore } = this.state;
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('退税勾选')}>
          <Button color={ButtonColor.dark} onClick={() => this.updateEnterprise()}>
            {intl.get(`${modelCode}.button.updateEnterpriseFile`).d('更新企业档案')}
          </Button>
        </Header>
        <Content>
          <Form dataSet={this.props.taxRefundHeaderDS.queryDataSet} columns={6}>
            <Lov name="companyObj" colSpan={2} onChange={this.companyChange} />
            <Output name="employeeDesc" colSpan={2} />
            <Output name="curDate" />
            <Password name="taxDiskPassword" reveal={false} onChange={this.getTaxDiskPassword} />
          </Form>
          {showMore && (
            <Form dataSet={this.props.taxRefundHeaderDS} columns={5}>
              <Output name="companyName" colSpan={2} />
              <Output name="currentTaxpayerNumber" colSpan={1} />
              <Output name="usedTaxpayerNumber" colSpan={1} />
              <Output
                name="declarePeriod"
                colSpan={1}
                renderer={(value) => value.value && `${value.value}-${value.text}`}
              />
              {/* --- */}
              <Output name="parentComInfo" colSpan={2} />
              <Output
                name="isParentCom"
                colSpan={1}
                renderer={(value) => value.value && `${value.value}-${value.text}`}
              />
              <Output
                name="isSpecificCom"
                colSpan={1}
                renderer={(value) => value.value && `${value.value}-${value.text}`}
              />
              <Output name="creditRating" colSpan={1} />
              {/* --- */}
              <Output
                name="taxpayerType"
                colSpan={2}
                renderer={(value) => value.value && `${value.value}-${value.text}`}
              />
              <Output name="taxpayerRegisterDateFrom" colSpan={1} />
              <Output name="taxpayerRegisterDateTo" colSpan={1} />
              <Output
                name="exportComType"
                colSpan={1}
                renderer={(value) => value.value && `${value.value}-${value.text}`}
              />
              {/* --- */}
              <Output name="fileSynchronizationTime" colSpan={2} />
              <Output
                name="oilsComType"
                colSpan={1}
                renderer={(value) => value.value && `${value.value}-${value.text}`}
              />
              <Output
                name="oilsComTaxPeriod"
                colSpan={1}
                renderer={(value) => value.value && `${value.value}-${value.text}`}
              />
              <Output name="ethylAlcoholOilsCom" colSpan={1} />
            </Form>
          )}
          <div style={{ textAlign: 'end' }}>
            <a onClick={() => this.setState({ showMore: !showMore })}>
              {showMore
                ? intl.get('hzero.common.button.formCollected').d('收起')
                : intl.get('hzero.common.button.formMore').d('更多')}
            </a>
          </div>
          <Spin spinning={spinning}>
            <Tabs type={TabsType.card}>
              <TabPane
                tab={intl.get(`${modelCode}.currentTaxRefund`).d('当期退税勾选(取消)可确认发票')}
              >
                <Table
                  buttons={this.buttons}
                  dataSet={this.props.currentTaxRefundHeaderDS}
                  columns={this.columns}
                  queryBar={this.renderQueryBar}
                  style={{ height: 200 }}
                />
              </TabPane>
              <TabPane
                tab={intl.get(`${modelCode}.batchTaxRefund`).d('批量退税勾选(取消)可确认发票')}
              >
                <Table
                  buttons={this.batchButtons}
                  dataSet={this.batchTaxRefundHeaderDS}
                  columns={this.batchHeaderColumns}
                  queryBar={this.renderBatchQueryBar}
                  style={{ height: 200 }}
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
      </>
    );
  }
}
