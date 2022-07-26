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
import { routerRedux } from 'dva/router';
import { RouteComponentProps } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
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
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { getCurrentEmployeeInfo, getTenantAgreementCompany } from '@htccommon/services/commonService';
import {
  applyStatistics,
  batchCheck,
  businessTimeQuery,
  certifiableInvoiceRefresh,
  checkInvoiceCount,
  confirmSignature,
  downloadFile,
  enterpriseSave,
  findVerifiableInvoice,
  getTaskPassword,
  getTaxAuthorityCode,
  handlecheckRequest,
  judgeButton,
  refreshAllState,
  refreshState,
  refreshStatus,
  unCertifiedInvoiceQuery,
  updateEnterpriseFile,
} from '@src/services/checkCertificationService';
import withProps from 'utils/withProps';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import { getAccessToken, getResponse } from 'utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import querystring from 'querystring';
import { ProgressStatus } from 'choerodon-ui/lib/progress/enum';
import commonConfig from '@htccommon/config/commonConfig';
import { API_HOST } from 'utils/config';
import { observer } from 'mobx-react-lite';
import { isEmpty, remove, set, split, uniq, uniqBy } from 'lodash';
import moment from 'moment';
import { Col, Icon, Modal, Row, Tag, Tooltip } from 'choerodon-ui';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import AggregationTable from '@htccommon/pages/invoice-common/aggregation-table/detail/AggregationTablePage';
import formatterCollections from 'utils/intl/formatterCollections';
import StatisticalConfirmDS, { TimeRange } from '../stores/StatisticalConfirmDS';
import CertifiableInvoiceListDS from '../stores/CertifiableInvoiceListDS';
import CheckCertificationListDS, { TaxDiskPasswordDS } from '../stores/CheckCertificationListDS';
import StatisticalDetailDS from '../stores/StatisticalDetailDS';
import BatchInvoiceHeaderDS from '../stores/BatchInvoiceHeaderDS';
import CompanyAndPasswordDS from '../stores/CompanyAndPasswordDS';
import styles from '../checkcertification.less';

const { TabPane } = Tabs;
const { Option } = Select;
const { Item: MenuItem } = Menu;

const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();
const HIVP_API = commonConfig.IVP_API || '';

interface CheckCertificationPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  location: any;
  checkCertificationListDS: DataSet;
  certifiableInvoiceListDS: DataSet;
  taxDiskPasswordDS: DataSet;
  companyAndPassword: DataSet;
  statisticalConfirmDS: DataSet;
  statisticalDetailDS: DataSet;
  batchInvoiceHeaderDS: DataSet;
}

@withProps(
  () => {
    const checkCertificationListDS = new DataSet({
      autoQuery: false,
      ...CheckCertificationListDS(),
    });
    const companyAndPassword = new DataSet({
      autoQuery: false,
      ...CompanyAndPasswordDS(),
    });
    const taxDiskPasswordDS = new DataSet({
      autoQuery: false,
      ...TaxDiskPasswordDS(),
    });
    const certifiableInvoiceListDS = new DataSet({
      autoQuery: false,
      ...CertifiableInvoiceListDS(),
    });
    const statisticalDetailDS = new DataSet({
      autoQuery: false,
      ...StatisticalDetailDS(),
    });

    const statisticalConfirmDS = new DataSet({
      autoQuery: false,
      ...StatisticalConfirmDS(),
      children: {
        certifivationCancelDetail: statisticalDetailDS,
      },
    });

    const batchInvoiceHeaderDS = new DataSet({
      autoQuery: false,
      ...BatchInvoiceHeaderDS(),
    });
    return {
      checkCertificationListDS,
      certifiableInvoiceListDS,
      taxDiskPasswordDS,
      companyAndPassword,
      statisticalConfirmDS,
      statisticalDetailDS,
      batchInvoiceHeaderDS,
    };
  },
  { cacheState: true }
)

