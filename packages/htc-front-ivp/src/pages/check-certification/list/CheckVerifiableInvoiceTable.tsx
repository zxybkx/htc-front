/**
 * @Description:勾选认证-当期勾选可认证发票
 * @version: 1.0
 * @Author: shan.zhang@hand-china.com
 * @Date: 2020-09-23 14:26:15
 * @LastEditTime: 2021-02-26 15:14:28
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import {
  Button,
  Currency,
  DataSet,
  DatePicker,
  Dropdown,
  Form,
  Menu,
  Progress,
  Select,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import {
  certifiableInvoiceRefresh,
  findVerifiableInvoice,
  handlecheckRequest,
} from '@src/services/checkCertificationService';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import queryString from 'query-string';
import { ProgressStatus } from 'choerodon-ui/lib/progress/enum';
import { observer } from 'mobx-react-lite';
import { set, split, uniqBy } from 'lodash';
import { Col, Icon, Modal, Row, Tag, Tooltip } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import CertifiableInvoiceListDS from '../stores/CertifiableInvoiceListDS';
import styles from '../checkcertification.less';

const { Option } = Select;
const { Item: MenuItem } = Menu;

const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();

interface CheckCertificationPageProps {
  companyAndPassword: DataSet;
  empInfo: any;
  currentPeriodData: any;
  checkInvoiceCount: number;
  history: any;
  certifiableInvoiceListDS?: DataSet;
}

@withProps(
  () => {
    const certifiableInvoiceListDS = new DataSet({
      autoQuery: false,
      ...CertifiableInvoiceListDS(),
    });
    return {
      certifiableInvoiceListDS,
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
export default class CheckVerifiableInvoiceTable extends Component<CheckCertificationPageProps> {
  state = {
    displayOptions: [], // 发票显示选项
    checked: true, // 已勾选
    unchecked: false, // 未勾选
    count: 0,
    progressValue: 0,
    progressStatus: ProgressStatus.active,
    visible: false, // 进度条是否显示
    verfiableMoreDisplay: false, // 当期可认证发票查询是否显示更多
  };

  async componentDidMount() {
    const { certifiableInvoiceListDS, checkInvoiceCount } = this.props;
    const curDisplayOptions = certifiableInvoiceListDS?.queryDataSet?.current?.get(
      'invoiceDisplayOptions'
    );
    const displayOptions = await queryIdpValue('HIVP.CHECK_CONFIRM_DISPLAY_OPTIONS');
    if (certifiableInvoiceListDS) {
      const { queryDataSet } = certifiableInvoiceListDS;
      if (!curDisplayOptions) {
        queryDataSet?.current!.set({
          invoiceDisplayOptions: [
            'UNCHECKED',
            'ACCOUNTED',
            'DISACCOUNT',
            'DOCS_UNITED',
            'NON_DOCS',
          ],
          checkInvoiceCount,
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
    this.setState({
      displayOptions,
    });
  }

  async componentDidUpdate(prevProps) {
    const { certifiableInvoiceListDS } = this.props;
    if (prevProps.empInfo && prevProps.empInfo !== this.props.empInfo) {
      if (certifiableInvoiceListDS) {
        const { queryDataSet } = certifiableInvoiceListDS;
        queryDataSet?.current!.set({
          companyObj: this.props.empInfo,
          authorityCode: this.props.empInfo.authorityCode,
        });
      }
    }
    if (
      prevProps.currentPeriodData &&
      prevProps.currentPeriodData !== this.props.currentPeriodData
    ) {
      if (certifiableInvoiceListDS) {
        const { queryDataSet } = certifiableInvoiceListDS;
        const {
          currentPeriod,
          currentOperationalDeadline,
          checkableTimeRange,
          currentCertState,
        } = this.props.currentPeriodData;
        if (queryDataSet) {
          queryDataSet?.current!.set({
            currentPeriod,
            currentOperationalDeadline,
            checkableTimeRange,
            currentCertState,
          });
        }
      }
    }
    if (
      prevProps.checkInvoiceCount &&
      prevProps.checkInvoiceCount !== this.props.checkInvoiceCount
    ) {
      if (certifiableInvoiceListDS) {
        const { queryDataSet } = certifiableInvoiceListDS;
        if (queryDataSet) {
          queryDataSet?.current!.set({ checkInvoiceCount: this.props.checkInvoiceCount });
        }
      }
    }
  }

  // 已认证详情
  @Bind()
  handleGoToDetail() {
    const { history, empInfo, companyAndPassword } = this.props;
    const pathname = '/htc-front-ivp/check-certification/certifiableInvoice/detail';
    const { certifiableInvoiceListDS } = this.props;
    const { queryDataSet } = certifiableInvoiceListDS!;
    const {
      companyId,
      companyCode,
      companyName,
      employeeNum: employeeNumber,
      employeeId,
    } = empInfo;
    const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
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
      history.push({
        pathname,
        search: queryString.stringify({
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
      });
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
    const { certifiableInvoiceListDS, empInfo } = this.props;
    const { progressValue } = this.state;
    const { queryDataSet: certifiableQueryDS } = certifiableInvoiceListDS!;
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
        authorityCode: empInfo.authorityCode,
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
      const res = getResponse(await findVerifiableInvoice(findParams));
      if (res) {
        notification.error({
          description: '',
          message: res.message,
        });
        // return;
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
      this.setState({ progressValue: progressValue + 100 / i });
      this.setState({
        progressValue: 100,
        progressStatus: ProgressStatus.success,
        visible: false,
      });
      await this.props.certifiableInvoiceListDS?.query();
    }
  }

  // 发票勾选
  @Bind()
  async checkRequest(isTick) {
    const { certifiableInvoiceListDS, empInfo } = this.props;
    const {
      companyId,
      companyCode,
      companyName,
      employeeNum: employeeNumber,
      employeeId,
      taxpayerNumber,
      employeeName,
      mobile,
    } = empInfo;
    const employeeDesc = `${companyCode}-${employeeNumber}-${employeeName}-${mobile}`;
    const companyDesc = `${companyCode}-${companyName}`;
    const selectedList = this.props.certifiableInvoiceListDS?.selected.map(rec => rec.toData());
    const contentRows = selectedList?.length;
    let invoiceRequestParamDto = {};
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
      });
    }
    if (certifiableInvoiceListDS) {
      const { queryDataSet } = certifiableInvoiceListDS;
      const currentPeriod = queryDataSet?.current?.get('currentPeriod');
      const invoiceCategory = queryDataSet?.current?.get('invoiceCategory');
      if (invoiceCategory === '01') {
        // 增值税
        const data = selectedList?.map((record: any) => {
          const {
            invoiceCode: fpdm,
            invoiceNo: fphm,
            invoiceDate: kprq,
            validTaxAmount: yxse,
            invoicePoolHeaderId: id,
            invoiceCheckCollectId,
          } = record;
          return { fpdm, fphm, kprq, yxse, id, gxzt: isTick, invoiceCheckCollectId };
        });
        invoiceRequestParamDto = {
          data,
          contentRows,
          spmm: taxDiskPassword,
        };
      } else {
        const paymentCustomerData = selectedList?.map((record: any) => {
          const {
            invoiceNo: jkshm,
            taxAmount: se,
            invoiceDate: tfrq,
            validTaxAmount: yxse,
            invoicePoolHeaderId: id,
            invoiceCheckCollectId,
          } = record;
          return { fply: '1', jkshm, se, tfrq, yxse, id, zt: isTick, invoiceCheckCollectId };
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
        certifiableInvoiceListDS.query();
      }
    }
  }

  // 提交勾选请求
  @Bind()
  handleSubmitTickRequest() {
    const selectedList = this.props.certifiableInvoiceListDS?.selected.map(rec => rec.toData());
    if (selectedList?.some(item => item.invoiceState !== '0' || item.checkState !== '0')) {
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
    const selectedList = this.props.certifiableInvoiceListDS?.selected.map(rec => rec.toData());
    if (selectedList?.some(item => item.invoiceState !== '0' || item.checkState !== '1')) {
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
    const { certifiableInvoiceListDS } = this.props;
    const selectedList = this.props.certifiableInvoiceListDS?.selected.map(rec => rec.toData());
    if (selectedList?.some(item => item.checkState !== 'R')) {
      notification.warning({
        message: intl
          .get(`${modelCode}.view.tickInvalid2`)
          .d('存在勾选状态为非“请求中”的数据，不允许刷新'),
        description: '',
      });
      return;
    }
    const batchNoList = uniqBy(selectedList, 'batchNumber');
    const data = batchNoList.map(item => {
      return {
        batchNumber: item.batchNumber,
        requestSource: item.requestSource,
      };
    });
    const { empInfo } = this.props;
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
      if (certifiableInvoiceListDS) certifiableInvoiceListDS.query();
    }
  }

  // 当期勾选(取消)可认证发票: 按钮
  get buttons(): Buttons[] {
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
    const Tooltips = observer((props: any) => {
      const { queryDataSet } = props.dataSet;
      const checkInvoiceCount = queryDataSet && queryDataSet.current?.get('checkInvoiceCount');
      const title =
        checkInvoiceCount === 0
          ? ''
          : '当前系统中存在请求中的发票，可在当期勾选可认证发票查看，请请求完成后再重新获取';
      return (
        <Tooltip title={title} placement="top">
          <Icon
            type="help_outline"
            className={styles.icon}
            style={{ display: checkInvoiceCount === 0 ? 'none' : 'inline' }}
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
    const VerifiableButton = observer((props: any) => {
      const { queryDataSet } = props.dataSet;
      const currentPeriod = queryDataSet && queryDataSet.current?.get('currentPeriod');
      const checkInvoiceCount = queryDataSet && queryDataSet.current?.get('checkInvoiceCount');
      const isDisabled = !currentPeriod || checkInvoiceCount !== 0;
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
    const CertifiedDetail = observer((props: any) => {
      const { queryDataSet } = props.dataSet;
      const currentPeriod = queryDataSet && queryDataSet.current?.get('currentPeriod');
      const isDisabled = !currentPeriod;
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
    return [
      <Dropdown overlay={btnMenu}>
        <Button color={ButtonColor.primary}>
          {intl.get(`${modelCode}.button.batchVerifiable`).d('勾选')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
      <VerifiableButton
        key="verifiableInvoices"
        dataSet={this.props.certifiableInvoiceListDS}
        onClick={() => this.handleFindVerifiableInvoice()}
        title={intl.get(`${modelCode}.button.getVerifiableInvoices`).d('实时查找可认证发票')}
      />,
      <Tooltips dataSet={this.props.certifiableInvoiceListDS} />,
      <CertifiedDetail
        key="certifiedDetails"
        dataSet={this.props.certifiableInvoiceListDS}
        onClick={() => this.handleGoToDetail()}
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
    const { certifiableInvoiceListDS } = this.props;
    if (certifiableInvoiceListDS) {
      const { queryDataSet } = certifiableInvoiceListDS;
      certifiableInvoiceListDS.query();
      if (queryDataSet) {
        queryDataSet.current!.set({ number: 0 });
        queryDataSet.current!.set({ amount: 0 });
        queryDataSet.current!.set({ taxAmount: 0 });
        queryDataSet.current!.set({ validTaxAmount: 0 });
      }
    }
  }

  // 当期勾选(取消)可认证发票: 头
  @Bind()
  renderQueryBar(props) {
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
        optionsFilter={record => ['01', '03', '08', '14'].includes(record.get('value'))}
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
        renderer={value =>
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
    const { certifiableInvoiceListDS } = this.props;
    if (certifiableInvoiceListDS) {
      if (record.status === 'add') {
        certifiableInvoiceListDS.remove(record);
      } else {
        record.reset();
        record.setState('editing', false);
      }
    }
  }

  @Bind()
  async handleSave(record) {
    const res = await this.props.certifiableInvoiceListDS?.submit();
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

  @Bind()
  commonRendererFn({ value, record }): any {
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
  }

  // 当期勾选(取消)可认证发票: 行
  get columns(): ColumnProps[] {
    return [
      { name: 'invoiceType', width: 150 },
      { name: 'invoiceCode', width: 150 },
      {
        name: 'invoiceNo',
        width: 180,
        renderer: ({ value, record }) => {
          return this.commonRendererFn({ value, record });
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
        editor: record => record.getState('editing') && record.get('checkState') === '0',
        width: 150,
        align: ColumnAlign.right,
      },
      { name: 'invoiceState' },
      { name: 'isPoolFlag' },
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

  render() {
    const { certifiableInvoiceListDS } = this.props;
    const { progressStatus, progressValue, visible } = this.state;
    return (
      <>
        {certifiableInvoiceListDS && (
          <>
            <Table
              dataSet={certifiableInvoiceListDS}
              columns={this.columns}
              buttons={this.buttons}
              queryBar={this.renderQueryBar}
              style={{ height: 320 }}
            />
            <Modal title="" visible={visible} closable={false} footer={null}>
              <Progress percent={progressValue} status={progressStatus} />
            </Modal>
          </>
        )}
      </>
    );
  }
}
