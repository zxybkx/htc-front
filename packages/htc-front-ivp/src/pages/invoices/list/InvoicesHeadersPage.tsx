/**
 * @Description:发票池-头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2021-10-28 15:22:10
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { Content, Header } from 'components/Page';
import {
  Button,
  Currency,
  DataSet,
  DatePicker,
  Dropdown,
  Form,
  Icon,
  Lov,
  Menu,
  Modal,
  Select,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { Col, Row, Tag } from 'choerodon-ui';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import queryString from 'query-string';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@htccommon/config/commonConfig';
import {
  getCurrentEmployeeInfo,
  getTenantAgreementCompany,
} from '@htccommon/services/commonService';
import {
  invoiceCheck,
  invoiceCheckExist,
  invoiceCheckState,
  invoiceUpdateState,
  poolAdd,
} from '@src/services/invoicesService';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@htccommon/utils/utils';
import InvoicesHeadersDS from '../stores/InvoicesHeadersDS';
import InvoiceHistory from '../../invoice-history/detail/InvoiceHistoryPage';

const modelCode = 'hivp.invoices';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IVP_API || '';
const permissionPath = `${getPresentMenu().name}.ps`;
const sourceCode = 'INVOICE_POOL';
const { Item: MenuItem } = Menu;

interface InvoicesHeadersPageProps {
  dispatch: Dispatch<any>;
  invoices: any;
  headerDS: DataSet;
}

@formatterCollections({
  code: [
    modelCode,
    'hivp.bill',
    'hivp.invoicesLayoutPush',
    'htc.common',
    'hcan.invoiceDetail',
    'hivc.select',
    'hivp.batchCheck',
    'hiop.invoiceWorkbench',
    'hivp.checkCertification',
    'hiop.invoiceReq',
    'hivp.invoicesArchiveUpload',
  ],
})
@withProps(
  () => {
    const headerDS = new DataSet({
      autoQuery: false,
      ...InvoicesHeadersDS(),
    });
    return { headerDS };
  },
  { cacheState: true }
)
export default class InvoicesHeadersPage extends Component<InvoicesHeadersPageProps> {
  state = {
    queryMoreDisplay: false,
    curCompanyId: undefined,
    inChannelCode: '',
    spinProps: {},
  };

  @Bind()
  commonFn(params) {
    getTenantAgreementCompany(params).then(resCom => {
      if (resCom) {
        this.setState({ inChannelCode: resCom.inChannelCode });
      }
    });
  }

  async componentDidMount() {
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet && !queryDataSet.current) {
      const res = await Promise.all([
        getCurrentEmployeeInfo({ tenantId }),
        queryMapIdpValue({
          displayOptions: 'HIVP.DISPLAY_OPTIONS',
          invoiceState: 'HMDM.INVOICE_STATE',
          abnormalSign: 'HIVP.ABNORMAL_SIGN',
          accountState: 'HIVP.ACCOUNT_STATE',
          interfaceDocsState: 'HIVP.INTERFACE_DOCS_STATE',
        }),
      ]);
      const empInfo = res[0].content;
      const lovList = res[1];
      this.setQueryLovDefaultValue(queryDataSet, empInfo, lovList);
    }
    if (queryDataSet) {
      let curCompanyId = queryDataSet.current!.get('companyId');
      if (!curCompanyId) {
        const res = await getCurrentEmployeeInfo({ tenantId });
        const empInfo = res && res.content;
        if (empInfo && empInfo.length > 0) curCompanyId = empInfo[0].companyId;
      }
      this.setState({ curCompanyId });
      if (curCompanyId) {
        const params = { tenantId, companyId: curCompanyId };
        this.commonFn(params);
        this.props.headerDS.query(this.props.headerDS.currentPage || 0);
      }
    }
  }

  // 查询条默认值
  @Bind()
  setQueryLovDefaultValue(queryDataSet, empInfo, lovList) {
    if (empInfo && empInfo.length > 0) {
      const { companyCode, employeeNum, employeeName, mobile, email } = empInfo[0];
      const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
      queryDataSet.getField('companyObj')!.set('defaultValue', empInfo[0]);
      queryDataSet.getField('employeeDesc')!.set('defaultValue', employeeDesc);
      queryDataSet.getField('email')!.set('defaultValue', email);
    }
    if (lovList) {
      queryDataSet.getField('displayOptions')!.set(
        'defaultValue',
        lovList.displayOptions.map(is => is.value)
      );
      queryDataSet.getField('invoiceStateStr')!.set(
        'defaultValue',
        lovList.invoiceState.map(is => is.value)
      );
    }
    queryDataSet.reset();
    queryDataSet.create({}, 0);
  }

  @Bind()
  handleCompanychange(value) {
    if (value && value.companyId) {
      const params = { tenantId, companyId: value.companyId };
      this.commonFn(params);
    }
    this.setState({ curCompanyId: value && value.companyId });
  }

  // 自定义查询
  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, dataSet, buttons } = props;
    const { queryMoreDisplay } = this.state;
    if (queryDataSet) {
      const queryMoreArray: JSX.Element[] = [];
      queryMoreArray.push(<Lov key="ticketCollectorObj" name="ticketCollectorObj" colSpan={2} />);
      queryMoreArray.push(<Select key="entryPoolSource" name="entryPoolSource" colSpan={2} />);
      queryMoreArray.push(
        <Lov key="authenticationDateObj" name="authenticationDateObj" colSpan={2} />
      );
      queryMoreArray.push(<Select key="checkStates" name="checkStates" colSpan={2} />);
      queryMoreArray.push(
        <Select key="authenticationState" name="authenticationState" colSpan={2} />
      );
      queryMoreArray.push(
        <Select key="authenticationType" name="authenticationType" colSpan={2} />
      );
      queryMoreArray.push(
        <Select key="taxBureauManageState" name="taxBureauManageState" colSpan={2} />
      );
      queryMoreArray.push(<Select key="entryAccountState" name="entryAccountState" colSpan={2} />);
      queryMoreArray.push(<Select key="recordState" name="recordState" colSpan={2} />);
      queryMoreArray.push(<TextField key="invoiceCode" name="invoiceCode" colSpan={2} />);
      queryMoreArray.push(<TextField key="invoiceNo" name="invoiceNo" colSpan={2} />);
      queryMoreArray.push(<Currency key="invoiceAmount" name="invoiceAmount" colSpan={2} />);
      queryMoreArray.push(<TextField key="buyerName" name="buyerName" colSpan={2} />);
      queryMoreArray.push(<TextField key="salerName" name="salerName" colSpan={2} />);
      queryMoreArray.push(<Select key="receiptsState" name="receiptsState" colSpan={2} />);
      queryMoreArray.push(<Lov key="systemCodeObj" name="systemCodeObj" colSpan={2} />);
      queryMoreArray.push(<Lov key="documentTypeCodeObj" name="documentTypeCodeObj" colSpan={2} />);
      queryMoreArray.push(<Lov key="documentNumberObj" name="documentNumberObj" colSpan={2} />);
      queryMoreArray.push(<Select key="abnormalSign" name="abnormalSign" colSpan={2} />);

      return (
        <div style={{ marginBottom: '0.1rem' }}>
          <Row>
            <Col span={20}>
              <Form columns={6} dataSet={queryDataSet} labelTooltip={Tooltip.overflow}>
                <Lov
                  name="companyObj"
                  colSpan={2}
                  onChange={value => this.handleCompanychange(value)}
                  clearButton={false}
                />
                <TextField name="employeeDesc" colSpan={2} />
                <Select
                  name="invoiceType"
                  colSpan={2}
                  renderer={({ value, text }) => value && `${value} - ${text}`}
                />
                <DatePicker name="invoiceDate" colSpan={2} />
                <DatePicker name="ticketCollectorDate" colSpan={2} />
                <DatePicker name="entryAccountDate" colSpan={2} />
                <DatePicker name="entryPoolDatetime" colSpan={2} />
                <DatePicker name="warehousingDate" colSpan={2} />
                <DatePicker name="checkDate" colSpan={2} />
                <Select key="displayOptions" name="displayOptions" colSpan={2} />
                <Select key="invoiceStateStr" name="invoiceStateStr" colSpan={4} />
                {queryMoreDisplay && queryMoreArray}
              </Form>
            </Col>
            <Col span={4} style={{ textAlign: 'end' }}>
              <Button
                funcType={FuncType.link}
                onClick={() => this.setState({ queryMoreDisplay: !queryMoreDisplay })}
              >
                {queryMoreDisplay ? (
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
                {intl.get('hzero.common.button.common.reset').d('重置')}
              </Button>
              <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Col>
          </Row>
          {buttons}
        </div>
      );
    }
    return <></>;
  }

  @Bind()
  async handleCreate(record, modal) {
    const validate = await this.props.headerDS.validate(false, false);
    if (validate) {
      this.handleComplete(record);
      modal.close();
    }
  }

  @Bind()
  handleCancel(record, modal) {
    this.props.headerDS.remove(record);
    modal.close();
  }

  /**
   * 新增发票
   * @returns
   */
  @Bind()
  handleAddIvc() {
    const record = this.props.headerDS.create({}, 0);
    const modal = Modal.open({
      title: intl.get('hzero.common.button.add').d('新增发票'),
      children: (
        <Form record={record}>
          <TextField name="invoiceCode" />
          <TextField name="invoiceNo" />
          <DatePicker name="invoiceDate" />
          <TextField name="checkCode" />
          <Currency name="invoiceAmount" />
        </Form>
      ),
      footer: (
        <div>
          <Button onClick={() => this.handleCancel(record, modal)}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
          <Button color={ButtonColor.primary} onClick={() => this.handleCreate(record, modal)}>
            {intl.get(`hivp.bill.button.completed`).d('查验补全')}
          </Button>
        </div>
      ),
    });
  }

  // 跳转通用参数
  @Bind()
  goToByQueryParams(comParams) {
    const { dispatch } = this.props;
    const { queryDataSet } = this.props.headerDS;
    const { inChannelCode } = this.state;
    if (queryDataSet) {
      const curQueryInfo = queryDataSet.current!.toData();
      dispatch(
        routerRedux.push({
          pathname: comParams.pathname,
          search: queryString.stringify({
            invoiceInfo: encodeURIComponent(
              JSON.stringify({
                companyDesc: `${curQueryInfo.companyCode}-${curQueryInfo.companyName}`,
                companyCode: curQueryInfo.companyCode,
                companyName: curQueryInfo.companyName,
                companyId: curQueryInfo.companyId,
                employeeDesc: curQueryInfo.employeeDesc,
                email: curQueryInfo.email,
                employeeId: curQueryInfo.employeeId,
                employeeNumber: curQueryInfo.employeeNum,
                inChannelCode,
                ...comParams.otherSearch,
              })
            ),
          }),
        })
      );
    }
  }

  /**
   * 获取底账
   * @returns
   */
  @Bind()
  handleGotoOriginalAccount() {
    const { inChannelCode } = this.state;
    if (!inChannelCode) {
      notification.info({
        message: intl.get(`${modelCode}.view.validInChannelCode`).d('请检查所属公司进项通道类型值'),
        description: '',
      });
      return;
    }
    const comParams = {
      pathname: '/htc-front-ivp/invoices/original-account',
    };
    this.goToByQueryParams(comParams);
  }

  /**
   * 版式推送
   * @returns
   */
  @Bind()
  handleGotoLayoutPush() {
    const selectedHeaderList = this.props.headerDS.selected.map(record => record.toData());
    const selectedRowKeys = selectedHeaderList.map(record => record.invoicePoolHeaderId);
    const invoicePoolHeaderIds = selectedRowKeys.join(',');
    if (!invoicePoolHeaderIds) return;
    const comParams = {
      pathname: '/htc-front-ivp/invoices/layout-push',
      otherSearch: {
        invoicePoolHeaderIds,
      },
    };
    this.goToByQueryParams(comParams);
  }

  /**
   * 档案归档
   * @returns
   */
  @Bind()
  handleGotoFileArchive() {
    const selectedHeaderList = this.props.headerDS.selected.map(record => record.toData());
    const selectedRowKeys = selectedHeaderList.map(record => record.invoicePoolHeaderId);
    const sourceHeaderIds = selectedRowKeys.join(',');
    if (!sourceHeaderIds) return;
    const comParams = {
      pathname: `/htc-front-ivp/invoices/file-archive/${sourceCode}`,
      otherSearch: {
        sourceHeaderIds,
        backPath: '/htc-front-ivp/invoices/list',
      },
    };
    this.goToByQueryParams(comParams);
  }

  /**
   * 档案下载
   * @returns
   */
  @Bind()
  handleGotoFileDownload() {
    const comParams = {
      pathname: `/htc-front-ivp/invoices/file-download/${sourceCode}`,
      otherSearch: { backPath: '/htc-front-ivp/invoices/list' },
    };
    this.goToByQueryParams(comParams);
  }

  /**
   * 检查状态
   * @returns
   */
  @Bind()
  async handleCheckState() {
    const selectedHeaderList = this.props.headerDS.selected.map(record => record.toData());
    const selectedRowKeys = selectedHeaderList.map(record => record.invoicePoolHeaderId);
    const params = {
      tenantId,
      invoicePoolHeaderIds: selectedRowKeys.join(','),
    };
    const res = await invoiceCheckState(params);
    if (res && res.status === 'H1016') {
      notification.success({
        description: '',
        message: res.message,
      });
      this.props.headerDS.query();
    } else {
      notification.error({
        description: '',
        message: res.message,
      });
    }
  }

  @Bind()
  handleDeleteHeaders() {
    const headersList = this.props.headerDS.selected;

    const checkdFlag = headersList.some(hl => {
      const rec = hl.toData();
      return (
        rec.invoicePoolHeaderId && !(rec.inOutType === 'IN' && rec.buyerName !== rec.companyName)
      );
    });
    const relatedFlag = headersList.some(hl => {
      const rec = hl.toData();
      return (
        rec.invoicePoolHeaderId &&
        !(rec.inOutType === 'IN' && rec.receiptsState !== '1' && rec.entryAccountState !== '1')
      );
    });
    if (checkdFlag) {
      notification.warning({
        description: '',
        message: intl.get(`${modelCode}.view.checkdFlag`).d('不允许删除本公司的进销项发票'),
      });
      return;
    }
    if (relatedFlag) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.checkdFlag1`)
          .d('当前发票已入账或已关联单据，不允许删除'),
      });
      return;
    }
    this.props.headerDS.delete(headersList);
  }

  // 保存
  @Bind()
  handleSaveIvc() {
    const unCheckedFlag = this.props.headerDS.some(
      hh => hh.get('invoiceType') === undefined || hh.get('invoiceType') === null
    );
    if (unCheckedFlag) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.checkdFlag2`)
          .d('存在未查验的发票，请查验补全或删除后再进行保存'),
      });
      return;
    }
    this.props.headerDS.submit();
  }

  // 查验补全
  @Bind()
  async handleComplete(record) {
    const { queryDataSet } = this.props.headerDS;
    const curInfo = queryDataSet && queryDataSet.current?.toData();
    if (!curInfo.companyId) {
      return;
    }

    this.setState({
      spinProps: { spinning: true, indicator: <span className="custom-spin-dot" /> },
    });
    const { invoiceCode, invoiceNo, invoicePoolHeaderId } = record.toData();
    const {
      companyId,
      companyCode,
      companyName,
      employeeId,
      employeeNum,
      taxpayerNumber,
    } = curInfo;

    const resExist = await invoiceCheckExist({
      tenantId,
      companyCode,
      invoiceCode,
      invoiceNum: invoiceNo,
    });
    if (
      (resExist.status === 'H1013' && !invoicePoolHeaderId) ||
      (resExist.status === 'H1001' && invoicePoolHeaderId)
    ) {
      this.setState({ spinProps: { spinning: false } });
      notification.error({
        description: '',
        message: resExist.message,
      });
      return;
    }
    const data = record.toData();
    const { checkCode, ...otherData } = data;
    const params = {
      tenantId,
      companyId,
      companyCode,
      companyName,
      employeeId,
      employeeNum,
      taxpayerNumber,
      list: {
        ...otherData,
        checkNumber: checkCode && checkCode.substr(checkCode.length - 6),
        invoiceNumber: invoiceNo,
      },
    };
    const res = await poolAdd(params);
    this.setState({ spinProps: { spinning: false } });
    if (res && res.status === 'H1014') {
      const { fileSize, failTotalSize, successSize, existsSet } = res.data;

      const message = intl.get(`${modelCode}.notice.checkResult`, {
        fileSize,
        successSize,
        failTotalSize,
        existsSetRe: existsSet.join(','),
      });
      notification.success({
        description: message,
        message: '',
        duration: 5,
      });
      this.props.headerDS.query();
    } else {
      notification.error({
        description: '',
        message: res.message,
      });
    }
  }

  // 查看发票明细
  @Bind()
  handleGotoDetailPage(record) {
    let invoiceHeaderId;
    const invoiceType = record.get('invoiceType');
    const entryPoolSource = record.get('entryPoolSource');
    const companyCode = record.get('companyCode');
    if (entryPoolSource === 'EXTERNAL_IMPORT') {
      invoiceHeaderId = record.get('invoicePoolHeaderId');
    } else {
      invoiceHeaderId = record.get('invoiceHeaderId');
    }
    const { dispatch } = this.props;
    localStorage.setItem(
      'currentInvoicerecord',
      JSON.stringify({
        ...record.toData(),
        billPoolHeaderId: null,
      })
    ); // 添加跳转record缓存
    const pathname = `/htc-front-ivp/invoices/detail/${invoiceHeaderId}/${invoiceType}/${entryPoolSource}/${companyCode}`;
    dispatch(
      routerRedux.push({
        pathname,
      })
    );
  }

  // 状态更新
  @Bind()
  async handleUpdateState(record) {
    this.setState({
      spinProps: { spinning: true, indicator: <span className="custom-spin-dot" /> },
    });
    const params = { tenantId, invoicePoolHeaderId: record.get('invoicePoolHeaderId') };
    const res = await invoiceUpdateState(params);
    this.setState({ spinProps: { spinning: false } });
    if (res && res.status === 'H1016') {
      notification.success({
        description: '',
        message: res.message,
      });
      this.props.headerDS.query();
    } else {
      notification.error({
        description: '',
        message: res.message,
      });
    }
  }

  // 查看行明细
  @Bind()
  handleGotoViewLines(record) {
    const invoicePoolHeaderId = record.get('invoicePoolHeaderId');
    if (!invoicePoolHeaderId) return;
    const { dispatch } = this.props;
    const pathname = `/htc-front-ivp/invoices/lines/${invoicePoolHeaderId}`;
    dispatch(
      routerRedux.push({
        pathname,
      })
    );
  }

  // 通过头跳转
  @Bind()
  goToByHeaderParams(record, comParams) {
    const { dispatch } = this.props;
    const headerData = record.toData();
    dispatch(
      routerRedux.push({
        pathname: comParams.pathname,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              companyId: headerData.companyId,
              ...comParams.otherSearch,
            })
          ),
        }),
      })
    );
  }

  /**
   * 单据关联
   * @returns
   */
  @Bind()
  handleGotoDocRelated(record) {
    const invoicePoolHeaderId = record.get('invoicePoolHeaderId');
    if (!invoicePoolHeaderId) return;
    const comParams = {
      pathname: `/htc-front-ivp/invoices/doc-related/${sourceCode}/${invoicePoolHeaderId}`,
      otherSearch: { backPath: '/htc-front-ivp/invoices/list' },
    };
    this.goToByHeaderParams(record, comParams);
  }

  /**
   * 历史记录
   * @returns
   */
  @Bind()
  async handleGotoHistory(record) {
    const invoicePoolHeaderId = record.get('invoicePoolHeaderId');
    const historyProps = {
      sourceCode,
      sourceHeaderId: invoicePoolHeaderId,
      record: record.toData(),
    };
    const modal = Modal.open({
      title: intl.get(`hzero.common.status.history`).d('历史记录'),
      drawer: true,
      width: 480,
      bodyStyle: { overflow: 'hidden' },
      closable: true,
      children: <InvoiceHistory {...historyProps} />,
      footer: (
        <Button color={ButtonColor.primary} onClick={() => modal.close()}>
          {intl.get(`hzero.common.button.closeOther`).d('关闭')}
        </Button>
      ),
    });
  }

  /**
   * 档案上传
   * @returns
   */
  @Bind()
  handleGotoArchiveUpload(record) {
    const invoicePoolHeaderId = record.get('invoicePoolHeaderId');
    if (!invoicePoolHeaderId) return;
    const comParams = {
      pathname: `/htc-front-ivp/invoices/archive-upload/${sourceCode}/${invoicePoolHeaderId}`,
      otherSearch: { backPath: '/htc-front-ivp/invoices/list' },
    };
    this.goToByHeaderParams(record, comParams);
  }

  // 查看档案
  @Bind()
  handleGotoArchiveView(record) {
    const invoicePoolHeaderId = record.get('invoicePoolHeaderId');
    if (!invoicePoolHeaderId) return;
    const { dispatch } = this.props;
    const pathname = `/htc-front-ivp/invoices/archive-view/${sourceCode}/${invoicePoolHeaderId}`;
    dispatch(
      routerRedux.push({
        pathname,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              backPath: '/htc-front-ivp/invoices/list',
            })
          ),
        }),
      })
    );
  }

  /**
   * 导出条件
   */
  @Bind()
  handleGetQueryParams() {
    const queryParams = this.props.headerDS.queryDataSet!.map(data => data.toData(true)) || {};
    return { ...queryParams[0] } || {};
  }

  // 渲染列脚
  @Bind()
  renderColumnFooter(dataSet, name) {
    let total;
    dataSet.map(record => {
      const _total = Number(total) || 0;
      const _amount = Number(record.get(name)) || 0;
      total = ((_total * 100 + _amount * 100) / 100).toFixed(2);
      return total;
    });
    total =
      total &&
      total.toString().replace(/\d+/, n => {
        return n.replace(/(\d)(?=(\d{3})+$)/g, i => {
          return `${i},`;
        });
      });
    return `${intl.get('hivp.invoices.view.total').d('合计')}：${total || 0}`;
  }

  get columns(): ColumnProps[] {
    return [
      {
        name: 'invoiceType',
        width: 230,
        renderer: ({ text, record }) => {
          const invoiceState = record?.get('invoiceState');
          const invoiceStateTxt = record?.getField('invoiceState')?.getText(invoiceState);
          let color = '';
          let textColor = '';
          switch (invoiceState) {
            case '0':
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            case '1':
              color = '#FFECC4';
              textColor = '#FF9D23';
              break;
            case '2':
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            case '3':
            case '4':
              color = '#FFDFCA';
              textColor = '#FB6D3B';
              break;
            case '5':
            case '6':
              color = '#FFDCD4';
              textColor = '#FF5F57';
              break;
            default:
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {invoiceStateTxt}
              </Tag>
              &nbsp;
              <a onClick={() => this.handleGotoDetailPage(record)}>{text}</a>
            </>
          );
        },
      },
      { name: 'invoiceCode', editor: record => !record.get('invoicePoolHeaderId'), width: 150 },
      { name: 'invoiceNo', editor: record => !record.get('invoicePoolHeaderId'), width: 150 },
      { name: 'invoiceDate', editor: record => !record.get('invoicePoolHeaderId'), width: 150 },
      {
        name: 'invoiceAmount',
        editor: record => !record.get('invoicePoolHeaderId'),
        width: 150,
        align: ColumnAlign.right,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'taxAmount',
        width: 150,
        align: ColumnAlign.right,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'totalAmount',
        width: 150,
        align: ColumnAlign.right,
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      { name: 'validTaxAmount', width: 150, align: ColumnAlign.right },
      { name: 'checkCode', editor: record => !record.get('invoicePoolHeaderId'), width: 180 },
      {
        name: 'annotation',
        editor: () => <TextField onBlur={() => this.props.headerDS.submit()} />,
        width: 200,
      },
      { name: 'salerName', width: 260 },
      { name: 'salerTaxNo', width: 180 },
      { name: 'buyerName', width: 260 },
      { name: 'buyerTaxNo', width: 180 },
      { name: 'authenticationDate', width: 100 },
      { name: 'checkState' },
      { name: 'checkDate', width: 110 },
      { name: 'authenticationState' },
      { name: 'authenticationType' },
      { name: 'originalEntryDate', width: 150 },
      { name: 'remark', width: 200 },
      {
        name: 'ticketCollectorObj',
        editor: true,
        width: 280,
      },
      {
        name: 'internationalTelCode',
        editor: record =>
          record.get('employeeTypeCode') === 'PRESET' && (
            <Select onChange={() => this.props.headerDS.submit()} />
          ),
        width: 130,
      },
      {
        name: 'employeeIdentify',
        editor: record =>
          record.get('employeeTypeCode') === 'PRESET' && (
            <TextField onBlur={() => this.props.headerDS.submit()} />
          ),
        width: 130,
      },
      { name: 'ticketCollectorDate', width: 110 },
      { name: 'recordType', width: 120 },
      { name: 'recordState' },
      { name: 'receiptsState' },
      { name: 'entryAccountState' },
      { name: 'entryAccountDate', width: 120 },
      { name: 'entryPoolDatetime', width: 160 },
      { name: 'taxBureauManageState', width: 120 },
      {
        name: 'abnormalSign',
        editor: <TextField onBlur={() => this.props.headerDS.submit()} />,
        width: 240,
      },
      { name: 'inOutType' },
      { name: 'invoicePoolHeaderId', renderer: ({ value }) => <span>{value}</span> },
      {
        name: 'fileUrl',
        width: 300,
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleGotoArchiveView(record)}>{value}</a>
        ),
      },
      { name: 'fileName', width: 220 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        command: ({ record }): Commands[] => {
          return [
            <a onClick={() => this.handleGotoHistory(record)}>
              {intl.get(`hzero.common.status.history`).d('历史记录')}
            </a>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  // 批量上传
  @Bind()
  batchUpload() {
    const { curCompanyId } = this.state;
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-ivp/invoices/batch-upload/${sourceCode}/${curCompanyId}`,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              backPath: '/htc-front-ivp/invoices/list',
            })
          ),
        }),
      })
    );
  }

  // 查验补全
  @Bind()
  async handleBatchComplete() {
    const { queryDataSet } = this.props.headerDS;
    const selectedList = this.props.headerDS.selected.map(record => record.toData());
    if (queryDataSet) {
      const curQueryInfo = queryDataSet.current!.toData();
      const _selectedList = selectedList.map(record => {
        const { checkCode, invoiceNo, ...otherData } = record;
        return {
          checkNumber: checkCode && checkCode.substr(checkCode.length - 6),
          invoiceNumber: invoiceNo,
          ...otherData,
        };
      });
      const params = {
        tenantId,
        companyCode: curQueryInfo.companyCode,
        companyName: curQueryInfo.companyName,
        companyId: curQueryInfo.companyId,
        employeeId: curQueryInfo.employeeId,
        employeeNum: curQueryInfo.employeeNum,
        taxpayerNumber: curQueryInfo.taxpayerNumber,
        list: _selectedList,
      };
      const res = await invoiceCheck(params);
      if (res && res.status === 'H1014') {
        const { fileSize, failTotalSize, successSize, existsSet } = res.data;
        const message = intl.get(`${modelCode}.notice.checkResult`, {
          fileSize,
          successSize,
          failTotalSize,
          existsSetRe: existsSet.join(','),
        });
        notification.success({
          description: message,
          message: '',
          duration: 5,
        });
        this.props.headerDS.query();
      } else {
        notification.error({
          description: '',
          message: res.message,
        });
      }
    }
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const { curCompanyId } = this.state;
    const HeaderButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      const { condition } = props;
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={condition === 'batchDelete' ? FuncType.flat : FuncType.link}
          permissionList={[
            {
              code: `${permissionPath}.button.${props.permissionCode}`,
              type: 'button',
              meaning: `${props.permissionMeaning}`,
            },
          ]}
        >
          {props.title}
        </PermissionButton>
      );
    });
    const topBtns = [
      <HeaderButtons
        key="completed"
        onClick={() => this.handleBatchComplete()}
        dataSet={this.props.headerDS}
        title={intl.get(`hivp.bill.button.completed`).d('查验补全')}
        permissionCode="completed"
        permissionMeaning="按钮-查验补全"
      />,
      <HeaderButtons
        key="checkState"
        onClick={() => this.handleCheckState()}
        dataSet={this.props.headerDS}
        title={intl.get(`${modelCode}.button.checkState`).d('检查状态')}
        permissionCode="check-state"
        permissionMeaning="按钮-检查状态"
      />,
      <PermissionButton
        type="c7n-pro"
        key="getOriginalAcc"
        onClick={() => this.handleGotoOriginalAccount()}
        disabled={!curCompanyId}
        funcType={FuncType.link}
        permissionList={[
          {
            code: `${permissionPath}.button.get-original-acc`,
            type: 'button',
            meaning: '按钮-获取底账',
          },
        ]}
      >
        {intl.get(`${modelCode}.button.getOriginalAcc`).d('获取底账')}
      </PermissionButton>,
      <PermissionButton
        type="c7n-pro"
        key="fileDownload"
        onClick={() => this.handleGotoFileDownload()}
        disabled={!curCompanyId}
        funcType={FuncType.link}
        permissionList={[
          {
            code: `${permissionPath}.button.file-download`,
            type: 'button',
            meaning: '按钮-档案下载',
          },
        ]}
      >
        {intl.get(`hivp.bill.button.fileDownload`).d('档案下载')}
      </PermissionButton>,
      <HeaderButtons
        key="filed"
        onClick={() => this.handleGotoFileArchive()}
        dataSet={this.props.headerDS}
        title={intl.get(`hivp.bill.button.archives`).d('档案归档')}
        permissionCode="filed"
        permissionMeaning="按钮-档案归档"
      />,
      <HeaderButtons
        key="layoutPush"
        onClick={() => this.handleGotoLayoutPush()}
        dataSet={this.props.headerDS}
        title={intl.get(`hivp.invoicesLayoutPush.view.title`).d('版式推送')}
        permissionCode="layout-push"
        permissionMeaning="按钮-版式推送"
      />,
    ];
    const btnMenu = (
      <Menu>
        {topBtns.map(action => {
          return <MenuItem>{action}</MenuItem>;
        })}
      </Menu>
    );
    return [
      <PermissionButton
        type="c7n-pro"
        key="addIvc"
        onClick={() => this.handleAddIvc()}
        disabled={!curCompanyId}
        icon="add"
        permissionList={[
          {
            code: `${permissionPath}.button.add-invoice`,
            type: 'button',
            meaning: '按钮-发票新增',
          },
        ]}
      >
        {intl.get(`hzero.common.button.add`).d('新增')}
      </PermissionButton>,
      <PermissionButton
        type="c7n-pro"
        key="archiveUpload"
        onClick={() => this.batchUpload()}
        color={ButtonColor.default}
        disabled={!curCompanyId}
        permissionList={[
          {
            code: `${permissionPath}.button.archive-upload`,
            type: 'button',
            meaning: '按钮-批量上传档案',
          },
        ]}
      >
        {intl.get(`hivp.bill.button.bulkArchiveUpload`).d('批量上传档案')}
      </PermissionButton>,
      <Dropdown overlay={btnMenu}>
        <Button>
          {intl.get(`${modelCode}.more.op`).d('更多操作')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
      <HeaderButtons
        key="deleteHeaders"
        onClick={() => this.handleDeleteHeaders()}
        dataSet={this.props.headerDS}
        title={intl.get(`hzero.common.button.delete`).d('删除')}
        permissionCode="delete"
        permissionMeaning="按钮-删除"
        condition="batchDelete"
      />,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.view.title`).d('发票池')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoice-pool-main/export-invoice`}
            queryParams={() => this.handleGetQueryParams()}
          />
        </Header>
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.props.headerDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            spin={this.state.spinProps}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
