/**
 * @Description:勾选认证
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-09-23 14:26:15
 * @LastEditTime: 2022-09-19 9:50
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Content, Header } from 'components/Page';
import {
  Button,
  DataSet,
  Form,
  Lov,
  Modal as ModalPro,
  Output,
  Password,
  Table,
  Tabs,
  TextField,
} from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import {
  getCurrentEmployeeInfo,
  getTenantAgreementCompany,
} from '@htccommon/services/commonService';
import {
  businessTimeQuery,
  checkInvoiceCount,
  enterpriseSave,
  getTaskPassword,
  getTaxAuthorityCode,
  updateEnterpriseFile,
} from '@src/services/checkCertificationService';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { isEmpty, remove } from 'lodash';
import { Col, Icon, Row, Tooltip } from 'choerodon-ui';
import { EmployeeInterface } from '@htccommon/utils/employee';
import formatterCollections from 'utils/intl/formatterCollections';
import CheckCertificationListDS from '../stores/CheckCertificationListDS';
import CompanyAndPasswordDS from '../stores/CompanyAndPasswordDS';
import CheckVerifiableInvoiceTable from './CheckVerifiableInvoice';
import ApplicationStatisticsConfirmationTable from './ApplicationStatisticsConfirmation';
import BatchCheckVerifiableInvoicesTable from './BatchCheckVerifiableInvoices';
import NotDeductCheck from './NotDeductCheck';
import { CategoryProvider } from './CommonStore';
import styles from '../checkcertification.less';

const { TabPane } = Tabs;
const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();

interface CheckCertificationPageProps extends RouteComponentProps {
  checkCertificationListDS: DataSet;
  companyAndPassword: DataSet;
}

const CheckCertifiList: React.FC<CheckCertificationPageProps> = props => {
  const { checkCertificationListDS, companyAndPassword, history } = props;
  const [empInfo, setEmpInfo] = useState({} as EmployeeInterface);
  const [currentPeriod, setCurrentPeriod] = useState<object>({});
  const [activeKey, setActiveKey] = useState<string>('certifiableInvoice');
  // const [invoiceCount, setInvoiceCount] = useState<number>(0);

  // 获取初始值
  const getInitialValue = async () => {
    const { queryDataSet } = checkCertificationListDS;
    const query = location.search;
    const type = new URLSearchParams(query).get('type');
    switch (type) {
      case '2':
        setActiveKey('statisticalConfirm');
        break;
      case '3':
        setActiveKey('batchInvoice');
        break;
      default:
        break;
    }
    if (queryDataSet) {
      const curCompanyId = queryDataSet.current?.get('companyId');
      const _currentPeriod = queryDataSet.current?.get('currentPeriod');
      // const _invoiceCount = queryDataSet.current?.get('invoiceCount');
      if (_currentPeriod) {
        setCurrentPeriod(_currentPeriod);
      }
      // if (_invoiceCount || _invoiceCount === 0) {
      // setInvoiceCount(_invoiceCount);
      // }
      if (curCompanyId) {
        const curInfo = await getCurrentEmployeeInfo({ tenantId, companyId: curCompanyId });
        if (curInfo && curInfo.content) getEmpInfoAndAuthorityCode(curInfo.content[0]);
      } else {
        const res = await getCurrentEmployeeInfo({ tenantId });
        if (res && res.content && res.content[0]) {
          companyAndPassword.loadData(res.content);
          // 获取是否有勾选请求中的发票
          const checkInvoiceCountRes = await checkInvoiceCount({ tenantId });
          // setInvoiceCount(checkInvoiceCountRes);
          queryDataSet.current!.set({ invoiceCount: checkInvoiceCountRes });
          getEmpInfoAndAuthorityCode(res.content[0]);
        }
      }
    }
  };

  useEffect(() => {
    getInitialValue();
  }, []);

  const getPassword = async (companyObj, dataSet) => {
    const res = await getTaskPassword({ tenantId, companyCode: companyObj.companyCode });
    if (res && res.content && !isEmpty(res.content)) {
      const { taxDiskPassword } = res.content[0];
      dataSet.current!.set({ taxDiskPassword });
    }
  };

  // 获取基础数据（主管架构代码、员工信息、通道编码、税盘密码）
  const getEmpInfoAndAuthorityCode = async curEmpInfo => {
    const { queryDataSet } = checkCertificationListDS;
    // const apiCondition = process.env.EMPLOYEE_API;
    // let inChannelCode: string;
    // if (apiCondition === 'OP') {
    //   inChannelCode = 'UNAISINO_IN_CHANNEL';
    // } else {
    //   const resCop = await getTenantAgreementCompany({ companyId: curEmpInfo.companyId, tenantId });
    //   ({ inChannelCode } = resCop);
    // }
    const resCop = await getTenantAgreementCompany({ companyId: curEmpInfo.companyId, tenantId });
    const { inChannelCode } = resCop;
    companyAndPassword.current!.set({ inChannelCode });
    if (inChannelCode === 'AISINO_IN_CHANNEL') {
      companyAndPassword.current!.set({ taxDiskPassword: '88888888' });
    } else {
      await getPassword(curEmpInfo, companyAndPassword);
    }
    const { competentTaxAuthorities } = await getTaxAuthorityCode({
      tenantId,
      companyId: curEmpInfo.companyId,
    });
    if (queryDataSet) {
      queryDataSet.current!.set({ companyObj: curEmpInfo, authorityCode: competentTaxAuthorities });
    }
    checkCertificationListDS.setQueryParameter('companyId', curEmpInfo.companyId);
    checkCertificationListDS.query();
    setEmpInfo({ authorityCode: competentTaxAuthorities, inChannelCode, ...curEmpInfo });
  };

  // 改变所属公司
  const companyChange = (value, type) => {
    const { queryDataSet } = checkCertificationListDS;
    if (queryDataSet && value) {
      if (type === 0) {
        getEmpInfoAndAuthorityCode(value);
      } else {
        const companyData = companyAndPassword.toData();
        if (companyData) {
          remove(companyData, (item: any) => item.companyId === value.companyId);
          const data = [value, ...companyData];
          companyAndPassword.loadData(data);
          getEmpInfoAndAuthorityCode(value);
        }
      }
    }
    setActiveKey('certifiableInvoice');
  };

  /**
   * 更新企业档案
   * @returns
   */
  const updateEnterprise = async () => {
    const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
    const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
    // if (!taxDiskPassword) {
    //   notification.warning({
    //     description: '',
    //     message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
    //   });
    // }
    const res = getResponse(
      await updateEnterpriseFile({
        tenantId,
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        taxDiskPassword,
      })
    );
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      checkCertificationListDS.query();
    }
  };

  /**
   * 企业档案初始化
   * @returns
   */
  const enterpriseFileInit = async () => {
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
  };

  const showDetail = () => {
    const modal = ModalPro.open({
      title: intl.get('hiop.invoiceReq.title.companyInfo').d('公司信息'),
      drawer: true,
      children: (
        <Form dataSet={checkCertificationListDS}>
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
  };

  const handlePasswordSave = async modal => {
    const validate = await companyAndPassword.validate(false, false);
    if (validate) {
      const res = await companyAndPassword.submit();
      if (res && res.status === 'H1014') {
        modal.close();
      }
    }
  };

  const taxDiskPasswordChange = record => {
    const modal = ModalPro.open({
      title: intl.get('hivp.taxRefund.title.editDiskPass').d('编辑税盘密码'),
      children: (
        <Form record={record}>
          <TextField name="companyName" />
          <Password name="taxDiskPassword" />
        </Form>
      ),
      closable: true,
      onOk: () => handlePasswordSave(modal),
      onCancel: () => companyAndPassword.reset(),
    });
  };

  const companyAndPasswordColumns: Array<ColumnProps> = [
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
                {empInfo.companyId === companyId ? (
                  <a onClick={() => showDetail()}>{value}</a>
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
                {empInfo.companyId === companyId && inChannelCode !== 'AISINO_IN_CHANNEL' && (
                  <a onClick={() => taxDiskPasswordChange(record)}>
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

  const handleRow = record => {
    return {
      onClick: () => companyChange(record.toData(), 0),
    };
  };

  const renderCompany = () => {
    return (
      <div className={styles.companyList}>
        <Table
          dataSet={companyAndPassword}
          columns={companyAndPasswordColumns}
          aggregation
          showHeader={false}
          onRow={({ record }) => handleRow(record)}
        />
      </div>
    );
  };

  // 获取当前所属期
  const getCurrentPeriod = async () => {
    const { queryDataSet } = checkCertificationListDS;
    const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
    const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
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
      setCurrentPeriod(res);
      if (queryDataSet) queryDataSet.current!.set({ currentPeriod: res });
    }
  };

  const handleTabChange = newActiveKey => {
    setActiveKey(newActiveKey);
  };

  return (
    <>
      <Header title={intl.get(`${modelCode}.title.CheckCertification`).d('勾选认证')}>
        <Button
          onClick={() => updateEnterprise()}
          style={{
            display: ['ZK_IN_CHANNEL_DIGITAL'].includes(empInfo.inChannelCode) ? 'none' : 'inline',
          }}
        >
          {intl.get('hivp.taxRefund.button.updateEnterpriseFile').d('更新企业档案')}
        </Button>
        <Button onClick={() => enterpriseFileInit()}>
          {intl.get(`${modelCode}.button.enterpriseFileInit`).d('企业档案初始化')}
        </Button>
      </Header>
      <Row gutter={8} style={{ height: 'calc(100%)', margin: '0 4px' }}>
        <Col span={5} style={{ height: 'calc(100%)' }}>
          <div className={styles.header}>
            <Form dataSet={checkCertificationListDS.queryDataSet} style={{ marginLeft: '-20px' }}>
              <Output name="employeeDesc" />
              <Output name="curDate" />
            </Form>
          </div>
          <Content>
            <Form dataSet={checkCertificationListDS.queryDataSet}>
              <Lov
                name="companyObj"
                colSpan={2}
                placeholder={intl.get('hivp.taxRefund.placeholder.company').d('搜索公司')}
                onChange={value => companyChange(value, 1)}
              />
            </Form>
            {renderCompany()}
          </Content>
        </Col>
        <Col span={19} style={{ height: 'calc(100%)' }}>
          <Content style={{ height: 'calc(90%)' }}>
            <div className={styles.topTitle}>
              <span className={styles.topName}>{empInfo.companyName}</span>
              <Button
                key="currentPeriod"
                onClick={() => getCurrentPeriod()}
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
            <CategoryProvider>
              <Tabs className={styles.tabsTitle} activeKey={activeKey} onChange={handleTabChange}>
                <TabPane
                  tab={intl
                    .get(`${modelCode}.tabPane.certifiableInvoiceTitle`)
                    .d('当期勾选可认证发票')}
                  key="certifiableInvoice"
                >
                  <CheckVerifiableInvoiceTable
                    companyAndPassword={companyAndPassword}
                    empInfo={empInfo}
                    currentPeriodData={currentPeriod}
                    // checkInvoiceCount={invoiceCount}
                    history={history}
                  />
                </TabPane>
                <TabPane
                  tab={intl.get(`${modelCode}.statisticalConfirm`).d('申请统计及确签')}
                  key="statisticalConfirm"
                >
                  <ApplicationStatisticsConfirmationTable
                    companyAndPassword={companyAndPassword}
                    empInfo={empInfo}
                    currentPeriodData={currentPeriod}
                    history={history}
                  />
                </TabPane>
                <TabPane
                  tab={intl.get(`${modelCode}.tabPane.batchInvoice`).d('批量勾选发票')}
                  key="batchInvoice"
                >
                  <BatchCheckVerifiableInvoicesTable
                    companyAndPassword={companyAndPassword}
                    empInfo={empInfo}
                    currentPeriodData={currentPeriod}
                    history={history}
                  />
                </TabPane>
                {['ZK_IN_CHANNEL_DIGITAL', 'ZK_IN_CHANNEL'].includes(empInfo.inChannelCode) && (
                  <TabPane
                    tab={intl.get(`${modelCode}.tabPane.noDeductCheck`).d('不抵扣勾选')}
                    key="noDeductCheck"
                  >
                    <NotDeductCheck
                      companyAndPassword={companyAndPassword}
                      empInfo={empInfo}
                      currentPeriodData={currentPeriod}
                      history={history}
                    />
                  </TabPane>
                )}
              </Tabs>
            </CategoryProvider>
          </Content>
        </Col>
      </Row>
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
      const checkCertificationListDS = new DataSet({
        autoQuery: false,
        ...CheckCertificationListDS(),
      });
      const companyAndPassword = new DataSet({
        autoQuery: false,
        ...CompanyAndPasswordDS(),
      });
      return {
        checkCertificationListDS,
        companyAndPassword,
      };
    },
    { cacheState: true }
  )(CheckCertifiList)
);