@formatterCollections({
  code: [
    modelCode,
    'hiop.invoiceWorkbench',
    'hiop.invoiceRule',
    'hivp.taxRefund',
    'hiop.redInvoiceInfo',
    'htc.common',
    'hcan.invoiceDetail',
    'hivp.bill',
  ],
})
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
    // loadingFlag: false,
    // hide: true, // 数据汇总表格是否隐藏
    // isBatchFreshDisabled: true, // 批量发票勾选刷新是否可点
    authorityCode: undefined,
    verfiableMoreDisplay: false, // 当期可认证发票查询是否显示更多
    batchInvoiceMoreDisplay: false, // 批量可认证发票查询是否显示更多
    activeKey: 'certifiableInvoice',
  };

  // batchInvoiceLineDS = new DataSet({
  //   autoQuery: false,
  //   ...BatchInvoiceLineDS(),
  // });

  // batchInvoiceHeaderDS = new DataSet({
  //   autoQuery: false,
  //   ...BatchInvoiceHeaderDS(),
  //   children: {
  //     batchTaxRefundLineList: this.batchInvoiceLineDS,
  //   },
  // });

  timeRangeDS = new DataSet({
    autoQuery: false,
    ...TimeRange(),
  });

  // multipleUpload;

  @Bind()
  async getTaskPassword(companyObj, dataSet) {
    const res = await getTaskPassword({
      tenantId,
      companyCode: companyObj.companyCode,
    });
    if (res && res.content && !isEmpty(res.content)) {
      const { taxDiskPassword } = res.content[0];
      // console.log('taxDiskPassword', taxDiskPassword);
      dataSet.current!.set({ taxDiskPassword });
    }
  }

  // 根据所属公司获取数据
  @Bind()
  async getDataFromCompany(companyObj, type) {
    const { queryDataSet } = this.props.checkCertificationListDS;
    const { queryDataSet: certifiableQueryDS } = this.props.certifiableInvoiceListDS;
    const { queryDataSet: batchInvoiceHeaderDS } = this.props.batchInvoiceHeaderDS;
    const { queryDataSet: statisticalDs } = this.props.statisticalConfirmDS;
    const { companyId } = companyObj;
    const apiCondition = process.env.EMPLOYEE_API;
    let inChannelCode = '';
    if (apiCondition === 'OP') {
      inChannelCode = 'UNAISINO_IN_CHANNEL';
    } else {
      const resCop = await getTenantAgreementCompany({ companyId, tenantId });
      ({ inChannelCode } = resCop);
    }
    const { competentTaxAuthorities } = await getTaxAuthorityCode({ tenantId, companyId });
    // console.log('inChannelCode', inChannelCode);
    const res = await getCurrentEmployeeInfo({ tenantId });
    if (type === 0) {
      this.props.companyAndPassword.loadData(res.content);
    }
    if (companyObj && type === 1) {
      if (res && res.content) {
        remove(res.content, (item: any) => item.companyId === companyObj.companyId);
        const data = [companyObj, ...res.content];
        this.props.companyAndPassword.loadData(data);
      }
    }
    if (queryDataSet) {
      queryDataSet.current!.set({ companyObj });
      this.props.companyAndPassword.current!.set({ inChannelCode });
      queryDataSet.current!.set({ authorityCode: competentTaxAuthorities });
      if (inChannelCode === 'AISINO_IN_CHANNEL') {
        // console.log('888');
        this.props.companyAndPassword.current!.set({ taxDiskPassword: '88888888' });
      } else {
        // 获取税盘密码
        this.getTaskPassword(companyObj, this.props.companyAndPassword);
      }
    }
    if (certifiableQueryDS) {
      certifiableQueryDS.current!.set({ companyObj });
      certifiableQueryDS.current!.set({ authorityCode: competentTaxAuthorities });
      const currentPeriod = certifiableQueryDS.current!.get('currentPeriod');
      const currentCertState = certifiableQueryDS.current!.get('currentCertState');
      if (statisticalDs) {
        // statisticalDs.current!.set({ statisticalPeriod: currentPeriod });
        statisticalDs.current!.set({ authenticationDateObj: { statisticalPeriod: currentPeriod } });
        statisticalDs.current!.set({ companyId: companyObj.companyId });
        statisticalDs.current!.set({ currentCertState });
      }
    }
    if (batchInvoiceHeaderDS) {
      batchInvoiceHeaderDS.current!.set({ companyObj });
      batchInvoiceHeaderDS.current!.set({ authorityCode: competentTaxAuthorities });
      // if (inChannelCode === 'AISINO_IN_CHANNEL') {
      //   batchInvoiceHeaderDS.current!.set({ spmm: '88888888' });
      // } else {
      //   // 获取税盘密码
      //   this.getTaskPassword(companyObj, batchInvoiceHeaderDS);
      // }
    }
    this.setState({ empInfo: companyObj, authorityCode: competentTaxAuthorities });
    this.props.checkCertificationListDS.setQueryParameter('companyId', companyId);
    this.props.checkCertificationListDS.query();
  }

  async componentDidMount() {
    const { checkCertificationListDS, certifiableInvoiceListDS } = this.props;
    const { queryDataSet } = checkCertificationListDS;
    const { queryDataSet: certifiableQueryDS } = certifiableInvoiceListDS;
    // const { queryDataSet: statisticalDs } = this.props.statisticalConfirmDS;
    const { queryDataSet: batchInvoiceHeaderDS } = this.props.batchInvoiceHeaderDS;
    const res = await getCurrentEmployeeInfo({ tenantId });
    const displayOptions = await queryIdpValue('HIVP.CHECK_CONFIRM_DISPLAY_OPTIONS');
    const query = location.search;
    const type = new URLSearchParams(query).get('type');
    if (type === '2') {
      this.setState({ activeKey: 'statisticalConfirm' });
    }
    if (type === '3') {
      this.setState({ activeKey: 'batchInvoice' });
    }

    if (queryDataSet) {
      if (!type) {
        const checkInvoiceCountRes = await checkInvoiceCount({ tenantId });
        // console.log('checkInvoiceCountRes', checkInvoiceCountRes);
        queryDataSet.current!.set({ checkInvoiceCount: checkInvoiceCountRes });
        // if (checkInvoiceCountRes) {
        //   queryDataSet.current!.set({ checkInvoiceCount: checkInvoiceCountRes });
        // }
      }
      const curCompanyId = queryDataSet.current!.get('companyId');
      if (res && res.content) {
        const empInfo = res.content[0];
        if (empInfo && !curCompanyId) {
          this.getDataFromCompany(empInfo, 0);
          // this.props.companyAndPassword.loadData(res.content);
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
        // if (statisticalDs) {
        //   // statisticalDs.current!.set({ statisticalPeriod: currentPeriod });
        //   statisticalDs.current!.set({ authenticationDateObj: { statisticalPeriod: currentPeriod } });
        //   statisticalDs.current!.set({ companyId: this.state.empInfo.companyId });
        //   statisticalDs.current!.set({ currentCertState });
        // }
        if (batchInvoiceHeaderDS) {
          batchInvoiceHeaderDS.current!.set({ tjyf: currentPeriod });
          batchInvoiceHeaderDS.current!.set({ currentOperationalDeadline });
          batchInvoiceHeaderDS.current!.set({ checkableTimeRange });
          batchInvoiceHeaderDS.current!.set({ currentCertState });
        }
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
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      notification.warning({
        description: '',
        message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
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
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.props.checkCertificationListDS.query();
    } else {
      notification.error({
        description: '',
        message: res && res.message,
      });
    }
  }

  /**
   * 企业档案初始化
   * @returns
   */
  @Bind()
  async enterpriseFileInit() {
    const { empInfo } = this.state;
    const params = {
      tenantId,
      list: [
        {
          ...empInfo,
          employeeNumber: empInfo.employeeNum,
          currentTaxpayerNumber: empInfo.taxpayerNumber,
        },
      ],
    };
    const res = getResponse(await enterpriseSave(params));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
    }
  }

  // 改变所属公司
  @Bind()
  async companyChange(value, type) {
    const { checkCertificationListDS } = this.props;
    const { queryDataSet } = checkCertificationListDS;
    if (queryDataSet && value) {
      this.getDataFromCompany(value, type);
    }
  }

  // 获取当前所属期
  @Bind()
  async getCurrentPeriod() {
    const { certifiableInvoiceListDS } = this.props;
    const { queryDataSet: statisticalDs } = this.props.statisticalConfirmDS;
    const { queryDataSet: batchInvoiceHeaderDS } = this.props.batchInvoiceHeaderDS;
    const { empInfo } = this.state;
    const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
    const taxDiskPassword =
      this.props.companyAndPassword.current &&
      this.props.companyAndPassword.current.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
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
      // this.setState({ currentPeriod });
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
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
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
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
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
      this.setState({
        progressValue: 100,
        progressStatus: ProgressStatus.success,
        visible: false,
      });
      // this.getCurrentPeriod(true, this.props.certifiableInvoiceListDS);
      this.props.certifiableInvoiceListDS.query();
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
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
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
      // this.getCurrentPeriod(false, this.props.certifiableInvoiceListDS);
      this.props.certifiableInvoiceListDS.query();
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
          .get(`${modelCode}.view.tickInvalid1`)
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
          .get(`${modelCode}.view.tickInvalid2`)
          .d('存在勾选状态为非“请求中”的数据，不允许刷新'),
        description: '',
      });
      return;
    }
    const batchNoList = uniqBy(selectedList, 'batchNumber');
    const data = batchNoList.map((item) => {
      return {
        batchNumber: item.batchNumber,
        requestSource: item.requestSource,
      };
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
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.props.certifiableInvoiceListDS.query();
    }
  }

  // 当期勾选(取消)可认证发票: 按钮
  get verifiableBtns(): Buttons[] {
    const VerifiableInvoicesButton = observer((props: any) => {
      let disabled = false;
      if (props.dataSet && props.companyDataSet) {
        const { queryDataSet } = props.dataSet;
        const { queryDataSet: companyQueryDS } = props.companyDataSet;
        const currentPeriod = queryDataSet && queryDataSet.current!.get('currentPeriod');
        const _checkInvoiceCount =
          companyQueryDS && companyQueryDS.current!.get('checkInvoiceCount');
        disabled = !currentPeriod || _checkInvoiceCount !== 0;
      }
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          funcType={FuncType.flat}
          disabled={disabled}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    const TickButton = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      const { condition } = props;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={condition === 'refresh' ? FuncType.flat : FuncType.link}
        >
          {props.title}
        </Button>
      );
    });
    const BatchButtons = observer((props: any) => {
      let disabled = false;
      if (props.dataSet) {
        const { queryDataSet } = props.dataSet;
        const currentPeriod = queryDataSet && queryDataSet.current!.get('currentPeriod');
        disabled = !currentPeriod;
      }
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          funcType={FuncType.flat}
          disabled={disabled}
          color={ButtonColor.default}
          style={{ marginLeft: 10 }}
        >
          {props.title}
        </Button>
      );
    });
    const Tooltips = observer((props: any) => {
      const { queryDataSet } = props.dataSet;
      const _checkInvoiceCount = queryDataSet && queryDataSet.current!.get('checkInvoiceCount');
      const title =
        _checkInvoiceCount === 0
          ? ''
          : '当前系统中存在请求中的发票，可在当期勾选可认证发票查看，请请求完成后再重新获取';
      return (
        <Tooltip title={title} placement="top">
          <Icon
            type="help_outline"
            className={styles.icon}
            style={{ display: _checkInvoiceCount === 0 ? 'none' : 'inline' }}
          />
        </Tooltip>
      );
    });
    const btnMenu = (
      <Menu>
        <MenuItem>
          <TickButton
            key="submitTickRequest"
            onClick={() => this.handleSubmitTickRequest()}
            dataSet={this.props.certifiableInvoiceListDS}
            title={intl.get(`${modelCode}.button.submitTickRequest`).d('提交勾选')}
          />
        </MenuItem>
        <MenuItem>
          <TickButton
            key="submitCancelTickRequest"
            onClick={() => this.handleSubmitCancelTickRequest()}
            dataSet={this.props.certifiableInvoiceListDS}
            title={intl.get(`${modelCode}.button.submitCancelTickRequest`).d('取消勾选')}
          />
        </MenuItem>
      </Menu>
    );
    return [
      <Dropdown overlay={btnMenu}>
        <Button color={ButtonColor.primary}>
          {intl.get(`${modelCode}.button.batchVerifiable`).d('勾选')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
      <VerifiableInvoicesButton
        key="getVerifiableInvoices"
        onClick={() => this.handleFindVerifiableInvoice()}
        dataSet={this.props.certifiableInvoiceListDS}
        companyDataSet={this.props.checkCertificationListDS}
        title={intl.get(`${modelCode}.button.getVerifiableInvoices`).d('实时查找可认证发票')}
        condition="getVerifiableInvoices"
      />,
      <Tooltips dataSet={this.props.checkCertificationListDS} />,
      <BatchButtons
        key="certifiedDetails"
        onClick={() => this.handleGoToDetail()}
        dataSet={this.props.certifiableInvoiceListDS}
        title={intl.get(`${modelCode}.button.certifiedDetails`).d('已认证详情')}
      />,
      <TickButton
        key="refresh"
        onClick={() => this.verifiableRefresh()}
        dataSet={this.props.certifiableInvoiceListDS}
        title={intl.get('hiop.invoiceWorkbench.button.refresh').d('刷新状态')}
        condition="refresh"
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
    const { displayOptions, verfiableMoreDisplay } = this.state;
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
    const queryMoreArray: JSX.Element[] = [];
    queryMoreArray.push(<TextField name="checkableTimeRange" />);
    queryMoreArray.push(<Select name="currentCertState" />);
    queryMoreArray.push(<TextField name="invoiceCode" />);
    queryMoreArray.push(<TextField name="invoiceNumber" />);
    queryMoreArray.push(<DatePicker name="invoiceDateFrom" />);
    queryMoreArray.push(<DatePicker name="invoiceDateTo" />);
    queryMoreArray.push(<Select name="managementState" />);
    queryMoreArray.push(<Select name="invoiceState" />);
    queryMoreArray.push(
      <Select
        name="invoiceType"
        optionsFilter={(record) => ['01', '03', '08', '14'].includes(record.get('value'))}
      />
    );
    queryMoreArray.push(
      <Select name="invoiceDisplayOptions" multiple onChange={this.handleOptChange} colSpan={3}>
        {optionList}
      </Select>
    );
    queryMoreArray.push(
      <TextField
        name="number"
        newLine
        renderer={(value) =>
          value.text && `${value.text}${intl.get('hivp.checkCertification.view.share').d('份')}`
        }
      />
    );
    queryMoreArray.push(<Currency name="amount" />);
    queryMoreArray.push(<Currency name="taxAmount" />);
    queryMoreArray.push(<Currency name="validTaxAmount" />);
    queryMoreArray.push(<Select name="isPoolFlag" />);
    return (
      <div style={{ marginBottom: '0.1rem' }}>
        <Row>
          <Col span={18}>
            <Form dataSet={queryDataSet} columns={3}>
              <TextField name="currentPeriod" />
              <Select name="invoiceCategory" />
              <DatePicker name="currentOperationalDeadline" />
              {verfiableMoreDisplay && queryMoreArray}
            </Form>
          </Col>
          <Col span={6} style={{ textAlign: 'end' }}>
            <Button
              funcType={FuncType.link}
              onClick={() => this.setState({ verfiableMoreDisplay: !verfiableMoreDisplay })}
            >
              {verfiableMoreDisplay ? (
                <span>
                  {intl.get('hzero.common.button.option').d('更多')}
                  <Icon type="expand_more" />
                </span>
              ) : (
                <span>
                  {intl.get('hzero.common.button.option').d('更多')}
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
              {intl.get('hzero.common.status.reset').d('重置')}
            </Button>
            <Button color={ButtonColor.primary} onClick={() => this.handleVerifiableQuery()}>
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
          </Col>
        </Row>
        {buttons}
      </div>
    );
  }

  @Bind()
  handleEdit(record) {
    record.setState('editing', true);
  }

  @Bind()
  handleCancel(record) {
    if (record.status === 'add') {
      this.props.certifiableInvoiceListDS.remove(record);
    } else {
      record.reset();
      record.setState('editing', false);
    }
  }

  @Bind()
  async handleSave(record) {
    const res = await this.props.certifiableInvoiceListDS.submit();
    if (res && res.content) record.setState('editing', false);
  }

  @Bind()
  commands(record) {
    const btns: any = [];
    if (record.getState('editing')) {
      btns.push(
        <a onClick={() => this.handleSave(record)}>
          {intl.get('hzero.common.btn.save').d('保存')}
        </a>,
        <a onClick={() => this.handleCancel(record)}>
          {intl.get('hzero.common.status.cancel').d('取消')}
        </a>
      );
    } else {
      btns.push(
        <a onClick={() => this.handleEdit(record)}>
          {intl.get('hzero.common.button.rule.edit').d('编辑')}
        </a>
      );
    }
    return [
      <span className="action-link" key="action">
        {btns}
      </span>,
    ];
  }

  // 当期勾选(取消)可认证发票: 行
  get verifiableColumns(): ColumnProps[] {
    return [
      { name: 'invoiceType', width: 150 },
      { name: 'invoiceCode', width: 150 },
      {
        name: 'invoiceNo',
        width: 180,
        renderer: ({ value, record }) => {
          const checkState = record?.get('checkState');
          const checkStateTxt = record?.getField('checkState')?.getText(checkState);
          let color = '';
          let textColor = '';
          switch (checkState) {
            case '0':
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            case '1':
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            case 'R':
              color = '#FFECC4';
              textColor = '#FF9D23';
              break;
            default:
              color = '';
              textColor = '';
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {checkStateTxt}
              </Tag>
              &nbsp;
              <span>{value}</span>
            </>
          );
        },
      },
      { name: 'invoiceDate', width: 130 },
      { name: 'buyerTaxNo', width: 180 },
      { name: 'salerName', width: 160 },
      { name: 'salerTaxNo', width: 180 },
      { name: 'invoiceAmount', width: 150, align: ColumnAlign.right },
      { name: 'taxAmount', width: 150, align: ColumnAlign.right },
      {
        name: 'validTaxAmount',
        editor: (record) => record.getState('editing') && record.get('checkState') === '0',
        width: 150,
        align: ColumnAlign.right,
      },
      { name: 'invoiceState' },
      {
        name: 'isPoolFlag',
        // renderer: ({ value }) => (value && value === 'Y' ? '是' : '否'),
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
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        renderer: ({ record }) => this.commands(record),
        help: intl.get('hivp.checkCertification.view.adjustEffectiveTax').d('调整有效税额'),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  // 当期已勾选发票统计确签: 刷新状态
  @Bind()
  async statisticalConfirmRefresh() {
    const list = this.props.statisticalConfirmDS.selected.map((record) => record.toData());
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
      this.props.statisticalConfirmDS.query();
    }
  }

  // 当期已勾选发票统计确签: 确认签名
  @Bind()
  async statisticalConfirmSign() {
    const list = this.props.statisticalConfirmDS.map((record) => record.toData());
    const currentCertState =
      this.props.statisticalConfirmDS.queryDataSet &&
      this.props.statisticalConfirmDS.queryDataSet.current!.get('currentCertState');
    if (list.some((record) => record.requestState === 'RUNNING' || currentCertState === '3')) {
      notification.warning({
        message: intl
          .get(`${modelCode}.view.tickInvalid4`)
          .d('存在当前认证状态为“已确签”或请求状态为“运行中”的数据，不允许确认签名'),
        description: '',
      });
      return;
    }
    const { checkCertificationListDS } = this.props;
    const { queryDataSet } = this.props.statisticalConfirmDS;
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
      const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
      if (!taxDiskPassword) {
        return notification.warning({
          description: '',
          message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
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
      const { confirmPassword, authenticationDate } = curInfo;
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
        currentPeriod: authenticationDate,
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
        // this.getCurrentPeriod(false, this.statisticalConfirmDS);
        this.props.statisticalConfirmDS.query();
      }
    }
  }

  // 当期已勾选发票统计确签: 申请/取消统计
  @Bind()
  async handleStatistics() {
    const { checkCertificationListDS } = this.props;
    const { queryDataSet } = checkCertificationListDS;
    const { queryDataSet: tableQueyDataSet } = this.props.statisticalConfirmDS;
    const { empInfo } = this.state;
    const {
      companyId,
      companyCode,
      companyName,
      employeeNum: employeeNumber,
      employeeId,
      taxpayerNumber,
    } = empInfo;
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
      });
    }
    const judgeRes = await judgeButton({ tenantId, companyId });
    if (judgeRes) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.tickInvalid6`)
          .d('当前存在勾选或取消勾选运行中的请求不允许申请/取消统计'),
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
          message: intl.get(`${modelCode}.view.tickInvalid7`).d('请先获取当前所属期'),
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
        // this.getCurrentPeriod(false, this.statisticalConfirmDS);
        this.props.statisticalConfirmDS.query();
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
        >
          {props.title}
        </Button>
      );
    });
    const StatisticsBtn = observer((props: any) => {
      const { queryDataSet } = props.dataSet;
      const authenticationDateObj =
        queryDataSet && queryDataSet.current?.get('authenticationDateObj');
      const isDisabled = !authenticationDateObj;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
        >
          {props.title}
        </Button>
      );
    });
    const btnMenu = (
      <Menu>
        <MenuItem>
          <Button
            key="applyStatistics"
            funcType={FuncType.link}
            onClick={() => this.handleStatistics()}
          >
            {intl.get(`${modelCode}.button.applyStatistics`).d('申请统计')}
          </Button>
        </MenuItem>
        <MenuItem>
          <Button
            key="cancelStatistics"
            funcType={FuncType.link}
            onClick={() => this.handleStatistics()}
          >
            {intl.get(`${modelCode}.button.cancelStatistics`).d('取消统计')}
          </Button>
        </MenuItem>
      </Menu>
    );
    return [
      <Dropdown overlay={btnMenu}>
        <Button color={ButtonColor.primary}>
          {intl.get('hivp.checkCertification.button.batchStatistics').d('统计')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
      <Button
        key="confirmSignature"
        color={ButtonColor.default}
        onClick={() => this.statisticalConfirmSign()}
      >
        {intl.get(`${modelCode}.button.confirmSignature`).d('确认签名')}
      </Button>,
      <BatchBtn
        key="refreshAll"
        onClick={() => this.statisticalConfirmRefresh()}
        dataSet={this.props.statisticalConfirmDS}
        title={intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态')}
      />,
      <StatisticsBtn
        key="applyDeduction"
        onClick={() => this.statisticsModal(1)}
        dataSet={this.props.statisticalConfirmDS}
        title={intl.get(`${modelCode}.button.applyDeduction`).d('申请抵扣统计')}
      />,
      <StatisticsBtn
        key="certificationResults"
        onClick={() => this.statisticsModal(2)}
        dataSet={this.props.statisticalConfirmDS}
        title={intl.get(`${modelCode}.button.certificationResults`).d('认证结果统计')}
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
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.props.statisticalConfirmDS.query();
    }
  }

  async handleJump(record, modal, type) {
    const { dispatch } = this.props;
    const { queryDataSet: cerQueryDataSet } = this.props.certifiableInvoiceListDS;
    const { empInfo } = this.state;
    const {
      companyId,
      companyCode,
      employeeId,
      employeeNum,
      taxpayerNumber,
      companyName,
    } = empInfo;
    const invoiceCategory = cerQueryDataSet && cerQueryDataSet.current?.get('invoiceCategory');
    const authorityCode = cerQueryDataSet && cerQueryDataSet.current?.get('authorityCode');
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    const invoiceDateFrom = record.get('invoiceDateFrom');
    const invoiceDateTo = record.get('invoiceDateTo');
    if (!invoiceDateFrom || !invoiceDateTo) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
    } else {
      modal.close();
      const pathname =
        type === 1
          ? '/htc-front-ivp/check-certification/applyDeduction'
          : '/htc-front-ivp/check-certification/certificationResults';
      const { queryDataSet: certifiableDS } = this.props.certifiableInvoiceListDS;
      const { queryDataSet } = this.props.statisticalConfirmDS;
      const statisticalPeriod = queryDataSet && queryDataSet.current?.get('statisticalPeriod');
      const currentPeriod = certifiableDS && certifiableDS.current!.get('currentPeriod');
      const currentCertState = queryDataSet && queryDataSet.current?.get('currentCertState');
      const invoiceDateFromStr = invoiceDateFrom.format(DEFAULT_DATE_FORMAT);
      const invoiceDateToStr = invoiceDateTo.format(DEFAULT_DATE_FORMAT);
      dispatch(
        routerRedux.push({
          pathname,
          search: querystring.stringify({
            statisticalConfirmInfo: encodeURIComponent(
              JSON.stringify({
                statisticalPeriod,
                currentPeriod,
                currentCertState,
                companyId,
                companyCode,
                employeeId,
                employeeNum,
                taxpayerNumber,
                invoiceCategory,
                taxDiskPassword,
                invoiceDateFromStr,
                invoiceDateToStr,
                companyName,
                authorityCode,
              })
            ),
          }),
        })
      );
    }
  }

  @Bind()
  statisticsModal(type) {
    const { queryDataSet } = this.props.statisticalConfirmDS;
    const statisticalPeriod = queryDataSet && queryDataSet.current?.get('statisticalPeriod');
    const invoiceDateFrom = moment(statisticalPeriod).startOf('month');
    const invoiceDateTo = moment(statisticalPeriod).endOf('month');
    const record = this.timeRangeDS.create({ invoiceDateFrom, invoiceDateTo }, 0);
    const modal = ModalPro.open({
      title: intl.get(`${modelCode}.view.invoiceDateRange`).d('选择时间范围'),
      closable: true,
      children: (
        <Form record={record}>
          <DatePicker name="invoiceDateFrom" />
          <DatePicker name="invoiceDateTo" />
        </Form>
      ),
      footer: (
        <div>
          <Button onClick={() => modal.close()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button color={ButtonColor.primary} onClick={() => this.handleJump(record, modal, type)}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </div>
      ),
    });
  }

  // 当期已勾选发票统计确签:行
  get statisticalConfirmColumns(): ColumnProps[] {
    return [
      { name: 'currentPeriod' },
      {
        name: 'requestType',
        width: 120,
        renderer: ({ text, value }) => {
          let color = '';
          let textColor = '';
          switch (value) {
            case 'APPLY_FOR_CHECK':
              color = '#DBEEFF';
              textColor = '#3889FF';
              break;
            case 'CANCEL_FOR_CHECK':
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            case 'APPLY_FOR_STATISTICS':
              color = '#DBEEFF';
              textColor = '#3889FF';
              break;
            case 'CANCEL_FOR_STATISTICS':
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            case 'APPLY_FOR_CONFIRM':
              color = '#FFECC4';
              textColor = '#FF9D23';
              break;
            default:
              color = '';
              textColor = '';
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {text}
              </Tag>
            </>
          );
        },
      },
      { name: 'requestTime', width: 160 },
      {
        name: 'batchNo',
        width: 330,
        renderer: ({ value, record }) => {
          const requestState = record?.get('requestState');
          const requestStateTxt = record?.getField('requestState')?.getText(requestState);
          let color = '';
          let textColor = '';
          switch (requestState) {
            case 'RUNNING':
              color = '#FFECC4';
              textColor = '#FF9D23';
              break;
            case 'COMPLETED':
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            default:
              color = '';
              textColor = '';
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {requestStateTxt}
              </Tag>
              &nbsp;
              <span>{value}</span>
            </>
          );
        },
      },
      { name: 'completeTime', width: 160 },
      { name: 'checkConfirmState', width: 150 },
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
              funcType={FuncType.link}
            >
              {intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态')}
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
    this.props.statisticalConfirmDS.setQueryParameter('companyId', companyId);
    this.props.statisticalConfirmDS.query();
  }

  // 当期已勾选发票统计确签:查询条件
  @Bind()
  renderStatisticalConfirmQueryBar(props) {
    const { queryDataSet, buttons } = props;
    return (
      <div style={{ marginBottom: '0.1rem' }}>
        <Row>
          <Col span={20}>
            <Form dataSet={queryDataSet} columns={3}>
              <Lov name="authenticationDateObj" />
              <TextField name="currentCertState" />
              <Password name="confirmPassword" reveal={false} />
            </Form>
          </Col>
          <Col span={4} style={{ textAlign: 'end', marginBottom: '4px' }}>
            <Button
              onClick={() => {
                queryDataSet.reset();
                queryDataSet.create();
              }}
            >
              {intl.get('hzero.common.status.reset').d('重置')}
            </Button>
            <Button
              color={ButtonColor.primary}
              onClick={() => {
                this.statisticalQuery();
              }}
            >
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
          </Col>
        </Row>
        {buttons}
      </div>
    );
  }

  get statisticalDetailColumns(): ColumnProps[] {
    return [
      { name: 'invoiceType', width: 200 },
      {
        name: 'deductionInfo',
        aggregation: true,
        align: ColumnAlign.left,
        width: 150,
        children: [
          { name: 'deductionInvoiceNum' },
          { name: 'deductionValidTaxAmount' },
          { name: 'deductionAmount' },
        ],
      },
      {
        name: 'nonDeductionInfo',
        aggregation: true,
        align: ColumnAlign.left,
        children: [
          { name: 'nonDeductionInvoiceNum' },
          { name: 'nonDeductionValidTaxAmount' },
          { name: 'nonDeductionAmount' },
        ],
      },
    ];
  }

  // 下载发票文件
  @Bind()
  async downLoad() {
    const { empInfo } = this.state;
    const { companyId, companyCode, employeeId, employeeNum, taxpayerNumber } = empInfo;
    const needDownloadKey = this.props.batchInvoiceHeaderDS.current!.get('needDownloadKey');
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

  // 批量发票勾选（取消）可认证发票: 刷新状态
  @Bind()
  async batchInvoiceRefresh() {
    const { empInfo } = this.state;
    const selectedList = this.props.batchInvoiceHeaderDS.selected.map((rec) => rec.toData());
    const unPass = selectedList.some((item) => item.checkState !== 'R');
    const batchNoList = uniq(selectedList.map((item) => item.batchNo));
    if (unPass) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.tickInvalid2`)
          .d('存在勾选状态为非请求中状态的发票，无法刷新'),
      });
      return;
    }
    const params = { tenantId, empInfo, batchNoList };
    const res = getResponse(await refreshStatus(params));
    if (res && res.status === '1000') {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.props.batchInvoiceHeaderDS.query();
      // this.setState({
      //   // hide: false,
      //   isBatchFreshDisabled: true,
      // });
    } else {
      notification.error({
        description: '',
        message: res && res.message,
      });
    }
  }

  /**
   * 获取当前可勾选发票
   */
  @Bind()
  async getCurrentCheckInvoices() {
    const { queryDataSet } = this.props.batchInvoiceHeaderDS;
    const { empInfo } = this.state;
    const gxzt = queryDataSet && queryDataSet.current!.get('gxzt');
    const checkableTimeRange = queryDataSet && queryDataSet.current!.get('checkableTimeRange');
    const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
      });
    }
    const params = {
      tenantId,
      companyId,
      companyCode,
      employeeId,
      employeeNumber,
      spmm: taxDiskPassword,
      gxzt,
      checkableTimeRange,
    };
    const res = getResponse(await unCertifiedInvoiceQuery(params));
    if (res) {
      const { completeTime } = res;
      let checkState;
      if (completeTime) {
        checkState = '1';
      } else {
        checkState = '0';
      }
      const data = [
        {
          ...res,
          checkState,
        },
      ];
      this.props.batchInvoiceHeaderDS.loadData(data);
    }
  }

  /**
   * 删除勾选发票
   */
  @Bind()
  handleDeleteBatchCheck() {
    this.props.batchInvoiceHeaderDS.delete(this.props.batchInvoiceHeaderDS.selected);
  }

  // 批量发票勾选（取消）可认证发票: 按钮
  get batchButtons(): Buttons[] {
    const { empInfo, authorityCode } = this.state;
    const { companyId, companyCode, employeeId, employeeNum, taxpayerNumber } = empInfo;
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
      },
      data: {},
      action: `${API_HOST}${HIVP_API}/v1/${tenantId}/batch-check/upload-certified-file?companyId=${companyId}&companyCode=${companyCode}&employeeId=${employeeId}&employeeNumber=${employeeNum}&taxpayerNumber=${taxpayerNumber}&taxDiskPassword=${taxDiskPassword}&authorityCode=${authorityCode}`,
      multiple: false,
      showUploadBtn: false,
      showPreviewImage: false,
      showUploadList: false,
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleUploadError,
    };
    const HeaderButtons = observer((props: any) => {
      let isDisabled;
      if (props.type === 'downLoad') {
        isDisabled = props.dataSet!.length === 0;
      } else {
        isDisabled = props.dataSet!.selected.length === 0;
      }
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
        >
          {props.title}
        </Button>
      );
    });
    const TickButton = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.link}
        >
          {props.title}
        </Button>
      );
    });
    const DeleteButton = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          style={{ float: 'right', marginLeft: '0.08rem' }}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    const CurrentCheckInvoicesButton = observer((props: any) => {
      const { queryDataSet } = props.dataSet;
      const _checkInvoiceCount = queryDataSet && queryDataSet.current!.get('checkInvoiceCount');
      // console.log('_checkInvoiceCount', _checkInvoiceCount);
      const isDisabled = _checkInvoiceCount !== 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          color={ButtonColor.primary}
          id="checkInvoice"
        >
          {props.title}
        </Button>
      );
    });
    const Tooltips = observer((props: any) => {
      const { queryDataSet } = props.dataSet;
      const _checkInvoiceCount = queryDataSet && queryDataSet.current!.get('checkInvoiceCount');
      // console.log('_checkInvoiceCount', _checkInvoiceCount);
      const title =
        _checkInvoiceCount === 0
          ? '根据当前输入查询条件，实时获取可勾选发票并汇总'
          : '当前系统中存在请求中的发票，可在当期勾选可认证发票查看，请请求完成后再重新获取';
      return (
        <Tooltip title={title} placement="right">
          <Icon type="help_outline" className={styles.icon} />
        </Tooltip>
      );
    });
    const btnMenu = (
      <Menu>
        <MenuItem>
          <TickButton
            key="submitTickRequest"
            onClick={() => this.batchOperation()}
            dataSet={this.props.batchInvoiceHeaderDS}
            title={intl.get(`${modelCode}.button.submitTickRequest`).d('提交勾选')}
          />
        </MenuItem>
        <MenuItem>
          <TickButton
            key="submitCancelTickRequest"
            onClick={() => this.batchOperation()}
            dataSet={this.props.batchInvoiceHeaderDS}
            title={intl.get(`${modelCode}.button.submitCancelTickRequest`).d('取消勾选')}
          />
        </MenuItem>
      </Menu>
    );
    return [
      <span className="c7n-pro-btn"><Upload
        {...uploadProps}
        disabled={!companyId}
        accept={[
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ]}
      /></span>,
      <HeaderButtons
        key="downloadFile"
        onClick={() => this.downLoad()}
        dataSet={this.props.batchInvoiceHeaderDS}
        title={intl.get('hivp.taxRefund.button.downloadFile').d('下载发票文件')}
        type="downLoad"
      />,
      <HeaderButtons
        key="refresh"
        onClick={() => this.batchInvoiceRefresh()}
        dataSet={this.props.batchInvoiceHeaderDS}
        title={intl.get(`${modelCode}.button.batchRefresh`).d('刷新状态')}
        type="refresh"
      />,
      <CurrentCheckInvoicesButton
        key="getCurrentCheckInvoices"
        onClick={() => this.getCurrentCheckInvoices()}
        dataSet={this.props.checkCertificationListDS}
        title={intl.get(`${modelCode}.button.getCurrentCheckInvoices`).d('获取当前可勾选发票')}
        type="getCurrentCheckInvoices"
      />,
      <Tooltips dataSet={this.props.checkCertificationListDS} />,
      <DeleteButton
        key="batchDelete"
        onClick={() => this.handleDeleteBatchCheck()}
        dataSet={this.props.batchInvoiceHeaderDS}
        title={intl.get('hzero.common.button.delete').d('删除')}
      />,
      <Dropdown overlay={btnMenu}>
        <Button color={ButtonColor.primary} style={{ float: 'right' }}>
          {intl.get(`${modelCode}.button.batchVerifiable`).d('勾选')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
    ];
  }

  // 批量发票勾选（取消）可认证发票: 行
  async batchOperation() {
    const { empInfo, authorityCode } = this.state;
    const selectedList = this.props.batchInvoiceHeaderDS.selected.map((rec) => rec.toData());
    const {
      companyId,
      companyCode,
      employeeNum: employeeNumber,
      employeeId,
      taxpayerNumber,
    } = empInfo;
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
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
      invoiceCheckCollects: selectedList,
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

  /**
   * 批量勾选发票明细
   */
  handleBatchInvoiceDetail(record, type) {
    const { history } = this.props;
    const recordData = record.toData();
    const { batchNo, requestTime, completeTime, invoiceCheckCollectId } = recordData;
    history.push({
      pathname: `/htc-front-ivp/check-certification/batch-check-detail/${invoiceCheckCollectId}/${type}`,
      search: querystring.stringify({
        batchInvoiceInfo: encodeURIComponent(
          JSON.stringify({
            batchNo,
            requestTime,
            completeTime,
          })
        ),
      }),
    });
  }

  get batchHeaderColumns(): ColumnProps[] {
    return [
      {
        name: 'invoiceNum',
        width: 120,
        renderer: ({ value, record }) => {
          const checkState = record?.get('checkState');
          const checkStateTxt = record?.getField('checkState')?.getText(checkState);
          let color = '';
          let textColor = '';
          switch (checkState) {
            case '0':
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            case '1':
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            case 'R':
              color = '#FFECC4';
              textColor = '#FF9D23';
              break;
            default:
              color = '';
              textColor = '';
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {checkStateTxt}
              </Tag>
              &nbsp;
              <span>{value}</span>
            </>
          );
        },
      },
      { name: 'totalInvoiceAmountGross', width: 120 },
      { name: 'totalInvoiceTheAmount', width: 120 },
      {
        name: 'abnormalInvoiceCount',
        renderer: ({ value }) => value && <span>{`非正常发票不参与批量勾选，共${value}张`}</span>,
      },
      { name: 'batchNo' },
      {
        name: 'failCount',
        renderer: ({ value, record }) => {
          if (value === 0) {
            return value;
          } else {
            return <a onClick={() => this.handleBatchInvoiceDetail(record, 0)}>{value}</a>;
          }
        },
      },
      { name: 'taxStatistics' },
      { name: 'uploadTime' },
      { name: 'requestTime' },
      { name: 'completeTime' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        command: ({ record }): Commands[] => {
          return [
            <a onClick={() => this.handleBatchInvoiceDetail(record, 1)}>
              {intl.get(`${modelCode}.button.batchInvoiceDetail`).d('查看明细')}
            </a>,
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
          message: intl.get('hzero.c7nProUI.Upload.upload_success').d('上传成功'),
        });
        // this.setState({ isBatchFreshDisabled: false });
        this.props.batchInvoiceHeaderDS.query();
      }
    } catch (err) {
      notification.error({
        description: '',
        message: err.message,
      });
    }
    // this.setState({ loadingFlag: false });
  }

  @Bind()
  handleUploadError(response) {
    // this.setState({ loadingFlag: false });
    notification.error({
      description: '',
      message: response,
    });
  }

  // saveMultipleUpload = (node) => {
  //   this.multipleUpload = node;
  // };

  @Bind()
  batchInvoiceQuery(dataSet) {
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    dataSet.setQueryParameter('spmm', taxDiskPassword);
    dataSet.query();
  }

  @Bind()
  renderBatchQueryBar(props) {
    const { queryDataSet, buttons, dataSet } = props;
    const { batchInvoiceMoreDisplay } = this.state;
    const queryMoreArray: JSX.Element[] = [];
    queryMoreArray.push(<Select name="currentCertState" />);
    queryMoreArray.push(<DatePicker name="rqq" />);
    queryMoreArray.push(<DatePicker name="rqz" />);
    queryMoreArray.push(<TextField name="salerTaxNo" />);
    queryMoreArray.push(<Select name="gxzt" />);
    // queryMoreArray.push(<TextField name="batchNo" newLine />);
    // queryMoreArray.push(<DatePicker name="invoiceDate" colSpan={2} />);
    return (
      <div style={{ marginBottom: '0.1rem' }}>
        <Row>
          <Col span={19}>
            <Form dataSet={queryDataSet} columns={3}>
              <TextField name="tjyf" />
              <TextField name="currentOperationalDeadline" />
              <TextField name="checkableTimeRange" />
              {batchInvoiceMoreDisplay && queryMoreArray}
            </Form>
          </Col>
          <Col span={5} style={{ textAlign: 'end' }}>
            <Button
              funcType={FuncType.link}
              onClick={() => this.setState({ batchInvoiceMoreDisplay: !batchInvoiceMoreDisplay })}
            >
              {batchInvoiceMoreDisplay ? (
                <span>
                  {intl.get('hzero.common.button.option').d('更多')}
                  <Icon type="expand_more" />
                </span>
              ) : (
                <span>
                  {intl.get('hzero.common.button.option').d('更多')}
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
              {intl.get('hzero.common.status.reset').d('重置')}
            </Button>
            <Button color={ButtonColor.primary} onClick={() => this.batchInvoiceQuery(dataSet)}>
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
          </Col>
        </Row>
        {buttons}
        <div className="c7n-pro-table-header">
          {intl.get('hivp.taxRefund.table.DataSummary').d('数据汇总情况')}
        </div>
      </div>
    );
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
  showDetail() {
    const modal = ModalPro.open({
      title: intl.get('hiop.invoiceReq.title.companyInfo').d('公司信息'),
      drawer: true,
      // width: 480,
      children: (
        <Form dataSet={this.props.checkCertificationListDS}>
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
          {intl.get(`${modelCode}.modalColse`).d('关闭')}
        </Button>
      ),
    });
  }

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
      title: intl.get('hivp.taxRefund.title.editDiskPass').d('编辑税盘密码'),
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
                      &emsp;{intl.get('hzero.common.status.edit').d('编辑')}
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
      onClick: () => this.companyChange(record.toData(), 0),
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

  @Bind()
  renderStatisticalDetailTitle(record) {
    const currentPeriod = record.get('currentPeriod');
    const requestType = record.get('requestType');
    const requestTypeTxt = record.getField('requestType').getText(requestType);
    let color = '';
    let textColor = '';
    switch (requestType) {
      case 'APPLY_FOR_CHECK':
        color = '#DBEEFF';
        textColor = '#3889FF';
        break;
      case 'CANCEL_FOR_CHECK':
        color = '#F0F0F0';
        textColor = '#959595';
        break;
      case 'APPLY_FOR_STATISTICS':
        color = '#DBEEFF';
        textColor = '#3889FF';
        break;
      case 'CANCEL_FOR_STATISTICS':
        color = '#F0F0F0';
        textColor = '#959595';
        break;
      case 'APPLY_FOR_CONFIRM':
        color = '#FFECC4';
        textColor = '#FF9D23';
        break;
      default:
        color = '';
        textColor = '';
        break;
    }
    return (
      <div>
        <Tag color={color} style={{ color: textColor }}>
          {requestTypeTxt}
        </Tag>
        <span>{currentPeriod}</span>
      </div>
    );
  }

  @Bind()
  async handleTabChange(newActiveKey) {
    const { queryDataSet } = this.props.checkCertificationListDS;
    this.setState({ activeKey: newActiveKey });
    if (queryDataSet) {
      if (['batchInvoice', 'certifiableInvoice'].includes(newActiveKey)) {
        const res = await checkInvoiceCount({ tenantId });
        if (res === 0 && newActiveKey === 'batchInvoice') {
          const checkInvoiceButton = document.getElementById('checkInvoice');
          if (checkInvoiceButton) {
            // console.log('checkInvoiceButton', checkInvoiceButton);
            checkInvoiceButton.click();
          }
        }
        queryDataSet.current!.set({ checkInvoiceCount: res });
      }
    }
  }

  render() {
    const { spinning, progressStatus, progressValue, visible, empInfo, activeKey } = this.state;

    return (
      <>
        <Header title={intl.get(`${modelCode}.title.CheckCertification`).d('勾选认证')}>
          <Button onClick={() => this.updateEnterprise()}>
            {intl.get('hivp.taxRefund.button.updateEnterpriseFile').d('更新企业档案')}
          </Button>
          <Button onClick={() => this.enterpriseFileInit()}>
            {intl.get(`${modelCode}.button.enterpriseFileInit`).d('企业档案初始化')}
          </Button>
        </Header>
        <Row gutter={8} style={{ height: 'calc(100%)', margin: '0 4px' }}>
          <Col span={5} style={{ height: 'calc(100%)' }}>
            <div className={styles.header}>
              <Form
                dataSet={this.props.checkCertificationListDS.queryDataSet}
              // style={{ marginLeft: '-20px' }}
              >
                <Output name="employeeDesc" />
                <Output name="curDate" />
              </Form>
            </div>
            <Content>
              <Form dataSet={this.props.checkCertificationListDS.queryDataSet}>
                <Lov
                  name="companyObj"
                  colSpan={2}
                  placeholder={intl.get('hivp.taxRefund.placeholder.company').d('搜索公司')}
                  onChange={(value) => this.companyChange(value, 1)}
                />
              </Form>
              {this.renderCompany()}
            </Content>
          </Col>
          <Col span={19} style={{ height: 'calc(100%)' }}>
            <Content style={{ height: 'calc(90%)' }}>
              <div className={styles.topTitle}>
                <span className={styles.topName}>{empInfo.companyName}</span>
                <Button
                  key="currentPeriod"
                  onClick={() => this.getCurrentPeriod()}
                  disabled={!empInfo.companyId}
                  color={ButtonColor.primary}
                >
                  {intl.get(`${modelCode}.button.currentPeriod`).d('获取当前所属期')}
                </Button>
                <Tooltip
                  title={intl
                    .get(`${modelCode}.tooltip.title.message`)
                    .d('当前所属期获取后，页面部分功能才可启用')}
                  placement="right"
                >
                  <Icon type="help_outline" className={styles.icon} />
                </Tooltip>
              </div>
              <Spin spinning={spinning}>
                <Tabs
                  className={styles.tabsTitle}
                  activeKey={activeKey}
                  onChange={this.handleTabChange}
                >
                  <TabPane
                    tab={intl
                      .get(`${modelCode}.tabPane.certifiableInvoiceTitle`)
                      .d('当期勾选可认证发票')}
                    key="certifiableInvoice"
                  >
                    <Table
                      dataSet={this.props.certifiableInvoiceListDS}
                      columns={this.verifiableColumns}
                      buttons={this.verifiableBtns}
                      queryBar={this.renderVerifiableBar}
                      style={{ height: 320 }}
                    />
                  </TabPane>
                  <TabPane
                    tab={intl.get(`${modelCode}.statisticalConfirm`).d('申请统计及确签')}
                    key="statisticalConfirm"
                  >
                    <Table
                      dataSet={this.props.statisticalConfirmDS}
                      columns={this.statisticalConfirmColumns}
                      buttons={this.statisticalConfirmButtons}
                      queryBar={this.renderStatisticalConfirmQueryBar}
                      // onRow={({ record }) => this.handleStatisticalRow(record)}
                      style={{ height: 300 }}
                    />
                    <AggregationTable
                      dataSet={this.props.statisticalDetailDS}
                      columns={this.statisticalDetailColumns}
                      aggregation
                      style={{ height: 300 }}
                    />
                  </TabPane>
                  <TabPane
                    tab={intl.get(`${modelCode}.tabPane.batchInvoice`).d('批量勾选可认证发票')}
                    key="batchInvoice"
                  >
                    <Table
                      buttons={this.batchButtons}
                      dataSet={this.props.batchInvoiceHeaderDS}
                      columns={this.batchHeaderColumns}
                      queryBar={this.renderBatchQueryBar}
                      style={{ height: 320 }}
                    />
                    {/* <Table */}
                    {/*  header={intl.get(`${modelCode}.table.batchTaxLine`).d('批量勾选日志')} */}
                    {/*  dataSet={this.batchInvoiceLineDS} */}
                    {/*  columns={this.batchLineColumns} */}
                    {/*  style={{ display: hide ? 'none' : 'block', height: 300 }} */}
                    {/* /> */}
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
