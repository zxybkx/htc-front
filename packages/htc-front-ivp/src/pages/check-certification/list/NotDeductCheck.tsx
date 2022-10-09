/**
 * @Description:勾选认证-不抵扣勾选
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-09-28 15:01
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Currency,
  DataSet,
  DatePicker,
  Dropdown,
  Form,
  Menu,
  Select,
  Table,
  TextField,
  Lov,
} from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { partialCheck } from '@src/services/checkCertificationService';
import withProps from 'utils/withProps';
import moment from 'moment';
import { getResponse } from 'utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { observer } from 'mobx-react-lite';
import { Col, Icon, Row, Tag } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import NoDeductCheckDS from '../stores/NotDeductCheckDS';
import InvoiceCategoryContext from './CommonStore';

const { Item: MenuItem } = Menu;

const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();

interface CheckCertificationPageProps {
  companyAndPassword: DataSet;
  empInfo: any;
  currentPeriodData: any;
  checkInvoiceCount: number;
  history: any;
  noDeductCheckDS?: DataSet;
}

const NotDeductCheck: React.FC<CheckCertificationPageProps> = props => {
  const { noDeductCheckDS, companyAndPassword, empInfo, currentPeriodData } = props;
  const [verfiableMoreDisplay, setVerfiableMoreDisplay] = useState<boolean>(false);
  const { immediatePeriod } = useContext(InvoiceCategoryContext);

  const setCompanyObjFromProps = () => {
    if (noDeductCheckDS) {
      const { queryDataSet } = noDeductCheckDS;
      if (queryDataSet && queryDataSet.current) {
        queryDataSet.current!.set({
          companyObj: empInfo,
          authorityCode: empInfo.authorityCode,
        });
      }
    }
  };

  const setCurrentPeriodFromProps = () => {
    if (noDeductCheckDS) {
      const { queryDataSet } = noDeductCheckDS;
      if (queryDataSet && queryDataSet.current) {
        const period = immediatePeriod || currentPeriodData;
        const {
          currentPeriod,
          currentOperationalDeadline,
          checkableTimeRange,
          currentCertState,
        } = period;
        const dateFrom = currentPeriod && moment(currentPeriod).startOf('month');
        const dateTo = currentPeriod && moment(currentPeriod).endOf('month');
        queryDataSet.current!.set({
          currentPeriod,
          expiredDate: currentOperationalDeadline,
          checkableTimeRange,
          currentCertState,
          rzrqq: dateFrom,
          rzrqz: dateTo,
        });
      }
    }
  };

  useEffect(() => {
    setCompanyObjFromProps();
  }, [empInfo]);
  useEffect(() => {
    setCurrentPeriodFromProps();
  }, [currentPeriodData, immediatePeriod]);

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
    if (noDeductCheckDS) {
      if (record.status === 'add') {
        noDeductCheckDS.remove(record);
      } else {
        record.reset();
        record.setState('editing', false);
      }
    }
  };

  const handleSave = async record => {
    const res = await noDeductCheckDS?.submit();
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
    { name: 'reasonsForNonDeduction' },
    { name: 'invoiceState' },
    { name: 'isPoolFlag' },
    { name: 'entryAccountState' },
    { name: 'rzrq' },
    { name: 'receiptsState', width: 130 },
    { name: 'sourceSystem' },
    { name: 'documentTypeMeaning' },
    { name: 'documentRemark' },
    { name: 'checkDate', width: 130 },
    { name: 'authenticationState' },
    { name: 'authenticationType' },
    { name: 'infoSource' },
    { name: 'taxBureauManageState', width: 120 },
    { name: 'isEntryNotConform', width: 150 },
    { name: 'purpose' },
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
  const checkRequest = async () => {
    const {
      companyId,
      companyCode,
      employeeNum: employeeNumber,
      employeeId,
      taxpayerNumber,
      authorityCode,
    } = empInfo;
    const selectedList = noDeductCheckDS?.selected.map(rec => rec.toData());
    // let invoiceRequestParamDto = {};
    const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
    if (!taxDiskPassword) {
      return notification.warning({
        description: '',
        message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
      });
    }
    if (noDeductCheckDS) {
      const { queryDataSet } = noDeductCheckDS;
      const currentPeriod = queryDataSet?.current?.get('currentPeriod');
      // if (invoiceCategory === '01') {
      //   invoiceRequestParamDto = { selectedList, taxDiskPassword };
      // } else {
      //   invoiceRequestParamDto = { selectedList, taxDiskPassword };
      // }
      const params = {
        tenantId,
        authorityCode,
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        currentPeriod,
        taxpayerNumber,
        taxDiskPassword,
        selectedList,
      };
      const res = getResponse(await partialCheck(params));
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        noDeductCheckDS.query();
      }
    }
  };

  // 提交勾选请求
  const handleSubmitTickRequest = () => {
    if (noDeductCheckDS) {
      const { queryDataSet } = noDeductCheckDS;
      const currentCertState = queryDataSet && queryDataSet.current?.get('currentCertState');
      const selectedList = noDeductCheckDS.selected.map(rec => rec.toData());
      if (
        !['0', '1'].includes(currentCertState) ||
        selectedList?.some(item => item.invoiceState !== '0' || item.checkState !== '0')
      ) {
        notification.warning({
          message: intl
            .get(`${modelCode}.view.tickInvalid`)
            .d(
              '当前认证状态为“未勾选认证/勾选阶段"、 发票状态为“正常”、勾选状态为“未勾选”的数据，才允许提交'
            ),
          description: '',
        });
        return;
      }
      checkRequest();
    }
  };

  // 提交取消勾选请求
  const handleSubmitCancelTickRequest = () => {
    if (noDeductCheckDS) {
      const { queryDataSet } = noDeductCheckDS;
      const currentCertState = queryDataSet && queryDataSet.current?.get('currentCertState');
      const selectedList = noDeductCheckDS.selected.map(rec => rec.toData());
      if (
        !['0', '1'].includes(currentCertState) ||
        selectedList?.some(item => item.invoiceState !== '0' || item.checkState !== '1')
      ) {
        notification.warning({
          message: intl
            .get(`${modelCode}.view.tickInvalid1`)
            .d(
              '当前认证状态为“未勾选认证/勾选阶段"、 发票状态为“正常”、勾选状态为“已勾选”的数据，才允许提交'
            ),
          description: '',
        });
        return;
      }
      checkRequest();
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

  const btnMenu = (
    <Menu>
      <MenuItem>
        <TickButton
          key="submitTickRequest"
          onClick={() => handleSubmitTickRequest()}
          dataSet={noDeductCheckDS}
          title={intl.get(`${modelCode}.button.submitTickRequest`).d('提交勾选')}
        />
      </MenuItem>
      <MenuItem>
        <TickButton
          key="submitCancelTickRequest"
          onClick={() => handleSubmitCancelTickRequest()}
          dataSet={noDeductCheckDS}
          title={intl.get(`${modelCode}.button.submitCancelTickRequest`).d('取消勾选')}
        />
      </MenuItem>
    </Menu>
  );

  const setReasons = () => {
    if (noDeductCheckDS) {
      const { queryDataSet } = noDeductCheckDS;
      const reasonsForNonDeduction =
        queryDataSet && queryDataSet.current?.get('reasonsForNonDeduction');
      noDeductCheckDS.selected.map(record =>
        record.set('reasonsForNonDeduction', reasonsForNonDeduction)
      );
      noDeductCheckDS.submit();
    }
  };

  const ReasonButton = observer((btnProps: any) => {
    const { queryDataSet } = btnProps.dataSet;
    const reasonsForNonDeduction =
      queryDataSet && queryDataSet.current?.get('reasonsForNonDeduction');
    const isDisabled = btnProps.dataSet!.selected.length === 0 || !reasonsForNonDeduction;
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={isDisabled}
        funcType={FuncType.raised}
        color={ButtonColor.primary}
      >
        {btnProps.title}
      </Button>
    );
  });

  const tableButtons: Buttons[] = [
    <Dropdown overlay={btnMenu}>
      <Button color={ButtonColor.primary}>
        {intl.get(`${modelCode}.button.batchVerifiable`).d('勾选')}
        <Icon type="arrow_drop_down" />
      </Button>
    </Dropdown>,
    <ReasonButton
      key="reason"
      onClick={() => setReasons()}
      dataSet={noDeductCheckDS}
      title={intl.get(`${modelCode}.button.batchReasons`).d('批量设置不抵扣原因')}
    />,
  ];

  const handleVerifiableQuery = () => {
    if (noDeductCheckDS) {
      const { queryDataSet } = noDeductCheckDS;
      noDeductCheckDS.query();
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
    const queryMoreArray: JSX.Element[] = [];
    queryMoreArray.push(<Select name="currentCertState" />);
    queryMoreArray.push(<Select name="invoiceCategory" />);
    queryMoreArray.push(<TextField name="invoiceCode" />);
    queryMoreArray.push(<TextField name="invoiceNumber" />);
    queryMoreArray.push(<DatePicker name="invoiceDate" />);
    queryMoreArray.push(<Select name="checkState" />);
    queryMoreArray.push(<Lov name="systemCodeObj" />);
    queryMoreArray.push(<Lov name="documentTypeCodeObj" />);
    queryMoreArray.push(<Lov name="documentNumberObj" />);
    queryMoreArray.push(<Select name="isPoolFlag" />);
    queryMoreArray.push(<Select name="entryAccountState" />);
    queryMoreArray.push(<DatePicker name="entryAccountDate" />);
    queryMoreArray.push(<TextField name="salerName" />);
    queryMoreArray.push(
      <TextField
        name="number"
        renderer={value =>
          value.text && `${value.text}${intl.get('hivp.checkCertification.view.share').d('份')}`
        }
      />
    );
    queryMoreArray.push(<Select name="abnormalSign" />);
    queryMoreArray.push(<Currency name="taxAmount" />);
    queryMoreArray.push(<Currency name="validTaxAmount" />);
    queryMoreArray.push(<Currency name="amount" />);
    queryMoreArray.push(<Currency name="reasonsForNonDeduction" />);
    return (
      <div style={{ marginBottom: '0.1rem' }}>
        <Row>
          <Col span={18}>
            <Form dataSet={queryDataSet} columns={3}>
              <TextField name="currentPeriod" />
              <TextField name="checkableTimeRange" />
              <DatePicker name="expiredDate" />
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
      {noDeductCheckDS && (
        <>
          <Table
            dataSet={noDeductCheckDS}
            columns={columns}
            buttons={tableButtons}
            queryBar={renderQueryBar}
            style={{ height: 320 }}
          />
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
      const noDeductCheckDS = new DataSet({
        autoQuery: false,
        ...NoDeductCheckDS(),
      });
      return {
        noDeductCheckDS,
      };
    },
    { cacheState: true }
  )(NotDeductCheck)
);
