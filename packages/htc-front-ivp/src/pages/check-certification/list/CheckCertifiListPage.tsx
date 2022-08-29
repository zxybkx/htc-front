/**
 * @Description:勾选认证
 * @version: 1.0
 * @Author: shan.zhang@hand-china.com
 * @Date: 2020-09-23 14:26:15
 * @LastEditTime: 2021-02-26 15:14:28
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
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
import formatterCollections from 'utils/intl/formatterCollections';
import CheckCertificationListDS, { TaxDiskPasswordDS } from '../stores/CheckCertificationListDS';
import CompanyAndPasswordDS from '../stores/CompanyAndPasswordDS';
import CheckVerifiableInvoiceTable from './CheckVerifiableInvoiceTable';
import ApplicationStatisticsConfirmationTable from './ApplicationStatisticsConfirmationTable';
import styles from '../checkcertification.less';

const { TabPane } = Tabs;

const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();

interface CheckCertificationPageProps extends RouteComponentProps {
  location: any;
  checkCertificationListDS: DataSet;
  taxDiskPasswordDS: DataSet;
  companyAndPassword: DataSet;
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
    return {
      checkCertificationListDS,
      taxDiskPasswordDS,
      companyAndPassword,
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
export default class CheckCertifiListPage extends Component<CheckCertificationPageProps> {
  state = {
    empInfo: {} as any,
    activeKey: 'certifiableInvoice',
    currentPeriodData: {} as any,
    checkInvoiceCountRes: 0,
  };

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

  async componentDidMount() {
    const { checkCertificationListDS } = this.props;
    const { queryDataSet } = checkCertificationListDS;
    const query = location.search;
    const type = new URLSearchParams(query).get('type');
    switch (type) {
      case '2':
        this.setState({ activeKey: 'statisticalConfirm' });
        break;
      case '3':
        this.setState({ activeKey: 'batchInvoice' });
        break;
      default:
        break;
    }
    if (queryDataSet) {
      const curCompanyId = queryDataSet.current?.get('companyId');
      if (curCompanyId) {
        const curInfo = await getCurrentEmployeeInfo({ tenantId, companyId: curCompanyId });
        if (curInfo && curInfo.content) this.getEmpInfoAndAuthorityCode(curInfo.content[0]);
      } else {
        const res = await getCurrentEmployeeInfo({ tenantId });
        if (res && res.content && res.content[0]) {
          this.props.companyAndPassword.loadData(res.content);
          // 获取是否有勾选请求中的发票
          const checkInvoiceCountRes = await checkInvoiceCount({ tenantId });
          this.setState({ checkInvoiceCountRes });
          this.getEmpInfoAndAuthorityCode(res.content[0]);
        }
      }
    }
  }

  // 获取基础数据（主管架构代码、员工信息、通道编码、税盘密码）
  @Bind()
  async getEmpInfoAndAuthorityCode(curEmpInfo) {
    const { queryDataSet } = this.props.checkCertificationListDS;
    const apiCondition = process.env.EMPLOYEE_API;
    let inChannelCode: string;
    if (apiCondition === 'OP') {
      inChannelCode = 'UNAISINO_IN_CHANNEL';
    } else {
      const resCop = await getTenantAgreementCompany({ companyId: curEmpInfo.companyId, tenantId });
      ({ inChannelCode } = resCop);
    }
    this.props.companyAndPassword.current!.set({ inChannelCode });
    if (inChannelCode === 'AISINO_IN_CHANNEL') {
      this.props.companyAndPassword.current!.set({ taxDiskPassword: '88888888' });
    } else {
      this.getTaskPassword(curEmpInfo, this.props.companyAndPassword);
    }
    const { competentTaxAuthorities } = await getTaxAuthorityCode({
      tenantId,
      companyId: curEmpInfo.companyId,
    });
    if (queryDataSet) {
      queryDataSet.current!.set({ companyObj: curEmpInfo, authorityCode: competentTaxAuthorities });
    }
    this.props.checkCertificationListDS.setQueryParameter('companyId', curEmpInfo.companyId);
    this.props.checkCertificationListDS.query();
    this.setState({ empInfo: { authorityCode: competentTaxAuthorities, ...curEmpInfo } });
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
      this.props.checkCertificationListDS.query();
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
      if (type === 0) {
        this.getEmpInfoAndAuthorityCode(value);
      } else {
        const companyData = this.props.companyAndPassword.toData();
        if (companyData) {
          remove(companyData, (item: any) => item.companyId === value.companyId);
          const data = [value, ...companyData];
          this.props.companyAndPassword.loadData(data);
          this.getEmpInfoAndAuthorityCode(value);
        }
      }
    }
  }

  // 获取当前所属期
  @Bind()
  async getCurrentPeriod() {
    const { companyAndPassword } = this.props;
    const { empInfo } = this.state;
    const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
    const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
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
    if (res) this.setState({ currentPeriodData: res });
  }

  @Bind()
  showDetail() {
    const modal = ModalPro.open({
      title: intl.get('hiop.invoiceReq.title.companyInfo').d('公司信息'),
      drawer: true,
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
  async handleTabChange(newActiveKey) {
    const { queryDataSet } = this.props.checkCertificationListDS;
    this.setState({ activeKey: newActiveKey });
    if (queryDataSet) {
      if (['batchInvoice', 'certifiableInvoice'].includes(newActiveKey)) {
        const res = await checkInvoiceCount({ tenantId });
        // if (res === 0 && newActiveKey === 'batchInvoice') {
        //   const checkInvoiceButton = document.getElementById('checkInvoice');
        //   if (checkInvoiceButton) {
        //     checkInvoiceButton.click();
        //   }
        // }
        queryDataSet.current!.set({ checkInvoiceCountRes: res });
      }
    }
  }

  render() {
    const { history } = this.props;
    const { empInfo, activeKey, currentPeriodData, checkInvoiceCountRes } = this.state;
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
                style={{ marginLeft: '-20px' }}
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
                  onChange={value => this.companyChange(value, 1)}
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
                  <CheckVerifiableInvoiceTable
                    companyAndPassword={this.props.companyAndPassword}
                    empInfo={empInfo}
                    currentPeriodData={currentPeriodData}
                    checkInvoiceCount={checkInvoiceCountRes}
                    history={history}
                  />
                </TabPane>
                <TabPane
                  tab={intl.get(`${modelCode}.statisticalConfirm`).d('申请统计及确签')}
                  key="statisticalConfirm"
                >
                  <ApplicationStatisticsConfirmationTable
                    companyAndPassword={this.props.companyAndPassword}
                    empInfo={empInfo}
                    currentPeriodData={currentPeriodData}
                    history={history}
                  />
                </TabPane>
                <TabPane
                  tab={intl.get(`${modelCode}.tabPane.batchInvoice`).d('批量勾选可认证发票')}
                  key="batchInvoice"
                >
                  3
                </TabPane>
              </Tabs>
            </Content>
          </Col>
        </Row>
      </>
    );
  }
}
