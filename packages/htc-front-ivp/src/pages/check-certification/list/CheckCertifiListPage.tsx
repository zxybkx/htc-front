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
  // Spin,
  Table,
  // Tabs,
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
// import CheckVerifiableInvoiceTable from './CheckVerifiableInvoiceTable';
import styles from '../checkcertification.less';

// const { TabPane } = Tabs;

const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();

interface CheckCertificationPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
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
  { cacheState: true },
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
    authorityCode: undefined,
    // spinning: true,
    // activeKey: 'certifiableInvoice',
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

  // 根据所属公司获取数据
  @Bind()
  async getDataFromCompany(companyObj, type) {
    const { queryDataSet } = this.props.checkCertificationListDS;
    const { companyId } = companyObj;
    const apiCondition = process.env.EMPLOYEE_API;
    let inChannelCode: string;
    if (apiCondition === 'OP') {
      inChannelCode = 'UNAISINO_IN_CHANNEL';
    } else {
      const resCop = await getTenantAgreementCompany({ companyId, tenantId });
      ({ inChannelCode } = resCop);
    }
    const { competentTaxAuthorities } = await getTaxAuthorityCode({ tenantId, companyId });
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
      const checkInvoiceCountRes = await checkInvoiceCount({ tenantId });
      queryDataSet.current!.set({ companyObj, authorityCode: competentTaxAuthorities });
      this.props.companyAndPassword.current!.set({
        inChannelCode,
        authorityCode: competentTaxAuthorities,
        checkInvoiceCount: checkInvoiceCountRes,
      });
      // queryDataSet.current!.set({ authorityCode: competentTaxAuthorities });
    }
    if (inChannelCode === 'AISINO_IN_CHANNEL') {
      this.props.companyAndPassword.current!.set({ taxDiskPassword: '88888888' });
    } else {
      this.getTaskPassword(companyObj, this.props.companyAndPassword);
    }
    this.props.checkCertificationListDS.setQueryParameter('companyId', companyId);
    this.props.checkCertificationListDS.query();
  }

  async componentDidMount() {
    const { checkCertificationListDS } = this.props;
    const { queryDataSet } = checkCertificationListDS;
    const res = await getCurrentEmployeeInfo({ tenantId });
    const query = location.search;
    const type = new URLSearchParams(query).get('type');
    switch (type) {
      case '2':
        // this.setState({ activeKey: 'statisticalConfirm' });
        break;
      case '3':
        // this.setState({ activeKey: 'batchInvoice' });
        break;
      default:
        break;
    }
    if (queryDataSet) {
      const curCompanyId = queryDataSet.current!.get('companyId');
      if (res && res.content && res.content[0] && !curCompanyId) {
        this.getDataFromCompany(res.content[0], 0);
      }
      if (curCompanyId) {
        const curInfo = await getCurrentEmployeeInfo({ tenantId, companyId: curCompanyId });
        // const { competentTaxAuthorities } = await getTaxAuthorityCode({
        //   tenantId,
        //   companyId: curCompanyId,
        // });
        if (curInfo && curInfo.content) {
          const empInfo = curInfo.content[0];
          this.setState({ empInfo });
        }
      }
    }
  }

  // 获取主管机构代码
  @Bind()
  async getEmpInfoAndAuthorityCode(empInfo) {
    const { competentTaxAuthorities } = await getTaxAuthorityCode({
      tenantId,
      companyId: empInfo.companyId,
    });
    this.setState({ authorityCode: competentTaxAuthorities });
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
    const { checkCertificationListDS, companyAndPassword } = this.props;
    // const { queryDataSet: statisticalDs } = this.props.statisticalConfirmDS;
    // const { queryDataSet: batchInvoiceHeaderDS } = this.props.batchInvoiceHeaderDS;
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
      }),
    );
    if (res) {
      const {
        currentPeriod,
        currentOperationalDeadline,
        checkableTimeRange,
        currentCertState,
      } = res;
      // 所属期数据存在技术DS中
      checkCertificationListDS.current!.set({
        currentPeriod,
        currentCertState,
        currentOperationalDeadline,
        checkableTimeRange,
      });
      companyAndPassword.current!.set({
        currentPeriod,
        currentCertState,
        currentOperationalDeadline,
        checkableTimeRange,
      });
    }
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
    console.log('validate', validate);
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
      onClick: () => this.companyChange(record.toData(), 2),
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
    // this.setState({ activeKey: newActiveKey });
    if (queryDataSet) {
      if (['batchInvoice', 'certifiableInvoice'].includes(newActiveKey)) {
        const res = await checkInvoiceCount({ tenantId });
        if (res === 0 && newActiveKey === 'batchInvoice') {
          const checkInvoiceButton = document.getElementById('checkInvoice');
          if (checkInvoiceButton) {
            checkInvoiceButton.click();
          }
        }
        queryDataSet.current!.set({ checkInvoiceCount: res });
      }
    }
  }

  render() {
    const { empInfo, authorityCode } = this.state;
    console.log(authorityCode);
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
            </Content>
          </Col>
        </Row>
      </>
    );
  }
}
