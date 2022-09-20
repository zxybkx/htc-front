/**
 * @Description:勾选认证-申请统计及确签
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-09-23 14:26:15
 * @LastEditTime: 2022-09-19 17:21
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { useEffect, useState } from 'react';
import {
  Button,
  DataSet,
  DatePicker,
  Dropdown,
  Form,
  Lov,
  Menu,
  Modal as ModalPro,
  Password,
  Table,
  TextField,
  CheckBox,
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
  refreshState,
} from '@src/services/checkCertificationService';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import queryString from 'query-string';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import { Col, Icon, Row, Tag } from 'choerodon-ui';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import AggregationTable from '@htccommon/pages/invoice-common/aggregation-table/detail/AggregationTablePage';
import formatterCollections from 'utils/intl/formatterCollections';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import StatisticalConfirmDS, {
  TimeRange,
  AutomaticStatistics,
} from '../stores/StatisticalConfirmDS';
import StatisticalDetailDS from '../stores/StatisticalDetailDS';

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

const automaticStatisticsDS = new DataSet({
  ...AutomaticStatistics(),
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

  const setCompanyObjFromProps = () => {
    const { companyId, employeeId, employeeNum } = empInfo;
    const { currentPeriod, currentCertState } = currentPeriodData;
    if (statisticalConfirmDS) {
      const { queryDataSet } = statisticalConfirmDS;
      if (queryDataSet) {
        if (queryDataSet.current) {
          queryDataSet.current!.set({
            companyId,
            // authenticationDateObj: { currentPeriod },
            // statisticalPeriod: currentPeriod,
            currentCertState,
          });
        } else {
          queryDataSet.create({
            companyId,
            authenticationDateObj: { currentPeriod },
            statisticalPeriod: currentPeriod,
            currentCertState,
          });
        }
        if (companyId) {
          automaticStatisticsDS.setQueryParameter('companyId', companyId);
          automaticStatisticsDS.query().then(res => {
            const { companyId: autoCompanyId } = res;
            if (!autoCompanyId) {
              automaticStatisticsDS.create({ companyId, employeeId, employeeNum });
            }
          });
        }
      }
    }
  };

  useEffect(() => setCompanyObjFromProps(), [empInfo, currentPeriodData]);

  // 当期已勾选发票统计确签:行刷新
  const statisticalConfirmLineRefresh = async record => {
    const recordData = record.toData();
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
      if (statisticalConfirmDS) statisticalConfirmDS.query();
    }
  };

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
            onClick={() => statisticalConfirmLineRefresh(record)}
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

  const BatchBtn = observer((btnProps: any) => {
    const isDisabled = btnProps.dataSet!.selected.length === 0;
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
  });

  const StatisticsBtn = observer((btnProps: any) => {
    const { queryDataSet } = btnProps.dataSet;
    const authenticationDateObj =
      queryDataSet && queryDataSet.current?.get('authenticationDateObj');
    const isDisabled = !authenticationDateObj;
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
  });

  const MenuButton = observer((btnProps: any) => {
    const { queryDataSet } = btnProps.dataSet;
    const isDisabled = queryDataSet?.current?.get('statisticalPeriod');
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={isDisabled}
        funcType={FuncType.link}
      >
        {btnProps.title}
      </Button>
    );
  });

  // 当期已勾选发票统计确签: 申请/取消统计
  const handleStatistics = async () => {
    if (statisticalConfirmDS) {
      // const { queryDataSet } = statisticalConfirmDS;
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
      const { currentCertState } = currentPeriodData;
      // const currentCertState = queryDataSet?.current?.get('currentCertState');
      const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
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
      const employeeDesc = `${companyCode}-${employeeNumber}-${employeeName}-${mobile}`;
      const companyDesc = `${companyCode}-${companyName}`;
      const statisticalPeriod = statisticalConfirmDS.queryDataSet?.current!.get(
        'statisticalPeriod'
      );
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
        statisticalPeriod,
        statisticalFlag,
      };
      const res = getResponse(await applyStatistics(params));
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        statisticalConfirmDS.query();
      }
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
  const statisticalConfirmSign = async () => {
    if (statisticalConfirmDS) {
      const list = statisticalConfirmDS?.map(record => record.toData());
      // const currentCertState = statisticalConfirmDS?.queryDataSet?.current!.get('currentCertState');
      const { currentCertState } = currentPeriodData;
      if (list.some(record => record.requestState === 'RUNNING' || currentCertState === '3')) {
        notification.warning({
          message: intl
            .get(`${modelCode}.view.tickInvalid4`)
            .d('存在当前认证状态为“已确签”或请求状态为“运行中”的数据，不允许确认签名'),
          description: '',
        });
        return;
      }
      const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
      if (!taxDiskPassword) {
        return notification.warning({
          description: '',
          message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
        });
      }
      const {
        companyId,
        companyCode,
        employeeNum: employeeNumber,
        employeeId,
        companyName,
        employeeName,
        mobile,
        taxpayerNumber,
      } = empInfo;
      const judgeRes = await judgeButton({ tenantId, companyId });
      if (judgeRes) {
        notification.warning({
          description: '',
          message: '当前存在勾选或取消勾选运行中的请求不允许确认签名',
        });
        return;
      }
      const { queryDataSet } = statisticalConfirmDS;
      const curInfo = queryDataSet?.current!.toData();
      const employeeDesc = `${companyCode}-${employeeNumber}-${employeeName}-${mobile}`;
      const companyDesc = `${companyCode}-${companyName}`;
      const { statisticalPeriod } = curInfo;
      const confirmPassword = automaticStatisticsDS.current!.get('confirmPassword');
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
        currentPeriod: statisticalPeriod,
        confirmFlag: 1,
        confirmPassword,
      };
      if (!confirmPassword) {
        notification.info({
          description: '',
          message: intl.get(`${modelCode}.view.validate.confirmPassword`).d('请输入确认密码'),
        });
        return;
      }
      const res = getResponse(await confirmSignature(params));
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        statisticalConfirmDS.query();
      }
    }
  };

  // 当期已勾选发票统计确签: 刷新状态
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
    const invoiceDateTo = record.get('invoiceDateTo');
    if (!invoiceDateFrom || !invoiceDateTo) {
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
      const statisticalPeriod = queryDataSet?.current?.get('statisticalPeriod');
      const invoiceDateFromStr = invoiceDateFrom.format(DEFAULT_DATE_FORMAT);
      const invoiceDateToStr = invoiceDateTo.format(DEFAULT_DATE_FORMAT);
      history.push({
        pathname,
        search: queryString.stringify({
          statisticalConfirmInfo: encodeURIComponent(
            JSON.stringify({
              statisticalPeriod,
              currentPeriod: currentPeriodData.currentPeriod,
              currentCertState: currentPeriodData.currentCertState,
              companyId,
              companyCode,
              employeeId,
              employeeNum,
              taxpayerNumber,
              invoiceCategory: '01',
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
      const statisticalPeriod = queryDataSet?.current?.get('statisticalPeriod');
      const invoiceDateFrom = moment(statisticalPeriod).startOf('month');
      const invoiceDateTo = moment(statisticalPeriod).endOf('month');
      const record = timeRangeDS.create({ invoiceDateFrom, invoiceDateTo }, 0);
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
            <Button color={ButtonColor.primary} onClick={() => handleJump(record, modal, type)}>
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          </div>
        ),
      });
    }
  };

  const statisticalButtons: Buttons[] = [
    <Dropdown overlay={btnMenu}>
      <Button color={ButtonColor.primary}>
        {intl.get('hivp.checkCertification.button.batchStatistics').d('统计')}
        <Icon type="arrow_drop_down" />
      </Button>
    </Dropdown>,
    <Button
      key="confirmSignature"
      color={ButtonColor.default}
      onClick={() => statisticalConfirmSign()}
    >
      {intl.get(`${modelCode}.button.confirmSignature`).d('确认签名')}
    </Button>,
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

  // 当期已勾选发票统计确签:查询条件
  const renderQueryBar = propsDS => {
    const { dataSet, queryDataSet, buttons } = propsDS;
    return (
      <div style={{ marginBottom: '0.1rem' }}>
        <Row>
          <Col span={20}>
            {showMore ? (
              <div>
                <div
                  style={{
                    background: 'rgb(0,0,0,0.02)',
                    padding: '10px 10px 0px',
                  }}
                >
                  <h3>
                    <b>{intl.get('hivp.checkCertification.view.queryConditions').d('查询条件')}</b>
                  </h3>
                  <Form dataSet={queryDataSet} columns={3}>
                    <Lov name="authenticationDateObj" />
                    <TextField name="currentCertState" />
                  </Form>
                </div>
                <div
                  style={{
                    background: 'rgb(0,0,0,0.02)',
                    padding: '10px 10px 0px',
                    margin: '10px 0 10px 0',
                  }}
                >
                  <h3>
                    <b>
                      {intl.get('hivp.checkCertification.view.automaticRules').d('自动规则设置')}
                    </b>
                  </h3>
                  <Form dataSet={automaticStatisticsDS} columns={3}>
                    <CheckBox
                      name="autoSignatureSign"
                      onBlur={() => automaticStatisticsDS.submit()}
                    />
                    <TextField name="mailbox" onBlur={() => automaticStatisticsDS.submit()} />
                    <TextField
                      name="autoStatisticsTime"
                      onBlur={() => automaticStatisticsDS.submit()}
                      showHelp={ShowHelp.tooltip}
                      help={intl
                        .get(`${modelCode}.view.autoStatisticsInfo`)
                        .d(
                          '填入15日之前获取的所属期为当月的前一月所属期，填写天数若大于当月最大天数，则默认为当月最后一天'
                        )}
                    />
                    <CheckBox
                      name="autoStatisticsSign"
                      onBlur={() => automaticStatisticsDS.submit()}
                    />
                    <Password
                      name="confirmPassword"
                      reveal={false}
                      onBlur={() => automaticStatisticsDS.submit()}
                    />
                    <TextField
                      name="autoSignatureTime"
                      onBlur={() => automaticStatisticsDS.submit()}
                      showHelp={ShowHelp.tooltip}
                      help={intl
                        .get(`${modelCode}.view.autoConfirmInfo`)
                        .d(
                          '自动统计日期在1-15时，自动确签日期须大于等于统计日期。填写天数若大于当月最大天数，则默认为当月最后一天'
                        )}
                    />
                  </Form>
                </div>
              </div>
            ) : (
              <Form dataSet={queryDataSet} columns={3}>
                <Lov name="authenticationDateObj" />
                <TextField name="currentCertState" />
              </Form>
            )}
          </Col>
          <Col span={4} style={{ textAlign: 'end', marginBottom: '4px' }}>
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
            <Button
              onClick={() => {
                queryDataSet.reset();
                queryDataSet.create();
              }}
            >
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

  return (
    <>
      {statisticalConfirmDS && (
        <Table
          dataSet={statisticalConfirmDS}
          columns={statisticalConfirmColumns}
          buttons={statisticalButtons}
          queryBar={renderQueryBar}
          style={{ height: 300 }}
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
