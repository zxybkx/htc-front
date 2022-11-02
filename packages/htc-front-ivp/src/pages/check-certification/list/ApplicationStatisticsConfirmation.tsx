/**
 * @Description:勾选认证-申请统计及确签
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-09-23 14:26:15
 * @LastEditTime: 2022-09-19 17:21
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  DataSet,
  DatePicker,
  Dropdown,
  Form,
  Lov,
  Menu,
  Modal as ModalPro,
  Table,
  TextField,
  Select,
  Password,
} from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import {
  applyStatistics,
  confirmSignature,
  judgeButton,
  refreshAllState,
  getCurPeriod,
} from '@src/services/checkCertificationService';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import queryString from 'query-string';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import { Col, Icon, Row, Tag } from 'choerodon-ui';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import AggregationTable from '@htccommon/pages/invoice-common/aggregation-table/detail/AggregationTablePage';
import formatterCollections from 'utils/intl/formatterCollections';
import StatisticalConfirmDS, { TimeRange } from '../stores/StatisticalConfirmDS';
import StatisticalDetailDS from '../stores/StatisticalDetailDS';
import InvoiceCategoryContext from './CommonStore';

const { Item: MenuItem } = Menu;

const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();

interface ApplicationStatisticsConfirmationProps {
  companyAndPassword: DataSet;
  empInfo: any;
  currentPeriodData: any;
  history: any;
  statisticalConfirmDS?: DataSet;
  statisticalDetailDS?: DataSet;
}

const timeRangeDS = new DataSet({
  autoQuery: false,
  ...TimeRange(),
});

const ApplicationStatisticsConfirmation: React.FC<ApplicationStatisticsConfirmationProps> = props => {
  const {
    statisticalConfirmDS,
    statisticalDetailDS,
    empInfo,
    companyAndPassword,
    history,
    currentPeriodData,
  } = props;
  const [showMore, setShowMore] = useState<boolean>(false);
  const [statisticsLoading, setStatisticsLoading] = useState<boolean>(false);
  const [confirmedLoading, setConfirmedLoading] = useState<boolean>(false);
  const { invoiceCategory, immediatePeriod, setImmediatePeriod } = useContext(
    InvoiceCategoryContext
  );

  const setCompanyObjFromProps = () => {
    const { companyId } = empInfo;
    if (statisticalConfirmDS) {
      const { queryDataSet } = statisticalConfirmDS;
      if (queryDataSet && queryDataSet.current) {
        const curCompanyId = queryDataSet.current.get('companyId');
        if (!isEmpty(empInfo) && companyId !== curCompanyId) {
          queryDataSet.current.reset();
          queryDataSet.current!.set({
            companyId,
          });
          statisticalConfirmDS.loadData([]);
        }
      }
    }
  };

  const setCurrentPeriodFromProps = () => {
    if (statisticalConfirmDS) {
      const { queryDataSet } = statisticalConfirmDS;
      if (queryDataSet && queryDataSet.current) {
        const companyId = queryDataSet.current.get('companyId');
        if (!isEmpty(empInfo) && empInfo.companyId === companyId) {
          const period = immediatePeriod || currentPeriodData;
          const { currentPeriod, currentCertState, currentOperationalDeadline } = period;
          queryDataSet.current!.set({
            currentPeriod,
            currentOperationalDeadline,
            currentCertState,
          });
        }
      }
    }
  };

  useEffect(() => setCompanyObjFromProps(), [empInfo]);

  useEffect(() => setCurrentPeriodFromProps(), [currentPeriodData, immediatePeriod]);

  const statisticalConfirmColumns: Array<ColumnProps> = [
    { name: 'currentPeriod' },
    {
      name: 'requestType',
      width: 120,
      renderer: ({ text, value }) => {
        let color = '';
        let textColor = '';
        switch (value) {
          case 'APPLY_FOR_CHECK':
          case 'APPLY_FOR_STATISTICS':
            color = '#DBEEFF';
            textColor = '#3889FF';
            break;
          case 'CANCEL_FOR_CHECK':
          case 'CANCEL_FOR_STATISTICS':
            color = '#F0F0F0';
            textColor = '#959595';
            break;
          case 'APPLY_FOR_CONFIRM':
            color = '#FFECC4';
            textColor = '#FF9D23';
            break;
          default:
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
    { name: 'employeeName' },
  ];

  const BatchBtn = observer((btnProps: any) => {
    const { inChannelCode } = empInfo;
    const isDisabled = btnProps.dataSet!.selected.length === 0;
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={isDisabled}
        funcType={FuncType.flat}
        style={{
          display: ['ZK_IN_CHANNEL_DIGITAL'].includes(inChannelCode) ? 'none' : 'inline',
        }}
      >
        {btnProps.title}
      </Button>
    );
  });

  const StatisticsBtn = observer((btnProps: any) => {
    const { queryDataSet } = btnProps.dataSet;
    const currentPeriod = queryDataSet && queryDataSet.current?.get('currentPeriod');
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={!currentPeriod}
        funcType={FuncType.flat}
      >
        {btnProps.title}
      </Button>
    );
  });

  const MenuButton = observer((btnProps: any) => {
    const { queryDataSet } = btnProps.dataSet;
    const isDisabled = queryDataSet && queryDataSet.current?.get('currentPeriod');
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={!isDisabled}
        funcType={FuncType.link}
      >
        {btnProps.title}
      </Button>
    );
  });

  // 当期已勾选发票统计确签: 申请/取消统计
  const handleStatistics = async () => {
    if (statisticalConfirmDS) {
      const { queryDataSet } = statisticalConfirmDS;
      const currentCertState = queryDataSet && queryDataSet.current?.get('currentCertState');
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
      const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
      const judgeRes = await judgeButton({ tenantId, companyId });
      if (judgeRes || currentCertState === '3') {
        notification.warning({
          description: '',
          message: intl
            .get(`${modelCode}.view.tickInvalid6`)
            .d(
              '存在勾选、取消勾选、运行中的请求或当期认证状态为“已确签”的数据，不允许申请/取消统计'
            ),
        });
        return;
      }
      const employeeDesc = `${companyCode}-${employeeNumber}-${employeeName}-${mobile}`;
      const companyDesc = `${companyCode}-${companyName}`;
      const currentPeriod = queryDataSet && queryDataSet.current!.get('currentPeriod');
      let statisticalFlag;
      if (['0', '1'].includes(currentCertState)) statisticalFlag = 1;
      if (['2', '3'].includes(currentCertState)) statisticalFlag = 0;
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
        statisticalPeriod: currentPeriod,
        statisticalFlag,
      };
      setStatisticsLoading(true);
      const res = getResponse(await applyStatistics(params));
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        statisticalConfirmDS.query();
      }
      setStatisticsLoading(false);
      // 更新所属期
      const periodRes = getResponse(await getCurPeriod({ tenantId, companyId, currentPeriod }));
      if (periodRes) setImmediatePeriod(periodRes);
    }
  };

  const btnMenu = (
    <Menu>
      <MenuItem>
        <MenuButton
          key="applyStatistics"
          onClick={() => handleStatistics()}
          dataSet={statisticalConfirmDS}
          title={intl.get(`${modelCode}.button.applyStatistics`).d('申请统计')}
        />
      </MenuItem>
      <MenuItem>
        <MenuButton
          key="cancelStatistics"
          onClick={() => handleStatistics()}
          dataSet={statisticalConfirmDS}
          title={intl.get(`${modelCode}.button.cancelStatistics`).d('取消统计')}
        />
      </MenuItem>
    </Menu>
  );

  // 当期已勾选发票统计确签: 确认签名
  // const statisticalConfirmSign = async () => {
  //   if (statisticalConfirmDS) {
  //     const { queryDataSet } = statisticalConfirmDS;
  //     const list = statisticalConfirmDS?.map(record => record.toData());
  //     const currentCertState = queryDataSet && queryDataSet.current?.get('currentCertState');
  //     // const { currentCertState } = currentPeriodData;
  //     if (list.some(record => record.requestState === 'RUNNING' || currentCertState === '3')) {
  //       notification.warning({
  //         message: intl
  //           .get(`${modelCode}.view.tickInvalid4`)
  //           .d('存在当前认证状态为“已确签”或请求状态为“运行中”的数据，不允许确认签名'),
  //         description: '',
  //       });
  //       return;
  //     }
  //     const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
  //     if (!taxDiskPassword) {
  //       return notification.warning({
  //         description: '',
  //         message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
  //       });
  //     }
  //     const {
  //       companyId,
  //       companyCode,
  //       employeeNum: employeeNumber,
  //       employeeId,
  //       companyName,
  //       employeeName,
  //       mobile,
  //       taxpayerNumber,
  //     } = empInfo;
  //     const judgeRes = await judgeButton({ tenantId, companyId });
  //     if (judgeRes) {
  //       notification.warning({
  //         description: '',
  //         message: '当前存在勾选或取消勾选运行中的请求不允许确认签名',
  //       });
  //       return;
  //     }
  //     const curInfo = queryDataSet?.current!.toData();
  //     const employeeDesc = `${companyCode}-${employeeNumber}-${employeeName}-${mobile}`;
  //     const companyDesc = `${companyCode}-${companyName}`;
  //     const { statisticalPeriod } = curInfo;
  //     const confirmPassword = automaticStatisticsDS.current!.get('confirmPassword');
  //     const params = {
  //       tenantId,
  //       companyId,
  //       companyCode,
  //       companyDesc,
  //       employeeId,
  //       employeeNumber,
  //       employeeDesc,
  //       taxDiskPassword,
  //       taxpayerNumber,
  //       currentPeriod: statisticalPeriod,
  //       confirmFlag: 1,
  //       confirmPassword,
  //     };
  //     if (!confirmPassword) {
  //       notification.info({
  //         description: '',
  //         message: intl.get(`${modelCode}.view.validate.confirmPassword`).d('请输入确认密码'),
  //       });
  //       return;
  //     }
  //     const res = getResponse(await confirmSignature(params));
  //     if (res) {
  //       notification.success({
  //         description: '',
  //         message: res.message,
  //       });
  //       statisticalConfirmDS.query();
  //     }
  //   }
  // };

  // 申请统计及确签: 刷新状态
  const statisticalConfirmRefresh = async () => {
    if (statisticalConfirmDS) {
      const list = statisticalConfirmDS?.selected.map(record => record.toData());
      if (list.some(record => record.requestState === 'COMPLETED')) {
        notification.warning({
          message: intl
            .get(`${modelCode}.view.tickInvalid`)
            .d('存在请求状态为“已完成”的数据，不允许刷新状态'),
          description: '',
        });
        return;
      }
      const { companyId, employeeId } = empInfo;
      const params = { tenantId, companyId, employeeId };
      const res = getResponse(await refreshAllState(params));
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        statisticalConfirmDS.query();
      }
    }
  };

  // 统计跳转
  const handleJump = async (record, modal, type) => {
    const {
      companyId,
      companyCode,
      employeeId,
      employeeNum,
      taxpayerNumber,
      companyName,
    } = empInfo;
    const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
    const invoiceDateFrom = record.get('invoiceDateFrom');
    const _currentPeriod = record.get('currentPeriod');
    const invoiceDateTo = record.get('invoiceDateTo');
    if (!invoiceDateFrom || !invoiceDateTo || !_currentPeriod) {
      return notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
    }
    modal.close();
    const pathname =
      type === 1
        ? '/htc-front-ivp/check-certification/applyDeduction'
        : '/htc-front-ivp/check-certification/certificationResults';
    if (statisticalConfirmDS) {
      const { queryDataSet } = statisticalConfirmDS;
      const currentCertState = queryDataSet?.current?.get('currentCertState');
      const invoiceDateFromStr = invoiceDateFrom.format(DEFAULT_DATE_FORMAT);
      const invoiceDateToStr = invoiceDateTo.format(DEFAULT_DATE_FORMAT);
      history.push({
        pathname,
        search: queryString.stringify({
          statisticalConfirmInfo: encodeURIComponent(
            JSON.stringify({
              currentPeriod: _currentPeriod,
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
              authorityCode: empInfo.authorityCode,
            })
          ),
        }),
      });
    }
  };

  const statisticsModal = type => {
    if (statisticalConfirmDS) {
      const { queryDataSet } = statisticalConfirmDS;
      const { companyId } = empInfo;
      const currentPeriod = queryDataSet?.current?.get('currentPeriod');
      // const invoiceDateFrom = moment(currentPeriod).startOf('month');
      // const invoiceDateTo = moment(currentPeriod).endOf('month');
      const record = timeRangeDS.create({ companyId, authenticationDateObj: { currentPeriod } }, 0);
      const modal = ModalPro.open({
        title: intl.get(`${modelCode}.view.invoiceDateRange`).d('选择时间范围'),
        closable: true,
        children: (
          <Form record={record}>
            <Lov name="authenticationDateObj" />
            <DatePicker name="invoiceDateFrom" />
            <DatePicker name="invoiceDateTo" />
          </Form>
        ),
        footer: (
          <div>
            <Button onClick={() => modal.close()}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button color={ButtonColor.primary} onClick={() => handleJump(record, modal, type)}>
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          </div>
        ),
      });
    }
  };

  // 申请统计及确签: 认证
  const handleConfirm = async type => {
    if (statisticalConfirmDS) {
      const { queryDataSet } = statisticalConfirmDS;
      const currentCertState = queryDataSet && queryDataSet.current?.get('currentCertState');
      const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
      if (['0', '1'].includes(currentCertState)) {
        notification.warning({
          description: '',
          message: intl
            .get('hivp.checkCertification.validate.batchConfirm')
            .d('当前认证状态不在统计阶段'),
        });
        return;
      } else if (currentCertState === '3' && type === 1) {
        notification.warning({
          description: '',
          message: intl
            .get('hivp.checkCertification.validate.confirmCertification')
            .d('当前已认证，只能取消认证'),
        });
        return;
      }
      const {
        companyId,
        companyCode,
        employeeId,
        employeeNum,
        taxpayerNumber,
        companyName,
        employeeName,
        mobile,
      } = empInfo;
      const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
      const companyDesc = `${companyCode}-${companyName}`;
      const currentPeriod = queryDataSet && queryDataSet.current?.get('currentPeriod');
      const confirmPassword = queryDataSet && queryDataSet.current?.get('confirmPassword');
      if (!confirmPassword) {
        notification.info({
          description: '',
          message: intl.get(`${modelCode}.view.validate.confirmPassword`).d('请输入确认密码'),
        });
        return;
      }
      const params = {
        tenantId,
        companyId,
        companyCode,
        companyDesc,
        employeeId,
        employeeNumber: employeeNum,
        employeeDesc,
        taxDiskPassword,
        taxpayerNumber,
        currentPeriod,
        confirmFlag: type,
        confirmPassword,
      };
      setConfirmedLoading(true);
      const res = getResponse(await confirmSignature(params));
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        statisticalConfirmDS.query();
      }
      setConfirmedLoading(false);
      // 更新所属期
      const periodRes = getResponse(await getCurPeriod({ tenantId, companyId, currentPeriod }));
      if (periodRes) setImmediatePeriod(periodRes);
    }
  };

  const confirmMenu = (
    <Menu>
      <MenuItem>
        <MenuButton
          key="confirmCertification"
          onClick={() => handleConfirm(1)}
          dataSet={statisticalConfirmDS}
          title={intl.get(`${modelCode}.button.confirmCertification`).d('确认认证')}
        />
      </MenuItem>
      <MenuItem>
        <MenuButton
          key="cancelCertification"
          onClick={() => handleConfirm(0)}
          dataSet={statisticalConfirmDS}
          title={intl.get(`${modelCode}.button.cancelCertification`).d('取消认证')}
        />
      </MenuItem>
    </Menu>
  );

  const statisticalButtons: Buttons[] = [
    <Dropdown overlay={btnMenu}>
      <Button color={ButtonColor.primary} loading={statisticsLoading}>
        {intl.get('hivp.checkCertification.button.batchStatistics').d('统计')}
        <Icon type="arrow_drop_down" />
      </Button>
    </Dropdown>,
    <Dropdown overlay={confirmMenu}>
      <Button color={ButtonColor.primary} loading={confirmedLoading}>
        {intl.get('hivp.checkCertification.button.batchConfirmed').d('确签')}
        <Icon type="arrow_drop_down" />
      </Button>
    </Dropdown>,
    // <Button
    //   key="confirmSignature"
    //   color={ButtonColor.default}
    //   onClick={() => statisticalConfirmSign()}
    // >
    //   {intl.get(`${modelCode}.button.confirmSignature`).d('确认签名')}
    // </Button>,
    <BatchBtn
      key="refreshAll"
      onClick={() => statisticalConfirmRefresh()}
      dataSet={statisticalConfirmDS}
      title={intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态')}
    />,
    <StatisticsBtn
      key="applyDeduction"
      onClick={() => statisticsModal(1)}
      dataSet={statisticalConfirmDS}
      title={intl.get(`${modelCode}.button.applyDeduction`).d('申请抵扣统计')}
    />,
    <StatisticsBtn
      key="certificationResults"
      onClick={() => statisticsModal(2)}
      dataSet={statisticalConfirmDS}
      title={intl.get(`${modelCode}.button.certificationResults`).d('认证结果统计')}
    />,
  ];

  const handleReset = () => {
    if (statisticalConfirmDS) {
      const { queryDataSet } = statisticalConfirmDS;
      if (queryDataSet) {
        queryDataSet.reset();
        setCompanyObjFromProps();
      }
    }
  };

  // 当期已勾选发票统计确签:查询条件
  const renderQueryBar = propsDS => {
    const { dataSet, queryDataSet, buttons } = propsDS;
    const queryMoreArray: JSX.Element[] = [];
    queryMoreArray.push(<Lov name="authenticationDateObjFrom" />);
    queryMoreArray.push(<Lov name="authenticationDateObjTo" />);
    queryMoreArray.push(<Password name="confirmPassword" reveal={false} />);
    queryMoreArray.push(<Select name="requestType" colSpan={2} />);
    return (
      <div style={{ marginBottom: '0.1rem' }}>
        <Row>
          <Col span={18}>
            <Form dataSet={queryDataSet} columns={3}>
              <TextField name="currentPeriod" />
              <Select name="currentCertState" />
              <DatePicker name="currentOperationalDeadline" />
              {showMore && queryMoreArray}
            </Form>
          </Col>
          <Col span={6} style={{ textAlign: 'end', marginBottom: '4px' }}>
            <Button funcType={FuncType.link} onClick={() => setShowMore(!showMore)}>
              {showMore ? (
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
            <Button onClick={() => handleReset()}>
              {intl.get('hzero.common.status.reset').d('重置')}
            </Button>
            <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
          </Col>
        </Row>
        {buttons}
      </div>
    );
  };

  const detailColumns: Array<ColumnProps> = [
    { name: 'invoiceType', width: 200 },
    {
      name: 'deductionInfo',
      aggregation: true,
      align: ColumnAlign.left,
      // width: 150,
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

  return (
    <>
      {statisticalConfirmDS && (
        <Table
          dataSet={statisticalConfirmDS}
          columns={statisticalConfirmColumns}
          buttons={statisticalButtons}
          queryBar={renderQueryBar}
          style={{ height: 280 }}
        />
      )}
      {statisticalDetailDS && (
        <AggregationTable
          dataSet={statisticalDetailDS}
          columns={detailColumns}
          aggregation
          style={{ height: 300 }}
        />
      )}
    </>
  );
};

export default formatterCollections({
  code: [
    modelCode,
    'hiop.invoiceWorkbench',
    'hivp.taxRefund',
    'hiop.redInvoiceInfo',
    'htc.common',
    'hivp.bill',
  ],
})(
  withProps(
    () => {
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
      return {
        statisticalConfirmDS,
        statisticalDetailDS,
      };
    },
    { cacheState: true }
  )(ApplicationStatisticsConfirmation)
);
