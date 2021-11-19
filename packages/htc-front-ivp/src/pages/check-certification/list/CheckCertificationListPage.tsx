/**
 * @Description:勾选认证
 * @version: 1.0
 * @Author: shan.zhang@hand-china.com
 * @Date: 2020-09-23 14:26:15
 * @LastEditTime: 2021-02-26 15:14:28
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import {
  Button,
  DataSet,
  Form,
  Lov,
  Output,
  Password,
  Tabs,
  Spin,
  Table,
  TextField,
  DatePicker,
  Select,
  Currency,
  Progress,
  Upload,
} from 'choerodon-ui/pro';
import { TabsType } from 'choerodon-ui/lib/tabs/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { getCurrentEmployeeInfo, getTenantAgreementCompany } from '@common/services/commonService';
import {
  updateEnterpriseFile,
  applyStatistics,
  confirmSignature,
  refreshAllState,
  businessTimeQuery,
  findVerifiableInvoice,
  handlecheckRequest,
  getTaxAuthorityCode,
  certifiableInvoiceRefresh,
  refreshState,
  downloadFile,
  refreshStatus,
  batchCheck,
  judgeButton,
} from '@src/services/checkCertificationService';
import withProps from 'utils/withProps';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import { getAccessToken, getResponse } from 'utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import {
  ColumnAlign,
  ColumnLock,
  TableCommandType,
  TableEditMode,
} from 'choerodon-ui/pro/lib/table/enum';
import querystring from 'querystring';
import { ProgressStatus } from 'choerodon-ui/lib/progress/enum';
import commonConfig from '@common/config/commonConfig';
import { API_HOST } from 'utils/config';
import { observer } from 'mobx-react-lite';
import { split, set, uniq, uniqBy } from 'lodash';
import moment from 'moment';
import { Col, Row, Modal } from 'choerodon-ui';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import StatisticalConfirmDS from '../stores/StatisticalConfirmDS';
import CertifiableInvoiceListDS from '../stores/CertifiableInvoiceListDS';
import CheckCertificationListDS, { TaxDiskPasswordDS } from '../stores/CheckCertificationListDS';
import StatisticalDetailDS from '../stores/statisticalDetailDS';
import BatchInvoiceHeaderDS from '../stores/BatchInvoiceHeaderDS';
import BatchInvoiceLineDS from '../stores/BatchInvoiceLineDS';

const { TabPane } = Tabs;
const { Option } = Select;

const modelCode = 'hivp.check-certification';
const tenantId = getCurrentOrganizationId();
const HIVP_API = commonConfig.IVP_API;

interface CheckCertificationPageProps {
  dispatch: Dispatch<any>;
  location: any;
  checkCertificationListDS: DataSet;
  certifiableInvoiceListDS: DataSet;
  taxDiskPasswordDS: DataSet;
}

@withProps(
  () => {
    const checkCertificationListDS = new DataSet({
      autoQuery: false,
      ...CheckCertificationListDS(),
    });
    const taxDiskPasswordDS = new DataSet({
      autoQuery: false,
      ...TaxDiskPasswordDS(),
    });
    const certifiableInvoiceListDS = new DataSet({
      autoQuery: false,
      ...CertifiableInvoiceListDS(),
    });
    return {
      checkCertificationListDS,
      certifiableInvoiceListDS,
      taxDiskPasswordDS,
    };
  },
  { cacheState: true }
)
@connect()
export default class CheckCertificationPage extends Component<CheckCertificationPageProps> {
  state = {
    empInfo: {} as any,
    displayOptions: [], // 发票显示选项
    spinning: true,
    checked: true, // 已勾选
    unchecked: false, // 未勾选
    count: 0,
    progressValue: 0,
    progressStatus: ProgressStatus.active,
    visible: false, // 进度条是否显示
    currentPeriod: undefined, // 当前所属期
    loadingFlag: false,
    hide: true, // 数据汇总表格是否隐藏
    isBatchFreshDisabled: true, // 批量发票勾选刷新是否可点
    // taxDiskPassword: '88888888',
    authorityCode: undefined,
    showMore: false,
  };

  statisticalDetailDS = new DataSet({
    autoQuery: false,
    ...StatisticalDetailDS(),
  });

  statisticalConfirmDS = new DataSet({
    autoQuery: false,
    ...StatisticalConfirmDS(),
    children: {
      certifivationCancelDetail: this.statisticalDetailDS,
    },
  });

  batchInvoiceLineDS = new DataSet({
    autoQuery: false,
    ...BatchInvoiceLineDS(),
  });

  batchInvoiceHeaderDS = new DataSet({
    autoQuery: false,
    ...BatchInvoiceHeaderDS(),
    children: {
      batchTaxRefundLineList: this.batchInvoiceLineDS,
    },
  });

  multipleUpload;

  multipleUploadUuid;

  // 根据所属公司获取数据
  @Bind()
  async getDataFromCompany(companyObj) {
    const { queryDataSet } = this.props.checkCertificationListDS;
    const { queryDataSet: certifiableQueryDS } = this.props.certifiableInvoiceListDS;
    const { queryDataSet: batchInvoiceHeaderDS } = this.batchInvoiceHeaderDS;
    const { companyId } = companyObj;
    const apiCondition = process.env.EMPLOYEE_API;
    let inChannelCode = '';
    if (apiCondition === 'OP') {
      inChannelCode = 'UNAISINO_IN_CHANNEL';
    } else {
      const resCop = await getTenantAgreementCompany({ companyId, tenantId });
      ({ inChannelCode } = resCop);
    }
    // const resCop = await getTenantAgreementCompany({ companyId, tenantId });
    const { competentTaxAuthorities } = await getTaxAuthorityCode({ tenantId, companyId });
    // const { inChannelCode } = resCop;

    console.log('inChannelCode', inChannelCode);
    if (queryDataSet) {
      queryDataSet.current!.set({ companyObj });
      this.props.taxDiskPasswordDS.current!.set({ inChannelCode });
      queryDataSet.current!.set({ authorityCode: competentTaxAuthorities });
      if (inChannelCode === 'AISINO_IN_CHANNEL') {
        this.props.taxDiskPasswordDS.current!.set({ taxDiskPassword: '88888888' });
      } else {
        this.props.taxDiskPasswordDS.current!.set({ taxDiskPassword: null });
      }
    }
    if (certifiableQueryDS) {
      certifiableQueryDS.current!.set({ companyObj });
      certifiableQueryDS.current!.set({ authorityCode: competentTaxAuthorities });
    }
    if (batchInvoiceHeaderDS) {
      batchInvoiceHeaderDS.current!.set({ companyObj });
      batchInvoiceHeaderDS.current!.set({ authorityCode: competentTaxAuthorities });
      if (inChannelCode === 'AISINO_IN_CHANNEL') {
        batchInvoiceHeaderDS.current!.set({ spmm: '88888888' });
      } else {
        batchInvoiceHeaderDS.current!.set({ spmm: null });
      }
    }
    this.setState({ empInfo: companyObj, authorityCode: competentTaxAuthorities });
    this.props.checkCertificationListDS.setQueryParameter('companyId', companyId);
    this.props.checkCertificationListDS.query();
  }

  async componentDidMount() {
    const { checkCertificationListDS, certifiableInvoiceListDS } = this.props;
    const { queryDataSet } = checkCertificationListDS;
    const { queryDataSet: certifiableQueryDS } = certifiableInvoiceListDS;
    const { queryDataSet: statisticalDs } = this.statisticalConfirmDS;
    const { queryDataSet: batchInvoiceHeaderDS } = this.batchInvoiceHeaderDS;
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
        const { competentTaxAuthorities } = await getTaxAuthorityCode({ tenantId, curCompanyId });
        if (curInfo && curInfo.content) {
          const empInfo = curInfo.content[0];
          this.setState({ empInfo, authorityCode: competentTaxAuthorities });
        }
      }
    }
    if (certifiableQueryDS) {
      const curDisplayOptions = certifiableQueryDS.current!.get('invoiceDisplayOptions');
      const currentPeriod = certifiableQueryDS.current!.get('currentPeriod');
      const currentCertState = certifiableQueryDS.current!.get('currentCertState');
      const currentOperationalDeadline = certifiableQueryDS.current!.get(
        'currentOperationalDeadline'
      );
      const checkableTimeRange = certifiableQueryDS.current!.get('checkableTimeRange');
      if (!curDisplayOptions) {
        certifiableQueryDS.current!.set({
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
      if (currentPeriod) {
        if (statisticalDs) {
          statisticalDs.current!.set({ statisticalPeriod: currentPeriod });
          statisticalDs.current!.set({ currentCertState });
        }
        if (batchInvoiceHeaderDS) {
          batchInvoiceHeaderDS.current!.set({ tjyf: currentPeriod });
          batchInvoiceHeaderDS.current!.set({ currentOperationalDeadline });
          batchInvoiceHeaderDS.current!.set({ checkableTimeRange });
          batchInvoiceHeaderDS.current!.set({ currentCertState });
        }
        this.setState({ currentPeriod });
      }
    }
    this.setState({
      spinning: false,
      displayOptions,
    });
  }

  /**
   * 更新企业档案
   * @returns
   */
  @Bind()
  async updateEnterprise() {
    const { empInfo } = this.state;
    const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
    const taxDiskPassword = this.props.taxDiskPasswordDS.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.passMess').d('请输入税盘密码！'),
      });
    }
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
      this.props.checkCertificationListDS.query();
    } else {
      notification.error({
        description: '',
        message: res && res.message,
      });
    }
  }

  // 改变所属公司
  @Bind()
  async companyChange(value) {
    const { checkCertificationListDS } = this.props;
    const { queryDataSet } = checkCertificationListDS;
    if (queryDataSet && value) {
      this.getDataFromCompany(value);
      this.setState({ empInfo: value });
    }
  }

  // 获取当前所属期
  @Bind()
  async getCurrentPeriod(param, dataSet) {
    const { certifiableInvoiceListDS } = this.props;
    const { queryDataSet: statisticalDs } = this.statisticalConfirmDS;
    const { queryDataSet: batchInvoiceHeaderDS } = this.batchInvoiceHeaderDS;
    const { empInfo } = this.state;
    const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
    const taxDiskPassword = this.props.taxDiskPasswordDS.current?.get('taxDiskPassword');
    console.log('taxDiskPassword', taxDiskPassword);
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.passMess').d('请输入税盘密码！'),
      });
    }
    const res = getResponse(
      await businessTimeQuery({
        tenantId,
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        taxDiskPassword,
      })
    );
    if (res) {
      const { queryDataSet } = certifiableInvoiceListDS;
      const invoiceDisplayOptions = [
        'UNCHECKED',
        'ACCOUNTED',
        'DISACCOUNT',
        'DOCS_UNITED',
        'NON_DOCS',
      ];
      const {
        currentPeriod,
        currentOperationalDeadline,
        checkableTimeRange,
        currentCertState,
      } = res;
      if (queryDataSet) {
        queryDataSet.current!.set({
          companyId,
          currentPeriod,
          currentOperationalDeadline,
          checkableTimeRange,
          currentCertState,
          invoiceDisplayOptions,
        });
      }
      if (statisticalDs) {
        statisticalDs.current!.set({ statisticalPeriod: currentPeriod });
        statisticalDs.current!.set({ currentCertState });
      }
      if (batchInvoiceHeaderDS) {
        batchInvoiceHeaderDS.current!.set({ tjyf: currentPeriod });
        batchInvoiceHeaderDS.current!.set({ currentOperationalDeadline });
        batchInvoiceHeaderDS.current!.set({ checkableTimeRange });
        batchInvoiceHeaderDS.current!.set({ currentCertState });
      }
      // 判断是否是‘实时查找可认证发票’调用
      if (param) {
        this.setState({
          progressValue: 100,
          progressStatus: ProgressStatus.success,
          visible: false,
        });
      }
      if (dataSet) {
        dataSet.query();
      }
      this.setState({ currentPeriod });
    }
  }

  // 已认证详情
  @Bind()
  handleGoToDetail() {
    const { dispatch } = this.props;
    const pathname = '/htc-front-ivp/check-certification/certifiableInvoice/detail';
    const { certifiableInvoiceListDS } = this.props;
    const { queryDataSet } = certifiableInvoiceListDS;
    const { empInfo } = this.state;
    const {
      companyId,
      companyCode,
      companyName,
      employeeNum: employeeNumber,
      employeeId,
    } = empInfo;
    const taxDiskPassword = this.props.taxDiskPasswordDS.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.passMess').d('请输入税盘密码！'),
      });
    }
    if (queryDataSet) {
      const companyDesc = `${companyCode}-${companyName}`;
      const curInfo = queryDataSet.current!.toData();
      const { currentPeriod, currentCertState } = curInfo;
      dispatch(
        routerRedux.push({
          pathname,
          search: querystring.stringify({
            certifiableInfo: encodeURIComponent(
              JSON.stringify({
                companyId,
                companyCode,
                companyDesc,
                employeeId,
                employeeNumber,
                spmm: taxDiskPassword,
                currentPeriod,
                currentCertState,
              })
            ),
          }),
        })
      );
    }
  }

  /**
   * 循环查找可认证发票
   */
  async loopRequest(totalRequest, startRow, contentRows, findParams, count) {
    const { startRow: startrow, contentRows: contentrows } = await findVerifiableInvoice({
      ...findParams,
      startRow,
      contentRows,
    });
    const progressValue = this.state.progressValue + 100 / (totalRequest + 2);
    this.setState({
      count: this.state.count + 1,
      progressValue,
    });
    if (count < totalRequest - 2) {
      await this.loopRequest(totalRequest, startrow, contentrows, findParams, this.state.count);
    }
    this.setState({ count: 0 });
  }

  // 实时查找可认证发票
  @Bind()
  async handleFindVerifiableInvoice() {
    const { certifiableInvoiceListDS } = this.props;
    const { progressValue } = this.state;
    const { queryDataSet: certifiableQueryDS } = certifiableInvoiceListDS;
    const { empInfo } = this.state;
    const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
    const taxDiskPassword = this.props.taxDiskPasswordDS.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.passMess').d('请输入税盘密码！'),
      });
    }
    if (certifiableQueryDS) {
      const certifiableQueryData = certifiableQueryDS.current!.toData();
      const {
        checkableTimeRange,
        authorityCode,
        invoiceCategory,
        currentPeriod,
        invoiceNumber,
        invoiceDateFrom,
        invoiceDateTo,
      } = certifiableQueryData;
      const { count } = this.state;
      const findParams = {
        tenantId,
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        spmm: taxDiskPassword,
        checkableTimeRange,
        authorityCode,
        invoiceCategory,
        qt: 'dq',
        tjyf: currentPeriod,
        fply: '1',
        jkshm: invoiceNumber,
        kprqq: invoiceDateFrom,
        kprqz: invoiceDateTo,
      };
      if (invoiceCategory === '01') {
        set(findParams, 'gxzt', '0');
      } else {
        set(findParams, 'rzzt', '0');
      }
      const res = await findVerifiableInvoice(findParams);
      if (res && res.failed) {
        notification.error({
          description: '',
          message: res.message,
        });
        return;
      }
      this.setState({
        progressValue: 0,
        progressStatus: ProgressStatus.active,
        visible: true,
      });
      let i = 2;
      if (res && res.totalRequest > 1) {
        i += res.totalRequest;
        await this.loopRequest(res.totalRequest, res.startRow, res.contentRows, findParams, count);
      }
      // this.props.certifiableInvoiceListDS.query();
      this.setState({ progressValue: progressValue + 100 / i });
      this.getCurrentPeriod(true, this.props.certifiableInvoiceListDS);
    }
  }

  // 发票勾选
  @Bind()
  async checkRequest(isTick) {
    const { checkCertificationListDS, certifiableInvoiceListDS } = this.props;
    const { queryDataSet: mainQueryDataSet } = checkCertificationListDS;
    const { queryDataSet } = certifiableInvoiceListDS;
    const { empInfo } = this.state;
    const {
      companyId,
      companyCode,
      companyName,
      employeeNum: employeeNumber,
      employeeId,
      taxpayerNumber,
    } = empInfo;
    const employeeDesc = mainQueryDataSet && mainQueryDataSet.current!.get('employeeDesc');
    const companyDesc = `${companyCode}-${companyName}`;
    const currentPeriod = queryDataSet && queryDataSet.current!.get('currentPeriod');
    const invoiceCategory = queryDataSet && queryDataSet.current!.get('invoiceCategory');
    const selectedList = this.props.certifiableInvoiceListDS.selected.map((rec) => rec.toData());
    const contentRows = selectedList.length;
    let invoiceRequestParamDto = {};
    const taxDiskPassword = this.props.taxDiskPasswordDS.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.passMess').d('请输入税盘密码！'),
      });
    }
    if (invoiceCategory === '01') {
      // 增值税
      const data = selectedList.map((record: any) => {
        const {
          invoiceCode: fpdm,
          invoiceNo: fphm,
          invoiceDate: kprq,
          validTaxAmount: yxse,
          invoicePoolHeaderId: id,
        } = record;
        return { fpdm, fphm, kprq, yxse, id, gxzt: isTick };
      });
      invoiceRequestParamDto = {
        data,
        contentRows,
        spmm: taxDiskPassword,
      };
    } else {
      const paymentCustomerData = selectedList.map((record: any) => {
        const {
          invoiceNo: jkshm,
          taxAmount: se,
          invoiceDate: tfrq,
          validTaxAmount: yxse,
          invoicePoolHeaderId: id,
        } = record;
        return { fply: '1', jkshm, se, tfrq, yxse, id, zt: isTick };
      });
      invoiceRequestParamDto = {
        paymentCustomerData,
        contentRows,
        spmm: taxDiskPassword,
      };
    }
    const params = {
      tenantId,
      companyId,
      companyCode,
      companyDesc,
      employeeId,
      employeeNumber,
      employeeDesc,
      currentPeriod,
      invoiceCategory,
      taxpayerNumber,
      invoiceRequestParamDto,
    };
    const res = getResponse(await handlecheckRequest(params));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
      this.getCurrentPeriod(false, this.props.certifiableInvoiceListDS);
      // this.props.certifiableInvoiceListDS.query();
    }
  }

  // 提交勾选请求
  @Bind()
  handleSubmitTickRequest() {
    const selectedList = this.props.certifiableInvoiceListDS.selected.map((rec) => rec.toData());
    if (selectedList.some((item) => item.invoiceState !== '0' || item.checkState !== '0')) {
      notification.warning({
        message: intl
          .get(`${modelCode}.view.tickInvalid`)
          .d('存在发票状态为非“正常”或勾选状态为非“未勾选”的数据，不允许提交'),
        description: '',
      });
      return;
    }
    this.checkRequest(1);
  }

  // 提交取消勾选请求
  @Bind()
  handleSubmitCancelTickRequest() {
    const selectedList = this.props.certifiableInvoiceListDS.selected.map((rec) => rec.toData());
    if (selectedList.some((item) => item.invoiceState !== '0' || item.checkState !== '1')) {
      notification.warning({
        message: intl
          .get(`${modelCode}.view.tickInvalid`)
          .d('存在发票状态为非“正常”或勾选状态为非“已勾选”的数据，不允许提交'),
        description: '',
      });
      return;
    }
    this.checkRequest(0);
  }

  // 当期勾选(取消)可认证发票: 刷新状态
  @Bind()
  async verifiableRefresh() {
    const selectedList = this.props.certifiableInvoiceListDS.selected.map((rec) => rec.toData());
    if (selectedList.some((item) => item.checkState !== 'R')) {
      notification.warning({
        message: intl
          .get(`${modelCode}.view.tickInvalid`)
          .d('存在勾选状态为非“请求中”的数据，不允许刷新'),
        description: '',
      });
      return;
    }
    const batchNoList = uniqBy(selectedList, 'batchNumber');
    const data = batchNoList.map((item) => {
      const list = {
        batchNumber: item.batchNumber,
        requestSource: item.requestSource,
      };
      return list;
    });
    const { empInfo } = this.state;
    const { companyId, employeeId, companyCode, employeeNum: employeeNumber } = empInfo;
    const params = {
      tenantId,
      companyId,
      employeeId,
      companyCode,
      employeeNumber,
      data,
    };
    const res = getResponse(await certifiableInvoiceRefresh(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
      });
      this.props.certifiableInvoiceListDS.query();
    }
  }

  // 当期勾选(取消)可认证发票: 按钮
  get verifiableBtns(): Buttons[] {
    const { currentPeriod, empInfo } = this.state;
    const TickButton = observer((props: any) => {
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
    const BatchButtons = observer((props: any) => {
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          funcType={FuncType.flat}
          disabled={!currentPeriod}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });

    return [
      <BatchButtons
        key="certifiedDetails"
        onClick={() => this.handleGoToDetail()}
        dataSet={this.props.certifiableInvoiceListDS}
        title={intl.get(`${modelCode}.button.certifiedDetails`).d('已认证详情')}
      />,
      <BatchButtons
        key="getVerifiableInvoices"
        onClick={() => this.handleFindVerifiableInvoice()}
        dataSet={this.props.certifiableInvoiceListDS}
        title={intl.get(`${modelCode}.button.getVerifiableInvoices`).d('实时查找可认证发票')}
      />,
      <TickButton
        key="submitTickRequest"
        onClick={() => this.handleSubmitTickRequest()}
        dataSet={this.props.certifiableInvoiceListDS}
        title={intl.get(`${modelCode}.button.submitTickRequest`).d('提交勾选请求')}
      />,
      <TickButton
        key="submitCancelTickRequest"
        onClick={() => this.handleSubmitCancelTickRequest()}
        dataSet={this.props.certifiableInvoiceListDS}
        title={intl.get(`${modelCode}.button.submitCancelTickRequest`).d('提交取消勾选请求')}
      />,
      <Button
        key="currentPeriod"
        onClick={() => this.getCurrentPeriod(false, null)}
        disabled={!empInfo.companyId}
      >
        {intl.get(`${modelCode}.button.currentPeriod`).d('获取当前所属期')}
      </Button>,
      <TickButton
        key="refresh"
        onClick={() => this.verifiableRefresh()}
        dataSet={this.props.certifiableInvoiceListDS}
        title={intl.get(`${modelCode}.button.refresh`).d('刷新状态')}
      />,
    ];
  }

  // 多值选框互斥
  @Bind()
  async handleOptChange(value) {
    if (value && value.indexOf('CURRENT_PERIOD_CHECKED') > -1) {
      this.setState({
        checked: false,
        unchecked: true,
      });
    } else {
      this.setState({
        unchecked: false,
      });
    }

    if (value && value.indexOf('UNCHECKED') > -1) {
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

  @Bind()
  handleVerifiableQuery() {
    const { queryDataSet } = this.props.certifiableInvoiceListDS;
    this.props.certifiableInvoiceListDS.query();
    if (queryDataSet) {
      queryDataSet.current!.set({ number: 0 });
      queryDataSet.current!.set({ amount: 0 });
      queryDataSet.current!.set({ taxAmount: 0 });
      queryDataSet.current!.set({ validTaxAmount: 0 });
    }
  }

  // 当期勾选(取消)可认证发票: 头
  @Bind()
  renderVerifiableBar(props) {
    const { queryDataSet, buttons } = props;
    const { displayOptions } = this.state;
    let optionList: any = [];
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
          <TextField name="currentPeriod" />
          <DatePicker name="currentOperationalDeadline" />
          <TextField name="checkableTimeRange" />
          <Select name="currentCertState" />
          <Select name="invoiceCategory" />
          <TextField name="invoiceCode" />
          <TextField name="invoiceNumber" />
          <DatePicker name="invoiceDateFrom" />
          <DatePicker name="invoiceDateTo" />
          <Select name="managementState" />
          <Select name="invoiceState" />
          <Select
            name="invoiceType"
            optionsFilter={(record) => ['01', '03', '08', '14'].includes(record.get('value'))}
          />
          <Select name="invoiceDisplayOptions" multiple onChange={this.handleOptChange} colSpan={2}>
            {optionList}
          </Select>
          <TextField name="number" newLine renderer={(value) => value.text && `${value.text}份`} />
          <Currency name="amount" />
          <Currency name="taxAmount" />
          <Currency name="validTaxAmount" />
        </Form>
        <Row type="flex" justify="space-between">
          <Col span={20}>{buttons}</Col>
          <Col span={4} style={{ textAlign: 'end', marginBottom: '4px' }}>
            <Button color={ButtonColor.primary} onClick={() => this.handleVerifiableQuery()}>
              {intl.get('hzero.c7nProUI.Table.query_button').d('查询')}
            </Button>
          </Col>
        </Row>
      </>
    );
  }

  // 当期勾选(取消)可认证发票: 行
  get verifiableColumns(): ColumnProps[] {
    return [
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        command: (): Commands[] => {
          return [TableCommandType.edit];
        },
        help: '调整有效税额',
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
      { name: 'checkState' },
      { name: 'invoiceType' },
      { name: 'invoiceCode', width: 150 },
      { name: 'invoiceNo', width: 180 },
      { name: 'invoiceDate', width: 130 },
      { name: 'buyerTaxNo', width: 180 },
      { name: 'salerName', width: 160 },
      { name: 'salerTaxNo', width: 180 },
      { name: 'invoiceAmount', width: 150, align: ColumnAlign.right },
      { name: 'taxAmount', width: 150, align: ColumnAlign.right },
      {
        name: 'validTaxAmount',
        editor: (record) => record.get('checkState') === '0',
        width: 150,
        align: ColumnAlign.right,
      },
      { name: 'invoiceState' },
      {
        name: 'isPoolFlag',
        renderer: ({ value }) => value && '是',
      },
      { name: 'checkDate', width: 130 },
      { name: 'authenticationState' },
      { name: 'authenticationType' },
      { name: 'infoSource' },
      { name: 'taxBureauManageState', width: 120 },
      { name: 'isEntryNotConform', width: 150 },
      { name: 'purpose' },
      { name: 'entryAccountState' },
      { name: 'receiptsState' },
      { name: 'abnormalSign', width: 150 },
      { name: 'annotation', width: 200 },
      { name: 'batchNumber' },
      { name: 'failedDetail' },
      { name: 'requestTime' },
      { name: 'completedTime' },
    ];
  }

  // 当期已勾选发票统计确签: 刷新状态
  @Bind()
  async statisticalConfirmRefresh() {
    const list = this.statisticalConfirmDS.selected.map((record) => record.toData());
    if (list.some((record) => record.requestState === 'COMPLETED')) {
      notification.warning({
        message: intl
          .get(`${modelCode}.view.tickInvalid`)
          .d('存在请求状态为“已完成”的数据，不允许刷新状态'),
        description: '',
      });
      return;
    }
    const { empInfo } = this.state;
    const { companyId, employeeId } = empInfo;
    const params = { tenantId, companyId, employeeId };
    const res = getResponse(await refreshAllState(params));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
      this.statisticalConfirmDS.query();
    }
  }

  // 当期已勾选发票统计确签: 确认签名
  @Bind()
  async statisticalConfirmSign() {
    const list = this.statisticalConfirmDS.map((record) => record.toData());
    const currentCertState =
      this.statisticalConfirmDS.queryDataSet &&
      this.statisticalConfirmDS.queryDataSet.current!.get('currentCertState');
    if (list.some((record) => record.requestState === 'RUNNING' || currentCertState === '3')) {
      notification.warning({
        message: intl
          .get(`${modelCode}.view.tickInvalid`)
          .d('存在当前认证状态为“已确签”或请求状态为“运行中”的数据，不允许确认签名'),
        description: '',
      });
      return;
    }
    const { checkCertificationListDS } = this.props;
    const { queryDataSet } = this.statisticalConfirmDS;
    const { queryDataSet: mainQueryDataSet } = checkCertificationListDS;
    if (queryDataSet && mainQueryDataSet) {
      const curInfo = queryDataSet.current!.toData();
      const mainData = checkCertificationListDS.current!.toData();
      const mainQueryData = mainQueryDataSet.current!.toData();
      const {
        companyId,
        companyCode,
        employeeNumber,
        // taxDiskPassword,
        employeeId,
        companyName,
        employeeDesc,
      } = mainQueryData;
      const taxDiskPassword = this.props.taxDiskPasswordDS.current?.get('taxDiskPassword');
      if (!taxDiskPassword) {
        return notification.warning({
          description: '',
          message: intl.get('hadm.hystrix.view.message.title.passMess').d('请输入税盘密码！'),
        });
      }
      const judgeRes = await judgeButton({ tenantId, companyId });
      if (judgeRes) {
        notification.warning({
          description: '',
          message: '当前存在勾选或取消勾选运行中的请求不允许确认签名',
        });
        return;
      }
      const { confirmPassword, statisticalPeriod } = curInfo;
      const { currentTaxpayerNumber } = mainData;
      const companyDesc = `${companyCode}-${companyName}`;
      const params = {
        tenantId,
        companyId,
        companyCode,
        companyDesc,
        employeeId,
        employeeNumber,
        employeeDesc,
        taxDiskPassword,
        taxpayerNumber: currentTaxpayerNumber,
        currentPeriod: statisticalPeriod,
        confirmFlag: 1,
        confirmPassword,
      };
      if (!confirmPassword) {
        notification.info({
          description: '',
          message: intl.get(`${modelCode}.view.confirmPassword`).d('请输入确认密码'),
        });
        return;
      }
      const res = getResponse(await confirmSignature(params));
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        this.getCurrentPeriod(false, this.statisticalConfirmDS);
        // this.statisticalConfirmDS.query();
      }
    }
  }

  // 当期已勾选发票统计确签: 申请/取消统计
  @Bind()
  async handleStatistics() {
    const { checkCertificationListDS } = this.props;
    const { queryDataSet } = checkCertificationListDS;
    const { queryDataSet: tableQueyDataSet } = this.statisticalConfirmDS;
    const { empInfo } = this.state;
    const {
      companyId,
      companyCode,
      companyName,
      employeeNum: employeeNumber,
      employeeId,
      taxpayerNumber,
    } = empInfo;
    const taxDiskPassword = this.props.taxDiskPasswordDS.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.passMess').d('请输入税盘密码！'),
      });
    }
    const judgeRes = await judgeButton({ tenantId, companyId });
    if (judgeRes) {
      notification.warning({
        description: '',
        message: '当前存在勾选或取消勾选运行中的请求不允许申请/取消统计',
      });
      return;
    }
    if (queryDataSet && tableQueyDataSet) {
      const queryData = queryDataSet.current!.toData();
      const tableData = tableQueyDataSet.current!.toData();
      const { employeeDesc } = queryData;
      const { currentCertState, statisticalPeriod } = tableData;
      const companyDesc = `${companyCode}-${companyName}`;
      if (!currentCertState || !statisticalPeriod) {
        notification.warning({
          description: '',
          message: '请先获取当前所属期',
        });
        return;
      }
      let statisticalFlag;
      if (currentCertState === '0' || currentCertState === '1') statisticalFlag = 1;
      if (currentCertState === '2' || currentCertState === '3') statisticalFlag = 0;
      const params = {
        tenantId,
        companyId,
        companyCode,
        companyDesc,
        employeeId,
        employeeNumber,
        employeeDesc,
        taxDiskPassword,
        taxpayerNumber,
        statisticalPeriod,
        statisticalFlag,
      };
      const res = getResponse(await applyStatistics(params));
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        this.getCurrentPeriod(false, this.statisticalConfirmDS);
        // this.statisticalConfirmDS.query();
      }
    }
  }

  // 当期已勾选发票统计确签: 按钮
  get statisticalConfirmButtons(): Buttons[] {
    const BatchBtn = observer((props: any) => {
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
      <Button key="applyStatistics" onClick={() => this.handleStatistics()}>
        {intl.get(`${modelCode}.button.applyStatistics`).d('申请统计')}
      </Button>,
      <Button key="confirmSignature" onClick={() => this.statisticalConfirmSign()}>
        {intl.get(`${modelCode}.button.confirmSignature`).d('确认签名')}
      </Button>,
      <Button key="cancelStatistics" onClick={() => this.handleStatistics()}>
        {intl.get(`${modelCode}.button.cancelStatistics`).d('取消统计')}
      </Button>,
      <BatchBtn
        key="refreshAll"
        onClick={() => this.statisticalConfirmRefresh()}
        dataSet={this.statisticalConfirmDS}
        title={intl.get(`${modelCode}.button.refreshAll`).d('刷新状态')}
      />,
    ];
  }

  // 当期已勾选发票统计确签:行刷新
  @Bind()
  async statisticalConfirmLineRefresh(record) {
    const recordData = record.toData();
    const { empInfo } = this.state;
    const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
    const { invoiceOperationId, detailInfoHeaderId, requestType, batchNo } = recordData;
    const params = {
      tenantId,
      companyId,
      companyCode,
      employeeId,
      employeeNumber,
      invoiceOperationId,
      detailInfoHeaderId,
      requestType,
      batchNo,
    };
    const res = getResponse(await refreshState(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get(`${modelCode}.view.refreshState`).d('操作成功'),
      });
      this.statisticalConfirmDS.query();
    }
  }

  // 当期已勾选发票统计确签:行
  get statisticalConfirmColumns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? this.statisticalConfirmDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'currentPeriod' },
      { name: 'requestType' },
      { name: 'requestTime', width: 160 },
      { name: 'requestState' },
      { name: 'completeTime', width: 160 },
      { name: 'checkConfirmState', width: 150 },
      { name: 'batchNo', width: 270 },
      { name: 'employeeNumber' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 150,
        command: ({ record }): Commands[] => {
          const records = record.toData();
          const isDisabled = records.requestState !== 'RUNNING';
          return [
            <Button
              key="refresh"
              onClick={() => this.statisticalConfirmLineRefresh(record)}
              disabled={isDisabled}
            >
              {intl.get(`${modelCode}.button.refresh`).d('刷新状态')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  // 当期已勾选发票统计确签: 查询
  statisticalQuery() {
    const { empInfo } = this.state;
    const { companyId } = empInfo;
    this.statisticalConfirmDS.setQueryParameter('companyId', companyId);
    this.statisticalConfirmDS.query();
  }

  // 当期已勾选发票统计确签:查询条件
  @Bind()
  renderStatisticalConfirmQueryBar(props) {
    const { queryDataSet, buttons } = props;
    return (
      <>
        <Form dataSet={queryDataSet} columns={3}>
          <TextField name="statisticalPeriod" />
          <TextField name="currentCertState" />
          <Password name="confirmPassword" reveal={false} />
        </Form>
        <Row type="flex" justify="space-between">
          <Col span={20}>{buttons}</Col>
          <Col span={4} style={{ textAlign: 'end', marginBottom: '4px' }}>
            <Button
              color={ButtonColor.primary}
              onClick={() => {
                this.statisticalQuery();
              }}
            >
              {intl.get('hzero.c7nProUI.Table.query_button').d('查询')}
            </Button>
          </Col>
        </Row>
      </>
    );
  }

  get statisticalDetailColumns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? this.statisticalDetailDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'invoiceType' },
      { name: 'deductionInvoiceNum' },
      { name: 'deductionAmount', width: 150, align: ColumnAlign.right },
      { name: 'deductionValidTaxAmount', width: 150, align: ColumnAlign.right },
      { name: 'nonDeductionInvoiceNum' },
      { name: 'nonDeductionAmount', width: 150, align: ColumnAlign.right },
      { name: 'nonDeductionValidTaxAmount', width: 150, align: ColumnAlign.right },
    ];
  }

  // 下载发票文件
  @Bind()
  async downLoad() {
    const { empInfo } = this.state;
    const { companyId, companyCode, employeeId, employeeNum, taxpayerNumber } = empInfo;
    const needDownloadKey = this.batchInvoiceHeaderDS.current!.get('needDownloadKey');
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

  // 批量发票勾选（取消）可认证发票: 刷新状态
  @Bind()
  async batchInvoiceRefresh() {
    const { empInfo } = this.state;
    const selectedList = this.batchInvoiceHeaderDS.selected.map((rec) => rec.toData());
    const unPass = selectedList.some((item) => item.checkState !== 'R');
    const batchNoList = uniq(selectedList.map((item) => item.batchNo));
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
    const res = getResponse(await refreshStatus(params));
    if (res && res.status === '1000') {
      notification.success({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
      });
      this.batchInvoiceHeaderDS.query();
      this.setState({
        hide: false,
        isBatchFreshDisabled: true,
      });
    } else {
      notification.error({
        description: '',
        message: res && res.message,
      });
    }
  }

  // 批量发票勾选（取消）可认证发票: 按钮
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
      <HeaderButtons
        key="downloadFile"
        onClick={this.downLoad}
        dataSet={this.batchInvoiceHeaderDS}
        title={intl.get(`${modelCode}.button.downloadFile`).d('下载发票文件')}
        permissionCode="download-file"
        permissionMeaning="按钮-下载发票文件"
        type="downLoad"
      />,
      <Button key="upload" disabled={!companyId} onClick={this.upload} loading={loadingFlag}>
        {intl.get(`${modelCode}.button.getVerifiableInvoices`).d('上传')}
      </Button>,
      <HeaderButtons
        key="refresh"
        onClick={() => this.batchInvoiceRefresh()}
        dataSet={this.batchInvoiceHeaderDS}
        title={intl.get(`${modelCode}.button.batchRefresh`).d('刷新状态')}
        permissionCode="batch-refresh"
        permissionMeaning="按钮-刷新状态"
        type="refresh"
      />,
    ];
  }

  // 批量发票勾选（取消）可认证发票: 行
  async batchOperation(record, checkFlag) {
    const { queryDataSet } = this.batchInvoiceHeaderDS;
    const { empInfo, authorityCode } = this.state;
    const batchNo = record.get('batchNo');
    const invoiceDateFrom = queryDataSet && queryDataSet.current!.get('rqq');
    const invoiceDateEnd = queryDataSet && queryDataSet.current!.get('rqz');
    const {
      companyId,
      companyCode,
      employeeNum: employeeNumber,
      employeeId,
      taxpayerNumber,
    } = empInfo;
    const taxDiskPassword = this.props.taxDiskPasswordDS.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.passMess').d('请输入税盘密码！'),
      });
    }
    const params = {
      tenantId,
      companyId,
      companyCode,
      employeeId,
      employeeNumber,
      taxpayerNumber,
      taxDiskPassword,
      authorityCode,
      batchNumber: batchNo,
      checkFlag,
      invoiceDateFrom: invoiceDateFrom && moment(invoiceDateFrom).format(DEFAULT_DATE_FORMAT),
      invoiceDateEnd: invoiceDateEnd && moment(invoiceDateEnd).format(DEFAULT_DATE_FORMAT),
    };
    const res = getResponse(await batchCheck(params));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
      this.props.certifiableInvoiceListDS.query();
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
            <Button onClick={() => this.batchOperation(record, checkState)}>
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
        this.batchInvoiceHeaderDS.query();
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

  saveMultipleUpload = (node) => {
    this.multipleUpload = node;
  };

  @Bind()
  renderBatchQueryBar(props) {
    const { queryDataSet, buttons, dataSet } = props;
    const { empInfo, authorityCode } = this.state;
    const { companyId, companyCode, employeeId, employeeNum, taxpayerNumber } = empInfo;
    const taxDiskPassword = this.props.taxDiskPasswordDS.current?.get('taxDiskPassword');
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
      },
      data: {},
      action: `${API_HOST}${HIVP_API}/v1/${tenantId}/batch-check/upload-certified-file?companyId=${companyId}&companyCode=${companyCode}&employeeId=${employeeId}&employeeNumber=${employeeNum}&taxpayerNumber=${taxpayerNumber}&taxDiskPassword=${taxDiskPassword}&authorityCode=${authorityCode}`,
      multiple: false,
      uploadImmediately: false,
      showUploadBtn: false,
      showPreviewImage: true,
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleUploadError,
    };
    // if(!taxDiskPassword) {
    //   return notification.warning({
    //     description: '',
    //     message: intl.get('hadm.hystrix.view.message.title.passMess').d('请输入税盘密码！'),
    //   });
    // }
    return (
      <>
        <Form dataSet={queryDataSet} columns={3}>
          <TextField name="tjyf" />
          <TextField name="currentOperationalDeadline" />
          <TextField name="checkableTimeRange" />
          <Select name="currentCertState" />
          <DatePicker name="rqq" />
          <DatePicker name="rqz" />
          <TextField name="salerTaxNo" />
          <Select name="gxzt" />
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
  getTaxDiskPassword(value) {
    const { queryDataSet: batchInvoiceHeaderDS } = this.batchInvoiceHeaderDS;
    if (batchInvoiceHeaderDS) {
      batchInvoiceHeaderDS.current!.set({ spmm: value });
    }
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

  render() {
    const { spinning, progressStatus, progressValue, visible, hide, showMore } = this.state;

    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('勾选认证')}>
          <Button color={ButtonColor.dark} onClick={() => this.updateEnterprise()}>
            {intl.get(`${modelCode}.button.updateEnterpriseFile`).d('更新企业档案')}
          </Button>
        </Header>
        <Content>
          <Spin dataSet={this.props.checkCertificationListDS}>
            <Row>
              <Col span={20}>
                <Form dataSet={this.props.checkCertificationListDS.queryDataSet} columns={5}>
                  <Lov name="companyObj" colSpan={2} onChange={this.companyChange} />
                  <Output name="employeeDesc" colSpan={2} />
                  <Output name="curDate" colSpan={1} />
                </Form>
              </Col>
              <Col span={4}>
                <Form dataSet={this.props.taxDiskPasswordDS}>
                  <Password
                    name="taxDiskPassword"
                    reveal={false}
                    onChange={this.getTaxDiskPassword}
                  />
                </Form>
              </Col>
            </Row>
          </Spin>
          {showMore && (
            <Form dataSet={this.props.checkCertificationListDS} columns={5}>
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
                tab={intl.get(`${modelCode}.certifiableInvoiceTitle`).d('当期勾选(取消)可认证发票')}
                key="certifiableInvoice"
              >
                <Table
                  dataSet={this.props.certifiableInvoiceListDS}
                  columns={this.verifiableColumns}
                  buttons={this.verifiableBtns}
                  queryBar={this.renderVerifiableBar}
                  editMode={TableEditMode.inline}
                  style={{ height: 200 }}
                />
              </TabPane>
              <TabPane
                tab={intl.get(`${modelCode}.statisticalConfirm`).d('当期已勾选发票统计确签')}
                key="statisticalConfirm"
              >
                <Table
                  dataSet={this.statisticalConfirmDS}
                  columns={this.statisticalConfirmColumns}
                  buttons={this.statisticalConfirmButtons}
                  queryBar={this.renderStatisticalConfirmQueryBar}
                  style={{ height: 200 }}
                />
                <Table
                  dataSet={this.statisticalDetailDS}
                  columns={this.statisticalDetailColumns}
                  style={{ height: 200 }}
                />
              </TabPane>
              <TabPane
                tab={intl.get(`${modelCode}.batchInvoice`).d('批量发票勾选（取消）可认证发票')}
                key="batchInvoice"
              >
                <Table
                  buttons={this.batchButtons}
                  dataSet={this.batchInvoiceHeaderDS}
                  columns={this.batchHeaderColumns}
                  queryBar={this.renderBatchQueryBar}
                  style={{ height: 200 }}
                />
                <Table
                  header={intl.get(`${modelCode}.table.batchTaxLine`).d('批量勾选日志')}
                  dataSet={this.batchInvoiceLineDS}
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
