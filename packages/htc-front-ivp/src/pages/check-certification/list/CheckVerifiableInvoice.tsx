/**
 * @Description:勾选认证-当期勾选可认证发票
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-09-23 14:26:15
 * @LastEditTime: 2022-09-19 09:51
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { useEffect, useState, useContext } from 'react';
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
import InvoiceCategoryContext from './CommonStore';
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

const CheckVerifiableInvoice: React.FC<CheckCertificationPageProps> = props => {
  const {
    certifiableInvoiceListDS,
    companyAndPassword,
    empInfo,
    history,
    checkInvoiceCount,
    currentPeriodData,
  } = props;
  const [progressStatus, setProgressStatus] = useState<any>(ProgressStatus.active);
  const [displayOptions, setDisplayOptions] = useState<[]>([]);
  const [checked, setChecked] = useState<boolean>(true);
  const [unchecked, setUnchecked] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const [verfiableMoreDisplay, setVerfiableMoreDisplay] = useState<boolean>(false);
  const { setInvoiceCategory } = useContext(InvoiceCategoryContext);

  const setInitialValue = async () => {
    const curDisplayOptions = certifiableInvoiceListDS?.queryDataSet?.current?.get(
      'invoiceDisplayOptions'
    );
    const conDisplayOptions = await queryIdpValue('HIVP.CHECK_CONFIRM_DISPLAY_OPTIONS');
    if (certifiableInvoiceListDS) {
      const { queryDataSet } = certifiableInvoiceListDS;
      if (!curDisplayOptions && queryDataSet) {
        queryDataSet.current!.set({
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
          setChecked(false);
          setUnchecked(true);
        } else {
          setUnchecked(false);
        }
        if (invoiceDisplayOptionsArr.indexOf('UNCHECKED') > -1) {
          setChecked(true);
          setUnchecked(false);
        } else {
          setChecked(false);
        }
      }
    }
    setDisplayOptions(conDisplayOptions);
  };

  const setCompanyObjFromProps = () => {
    if (certifiableInvoiceListDS) {
      const { queryDataSet } = certifiableInvoiceListDS;
      if (queryDataSet && queryDataSet.current) {
        queryDataSet.current!.set({
          companyObj: empInfo,
          authorityCode: empInfo.authorityCode,
        });
      }
    }
  };

  const setCurrentPeriodFromProps = () => {
    if (certifiableInvoiceListDS) {
      const { queryDataSet } = certifiableInvoiceListDS;
      const {
        currentPeriod,
        currentOperationalDeadline,
        checkableTimeRange,
        currentCertState,
      } = currentPeriodData;
      if (queryDataSet && queryDataSet.current) {
        queryDataSet.current!.set({
          currentPeriod,
          currentOperationalDeadline,
          checkableTimeRange,
          currentCertState,
        });
      }
    }
  };

  useEffect(() => {
    setInitialValue();
  }, []);
  useEffect(() => {
    setCompanyObjFromProps();
  }, [empInfo]);
  useEffect(() => {
    setCurrentPeriodFromProps();
  }, [currentPeriodData]);

  const commonRendererFn = (value, record) => {
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
  };

  const handleCancel = record => {
    if (certifiableInvoiceListDS) {
      if (record.status === 'add') {
        certifiableInvoiceListDS.remove(record);
      } else {
        record.reset();
        record.setState('editing', false);
      }
    }
  };

  const handleSave = async record => {
    const res = await certifiableInvoiceListDS?.submit();
    if (res && res.content) record.setState('editing', false);
  };

  const handleEdit = record => {
    record.setState('editing', true);
  };

  const commands = record => {
    const btns: any = [];
    if (record.getState('editing')) {
      btns.push(
        <a onClick={() => handleSave(record)}>{intl.get('hzero.common.btn.save').d('保存')}</a>,
        <a onClick={() => handleCancel(record)}>
          {intl.get('hzero.common.status.cancel').d('取消')}
        </a>
      );
    } else {
      btns.push(
        <a onClick={() => handleEdit(record)}>
          {intl.get('hzero.common.button.rule.edit').d('编辑')}
        </a>
      );
    }
    return [
      <span className="action-link" key="action">
        {btns}
      </span>,
    ];
  };

  // 当期勾选(取消)可认证发票: 行
  const columns: Array<ColumnProps> = [
    { name: 'invoiceType', width: 150 },
    { name: 'invoiceCode', width: 150 },
    {
      name: 'invoiceNo',
      width: 180,
      renderer: ({ value, record }) => {
        return commonRendererFn(value, record);
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
      renderer: ({ record }) => commands(record),
      help: intl.get('hivp.checkCertification.view.adjustEffectiveTax').d('调整有效税额'),
      lock: ColumnLock.right,
      align: ColumnAlign.center,
    },
  ];

  // 发票勾选
  const checkRequest = async isTick => {
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
    const selectedList = certifiableInvoiceListDS?.selected.map(rec => rec.toData());
    const contentRows = selectedList?.length;
    let invoiceRequestParamDto = {};
    const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
      });
    }
    if (certifiableInvoiceListDS) {
      const { queryDataSet } = certifiableInvoiceListDS;
      const { currentPeriod } = currentPeriodData;
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
  };

  // 提交勾选请求
  const handleSubmitTickRequest = () => {
    const selectedList = certifiableInvoiceListDS?.selected.map(rec => rec.toData());
    if (selectedList?.some(item => item.invoiceState !== '0' || item.checkState !== '0')) {
      notification.warning({
        message: intl
          .get(`${modelCode}.view.tickInvalid`)
          .d('存在发票状态为非“正常”或勾选状态为非“未勾选”的数据，不允许提交'),
        description: '',
      });
      return;
    }
    checkRequest(1);
  };

  // 提交取消勾选请求
  const handleSubmitCancelTickRequest = () => {
    const selectedList = certifiableInvoiceListDS?.selected.map(rec => rec.toData());
    if (selectedList?.some(item => item.invoiceState !== '0' || item.checkState !== '1')) {
      notification.warning({
        message: intl
          .get(`${modelCode}.view.tickInvalid1`)
          .d('存在发票状态为非“正常”或勾选状态为非“已勾选”的数据，不允许提交'),
        description: '',
      });
      return;
    }
    checkRequest(0);
  };

  /**
   * 循环查找可认证发票
   */
  const loopRequest = async (totalRequest, startRow, contentRows, findParams, counts) => {
    const { startRow: startrow, contentRows: contentrows } = await findVerifiableInvoice({
      ...findParams,
      startRow,
      contentRows,
    });
    const _progressValue = progressValue + 100 / (totalRequest + 2);
    setCount(count + 1);
    setProgressValue(_progressValue);
    if (counts < totalRequest - 2) {
      await loopRequest(totalRequest, startrow, contentrows, findParams, count);
    }
    setCount(0);
  };

  // 实时查找可认证发票
  const handleFindVerifiableInvoice = async () => {
    const { queryDataSet } = certifiableInvoiceListDS!;
    const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
    const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
      });
    }
    if (queryDataSet) {
      const certifiableQueryData = queryDataSet.current!.toData();
      const {
        invoiceCategory,
        invoiceNumber,
        invoiceDateFrom,
        invoiceDateTo,
      } = certifiableQueryData;
      const { currentPeriod, checkableTimeRange } = currentPeriodData;
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
        return;
      }
      setProgressStatus(ProgressStatus.active);
      setProgressValue(0);
      setVisible(true);
      let i = 2;
      if (res && res.totalRequest > 1) {
        i += res.totalRequest;
        await loopRequest(res.totalRequest, res.startRow, res.contentRows, findParams, count);
      }
      setProgressValue(progressValue + 100 / i);
      setProgressStatus(ProgressStatus.success);
      setProgressValue(100);
      setVisible(false);
      await certifiableInvoiceListDS?.query();
    }
  };

  // 已认证详情
  const handleGoToDetail = () => {
    const pathname = '/htc-front-ivp/check-certification/certifiableInvoice/detail';
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
      const { currentPeriod, currentCertState } = currentPeriodData;
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
  };

  // 当期勾选(取消)可认证发票: 刷新状态
  const verifiableRefresh = async () => {
    const selectedList = certifiableInvoiceListDS?.selected.map(rec => rec.toData());
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
  };

  const TickButton = observer((btnProps: any) => {
    const isDisabled = btnProps.dataSet!.selected.length === 0;
    const { condition } = btnProps;
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={isDisabled}
        funcType={condition === 'refresh' ? FuncType.flat : FuncType.link}
      >
        {btnProps.title}
      </Button>
    );
  });

  const Tooltips = () => {
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
  };

  const btnMenu = (
    <Menu>
      <MenuItem>
        <TickButton
          key="submitTickRequest"
          onClick={() => handleSubmitTickRequest()}
          dataSet={certifiableInvoiceListDS}
          title={intl.get(`${modelCode}.button.submitTickRequest`).d('提交勾选')}
        />
      </MenuItem>
      <MenuItem>
        <TickButton
          key="submitCancelTickRequest"
          onClick={() => handleSubmitCancelTickRequest()}
          dataSet={certifiableInvoiceListDS}
          title={intl.get(`${modelCode}.button.submitCancelTickRequest`).d('取消勾选')}
        />
      </MenuItem>
    </Menu>
  );

  const VerifiableButton = btnProps => {
    const { currentPeriod } = currentPeriodData;
    const isDisabled = !currentPeriod || checkInvoiceCount !== 0;
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={isDisabled}
        funcType={FuncType.flat}
      >
        {btnProps.title}
      </Button>
    );
  };

  const CertifiedDetail = btnProps => {
    const { currentPeriod } = currentPeriodData;
    const isDisabled = !currentPeriod;
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={isDisabled}
        funcType={FuncType.flat}
      >
        {btnProps.title}
      </Button>
    );
  };

  const tableButtons: Buttons[] = [
    <Dropdown overlay={btnMenu}>
      <Button color={ButtonColor.primary}>
        {intl.get(`${modelCode}.button.batchVerifiable`).d('勾选')}
        <Icon type="arrow_drop_down" />
      </Button>
    </Dropdown>,
    <VerifiableButton
      key="verifiableInvoices"
      dataSet={certifiableInvoiceListDS}
      onClick={() => handleFindVerifiableInvoice()}
      title={intl.get(`${modelCode}.button.verifiableInvoices`).d('实时查找可认证发票')}
    />,
    <Tooltips />,
    <CertifiedDetail
      key="certifiedDetails"
      dataSet={certifiableInvoiceListDS}
      onClick={() => handleGoToDetail()}
      title={intl.get(`${modelCode}.button.certifiedDetails`).d('已认证详情')}
    />,
    <TickButton
      key="refresh"
      onClick={() => verifiableRefresh()}
      dataSet={certifiableInvoiceListDS}
      title={intl.get('hiop.invoiceWorkbench.button.refresh').d('刷新状态')}
      condition="refresh"
    />,
  ];

  // 多值选框互斥
  const handleOptChange = value => {
    if (value && value.indexOf('CURRENT_PERIOD_CHECKED') > -1) {
      setChecked(false);
      setUnchecked(true);
    } else {
      setUnchecked(false);
    }

    if (value && value.indexOf('UNCHECKED') > -1) {
      setChecked(true);
      setUnchecked(false);
    } else {
      setChecked(false);
    }
  };

  const handleVerifiableQuery = () => {
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
  };

  // 当期勾选(取消)可认证发票: 头
  function renderQueryBar(propsDS) {
    const { queryDataSet, buttons } = propsDS;
    let optionList: any = [];
    if (displayOptions.length > 0) {
      optionList = displayOptions.map((item: any) => {
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
      <Select name="invoiceDisplayOptions" multiple onChange={handleOptChange} colSpan={3}>
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
              <Select name="invoiceCategory" onChange={value => setInvoiceCategory(value)} />
              <DatePicker name="currentOperationalDeadline" />
              {verfiableMoreDisplay && queryMoreArray}
            </Form>
          </Col>
          <Col span={6} style={{ textAlign: 'end' }}>
            <Button
              funcType={FuncType.link}
              onClick={() => setVerfiableMoreDisplay(!verfiableMoreDisplay)}
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
            <Button color={ButtonColor.primary} onClick={() => handleVerifiableQuery()}>
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
          </Col>
        </Row>
        {buttons}
      </div>
    );
  }

  return (
    <>
      {certifiableInvoiceListDS && (
        <>
          <Table
            dataSet={certifiableInvoiceListDS}
            columns={columns}
            buttons={tableButtons}
            queryBar={renderQueryBar}
            style={{ height: 320 }}
          />
          <Modal title="" visible={visible} closable={false} footer={null}>
            <Progress percent={progressValue} status={progressStatus} />
          </Modal>
        </>
      )}
    </>
  );
};

export default formatterCollections({
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
})(
  withProps(
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
  )(CheckVerifiableInvoice)
);