/**
 * @Description:票据池-头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-12 15:34:30
 * @LastEditTime: 2021-12-09 11:34:24
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
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
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import queryString from 'query-string';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@htccommon/utils/utils';
import { invoiceCheckComplete, invoiceCheckExist } from '@src/services/invoicesService';
import BillsHeadersDS from '../stores/BillsHeadersDS';
import InvoiceHistory from '../../invoice-history/detail/InvoiceHistoryPage';
import billPoolConfig from '../../../config/billPoolConfig';

const modelCode = 'hivp.bill';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IVP_API || '';
const permissionPath = `${getPresentMenu().name}.ps`;
const sourceCode = 'BILL_POOL';
const { Item: MenuItem } = Menu;

interface BillsHeadersPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  headerDS: DataSet;
}

@formatterCollections({
  code: [modelCode, 'hivp.invoicesArchiveUpload', 'htc.common', 'hivp.batchCheck'],
})
@withProps(
  () => {
    const headerDS = new DataSet({
      autoQuery: false,
      ...BillsHeadersDS(),
    });
    return { headerDS };
  },
  { cacheState: true }
)
export default class BillsHeadersPage extends Component<BillsHeadersPageProps> {
  state = {
    queryMoreDisplay: false,
    curCompanyId: undefined,
    spinProps: {},
  };

  async componentDidMount() {
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet && !queryDataSet.current) {
      const res = await Promise.all([
        getCurrentEmployeeInfo({ tenantId }),
        queryMapIdpValue({
          invoiceState: 'HMDM.INVOICE_STATE',
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
      if (this.props.headerDS.length > 0) {
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
      queryDataSet.getField('invoiceStates')!.set(
        'defaultValue',
        lovList.invoiceState.map(is => is.value)
      );
      queryDataSet.getField('entryAccountStates')!.set(
        'defaultValue',
        lovList.accountState.map(is => is.value)
      );
      queryDataSet.getField('receiptsStates')!.set(
        'defaultValue',
        lovList.interfaceDocsState.map(is => is.value)
      );
    }
    queryDataSet.reset();
    queryDataSet.create({}, 0);
  }

  @Bind()
  handleCompanyChange(value) {
    this.setState({ curCompanyId: value && value.companyId });
  }

  // 自定义查询
  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, dataSet, buttons } = props;
    const { queryMoreDisplay } = this.state;
    if (queryDataSet) {
      const queryMoreArray: JSX.Element[] = [];
      queryMoreArray.push(<Select key="recordState" name="recordState" colSpan={2} />);
      queryMoreArray.push(<Select key="entryPoolSource" name="entryPoolSource" colSpan={2} />);
      queryMoreArray.push(<Lov key="ticketCollectorObj" name="ticketCollectorObj" colSpan={2} />);
      queryMoreArray.push(<TextField key="invoiceCode" name="invoiceCode" colSpan={2} />);
      queryMoreArray.push(<TextField key="invoiceNo" name="invoiceNo" colSpan={2} />);
      queryMoreArray.push(<Currency key="amount" name="amount" colSpan={2} />);
      queryMoreArray.push(<TextField key="salerName" name="salerName" colSpan={2} />);
      queryMoreArray.push(<TextField key="buyerName" name="buyerName" colSpan={2} />);

      return (
        <div style={{ marginBottom: '0.1rem' }}>
          <Row>
            <Col span={20}>
              <Form columns={6} dataSet={queryDataSet} labelTooltip={Tooltip.overflow}>
                <Lov
                  name="companyObj"
                  colSpan={2}
                  onChange={value => this.handleCompanyChange(value)}
                />
                <TextField name="employeeDesc" colSpan={2} />
                <Select
                  name="billType"
                  colSpan={2}
                  renderer={({ value, text }) => value && `${value} - ${text}`}
                />
                <DatePicker name="invoiceDate" colSpan={2} />
                <DatePicker name="ticketCollectorDate" colSpan={2} />
                <DatePicker name="entryAccountDate" colSpan={2} />
                <DatePicker name="entryPoolDatetime" colSpan={2} />
                <Select key="entryAccountStates" name="entryAccountStates" colSpan={2} />
                <Select key="receiptsStates" name="receiptsStates" colSpan={2} />
                <Select key="invoiceStates" name="invoiceStates" colSpan={6} />
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
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                color={ButtonColor.primary}
                onClick={() => {
                  dataSet.query();
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
    return <></>;
  }

  @Bind()
  async handleCreate(modal) {
    const validate = await this.props.headerDS.validate(false, false);
    if (validate) {
      const res = await this.props.headerDS.submit();
      if (res && res.content) {
        modal.close();
      }
    }
  }

  @Bind()
  handleCancel(record, modal) {
    this.props.headerDS.remove(record);
    modal.close();
  }

  @Bind()
  async saveAndCreate(modal) {
    const validate = await this.props.headerDS.validate(false, false);
    if (validate) {
      const res = await this.props.headerDS.submit();
      if (res && res.content) {
        modal.close();
        this.handleAddBill();
      }
    }
  }

  @Bind()
  handleBillTypeChange(modal, record) {
    const billType = record.get('billType');
    const billTypeData = record.getField('billType').getLookupData(billType);
    const billTypeTag = billTypeData.tag;
    const billTagArray = billTypeTag.split(',');
    const fieldArray: JSX.Element[] = [
      <Select name="billType" onChange={() => this.handleBillTypeChange(modal, record)} />,
    ];
    billTagArray.forEach(item => {
      billPoolConfig.forEach(field => {
        if (item === field.name) {
          switch (field.type) {
            case 'string':
              fieldArray.push(<TextField name={field.name} />);
              break;
            case 'date':
              fieldArray.push(<DatePicker name={field.name} />);
              break;
            case 'currency':
              fieldArray.push(<Currency name={field.name} />);
              break;
            default:
              break;
          }
        }
      });
    });
    modal.update({
      children: (
        <Form record={record} labelTooltip={Tooltip.overflow}>
          {fieldArray}
        </Form>
      ),
    });
  }

  /**
   * 新增票据
   * @returns
   */
  @Bind()
  handleAddBill() {
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet) {
      const curInfo = queryDataSet.current!.toData();
      const newLine = {
        companyId: curInfo.companyId,
        companyCode: curInfo.companyCode,
        companyName: curInfo.companyName,
        taxpayerNumber: curInfo.taxpayerNumber,
        employeeId: curInfo.employeeId,
        employeeNum: curInfo.employeeNum,
      };
      const record = this.props.headerDS.create(newLine, 0);
      const modal = Modal.open({
        title: '新增票据',
        children: (
          <Form record={record} labelTooltip={Tooltip.overflow}>
            <Select name="billType" onChange={() => this.handleBillTypeChange(modal, record)} />
            <TextField name="invoiceCode" />
            <TextField name="invoiceNo" />
            <DatePicker name="invoiceDate" />
            <Currency name="totalAmount" />
            <Currency name="invoiceAmount" />
            <Currency name="taxAmount" />
          </Form>
        ),
        footer: (
          <div>
            <Button color={ButtonColor.primary} onClick={() => this.handleCreate(modal)}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button onClick={() => this.handleCancel(record, modal)}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button onClick={() => this.saveAndCreate(modal)}>
              {intl.get(`${modelCode}.button.saveAndadd`).d('保存并新增')}
            </Button>
          </div>
        ),
      });
    }
  }

  // 跳转通用参数
  @Bind()
  goToByQueryParams(comParams) {
    const { dispatch } = this.props;
    const { queryDataSet } = this.props.headerDS;
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
                // inChannelCode,
                ...comParams.otherSearch,
              })
            ),
          }),
        })
      );
    }
  }

  /**
   * 档案归档
   * @returns
   */
  @Bind()
  handleGotoBillArchive() {
    const selectedHeaderList = this.props.headerDS.selected.map(record => record.toData());
    const selectedRowKeys = selectedHeaderList.map(record => record.billPoolHeaderId);
    const sourceHeaderIds = selectedRowKeys.join(',');
    if (!sourceHeaderIds) return;
    const comParams = {
      pathname: `/htc-front-ivp/bills/bill-archive/${sourceCode}`,
      otherSearch: {
        sourceHeaderIds,
        backPath: '/htc-front-ivp/bills/list',
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
      pathname: `/htc-front-ivp/bills/file-download/${sourceCode}`,
      otherSearch: { backPath: '/htc-front-ivp/bills/list' },
    };
    this.goToByQueryParams(comParams);
  }

  @Bind()
  handleDeleteHeaders() {
    const headersList = this.props.headerDS.selected;
    const checkedFlag = headersList.some(hl => {
      const { entryAccountState, receiptsState, recordState } = hl.toData();
      return (
        (entryAccountState && entryAccountState !== '0') ||
        (receiptsState && receiptsState !== '0') ||
        (recordState && recordState !== 'NON_ARCHIVED')
      );
    });
    if (checkedFlag) {
      notification.warning({
        description: '',
        message: intl.get(`${modelCode}.view.checkdFlag`).d('当前存在已处理票据，无法删除'),
      });
      return;
    }
    this.props.headerDS.delete(headersList);
  }

  // 保存
  @Bind()
  handleSaveBill() {
    const unCheckedFlag = this.props.headerDS.some(
      hh =>
        (hh.get('invoiceType') === undefined || hh.get('invoiceType') === null) &&
        hh.get('billType') === 'BLOCK_CHAIN'
    );
    if (unCheckedFlag) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.notice.checkSaveMessage`)
          .d('存在未查验的票据，请查验补全或删除后再进行保存'),
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
    const {
      invoiceCode,
      invoiceNo,
      invoiceDate,
      checkCode,
      invoiceAmount,
      buyerTaxNo,
      billPoolHeaderId,
    } = record.toData();
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
      (resExist.status === 'H1013' && !billPoolHeaderId) ||
      (resExist.status === 'H1001' && billPoolHeaderId)
    ) {
      this.setState({ spinProps: { spinning: false } });
      notification.error({
        description: '',
        message: resExist.message,
      });
      return;
    }
    const params = {
      tenantId,
      companyId,
      companyCode,
      companyName,
      employeeId,
      employeeNum,
      taxpayerNumber,
      invoiceCode,
      invoiceAmount,
      invoiceDate: moment(invoiceDate).format('YYYYMMDD'),
      invoiceNumber: invoiceNo,
      taxpayerIdentificationNumber: buyerTaxNo,
      checkNumber: checkCode && checkCode.substr(checkCode.length - 6),
    };
    const res = await invoiceCheckComplete(params);
    this.setState({ spinProps: { spinning: false } });
    if (res && res.status === 'H1014') {
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

  // 查看票据明细
  @Bind()
  handleGotoDetailPage(record) {
    const billPoolHeaderId = record.get('billPoolHeaderId');
    const billType = record.get('billType');
    const { history } = this.props;
    const pathname = `/htc-front-ivp/bills/detail/${billPoolHeaderId}/${billType}`;
    localStorage.setItem('currentBillrecord', JSON.stringify(record.toData())); // 添加跳转record缓存
    history.push(pathname);
  }

  // 查看行明细
  @Bind()
  handleGotoViewLines(record) {
    const billPoolHeaderId = record.get('billPoolHeaderId');
    if (!billPoolHeaderId) return;
    const { dispatch } = this.props;
    const pathname = `/htc-front-ivp/bills/lines/${billPoolHeaderId}`;
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
    const billPoolHeaderId = record.get('billPoolHeaderId');
    if (!billPoolHeaderId) return;
    const comParams = {
      pathname: `/htc-front-ivp/invoice/doc-related/${sourceCode}/${billPoolHeaderId}`,
      otherSearch: { backPath: '/htc-front-ivp/bills/list' },
    };
    this.goToByHeaderParams(record, comParams);
  }

  /**
   * 历史记录
   * @returns
   */
  @Bind()
  handleGotoHistory(record) {
    const billPoolHeaderId = record.get('billPoolHeaderId');
    if (!billPoolHeaderId) return;
    const historyProps = {
      sourceCode,
      sourceHeaderId: billPoolHeaderId,
      record: record.toData(),
    };
    const modal = Modal.open({
      title: intl.get('hzero.common.status.history').d('历史记录'),
      drawer: true,
      width: 480,
      bodyStyle: { overflow: 'hidden' },
      closable: true,
      children: <InvoiceHistory {...historyProps} />,
      footer: (
        <Button color={ButtonColor.primary} onClick={() => modal.close()}>
          {intl.get('hzero.common.button.close').d('关闭')}
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
    const billPoolHeaderId = record.get('billPoolHeaderId');
    if (!billPoolHeaderId) return;
    const comParams = {
      pathname: `/htc-front-ivp/bills/archive-upload/${sourceCode}/${billPoolHeaderId}`,
      otherSearch: { backPath: '/htc-front-ivp/bills/list' },
    };
    this.goToByHeaderParams(record, comParams);
  }

  // 查看档案
  @Bind()
  handleGotoArchiveView(record) {
    const billPoolHeaderId = record.get('billPoolHeaderId');
    if (!billPoolHeaderId) return;
    const { dispatch } = this.props;
    const pathname = `/htc-front-ivp/bills/archive-view/${sourceCode}/${billPoolHeaderId}`;
    dispatch(
      routerRedux.push({
        pathname,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              backPath: '/htc-front-ivp/bills/list',
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

  @Bind()
  optionsRender(record) {
    const renderPermissionButton = params => (
      <PermissionButton
        type="c7n-pro"
        funcType={FuncType.flat}
        onClick={params.onClick}
        color={ButtonColor.primary}
        disabled={params.disabled || false}
        permissionList={[
          {
            code: `${permissionPath}.button.${params.permissionCode}`,
            type: 'button',
            meaning: `${params.permissionMeaning}`,
          },
        ]}
      >
        {params.title}
      </PermissionButton>
    );
    const operators = [
      {
        key: 'completed',
        ele: renderPermissionButton({
          onClick: () => this.handleComplete(record),
          disabled: record.get('billType') !== 'BLOCK_CHAIN',
          permissionCode: 'completed',
          permissionMeaning: intl.get(`${modelCode}.button.completed`).d('查验补全'),
          title: intl.get(`${modelCode}.button.completed`).d('查验补全'),
        }),
        len: 6,
        title: intl.get(`${modelCode}.button.completed`).d('查验补全'),
      },
      {
        key: 'viewDetail',
        ele: renderPermissionButton({
          onClick: () => this.handleGotoDetailPage(record),
          disabled: !record.get('billPoolHeaderId'),
          permissionCode: 'view-detail',
          permissionMeaning: intl.get('hzero.common.button.detail'),
          title: intl.get('hzero.common.button.detail').d('查看详情'),
        }),
        len: 6,
        title: intl.get('hzero.common.button.detail').d('查看详情'),
      },
      {
        key: 'relateDoc',
        ele: renderPermissionButton({
          onClick: () => this.handleGotoDocRelated(record),
          disabled: !record.get('billPoolHeaderId'),
          permissionCode: 'relate-doc',
          permissionMeaning: intl.get(`${modelCode}.button.relateDoc`),
          title: intl.get(`${modelCode}.button.relateDoc`).d('单据关联'),
        }),
        len: 6,
        title: intl.get(`${modelCode}.button.relateDoc`).d('单据关联'),
      },
      {
        key: 'history',
        ele: renderPermissionButton({
          onClick: () => this.handleGotoHistory(record),
          disabled: !record.get('billPoolHeaderId'),
          permissionCode: 'history',
          permissionMeaning: intl.get('hzero.common.button.history'),
          title: intl.get('hzero.common.button.history').d('历史记录'),
        }),
        len: 6,
        title: intl.get('hzero.common.button.history').d('历史记录'),
      },
      {
        key: 'archiveUpload',
        ele: renderPermissionButton({
          onClick: () => this.handleGotoArchiveUpload(record),
          disabled: !record.get('billPoolHeaderId'),
          permissionCode: 'archive-upload',
          permissionMeaning: intl.get(`${modelCode}.button.archiveUpload`),
          title: intl.get(`${modelCode}.button.archiveUpload`).d('上传档案'),
        }),
        len: 6,
        title: intl.get(`${modelCode}.button.archiveUpload`).d('上传档案'),
      },
      // {
      //   key: 'archiveView',
      //   ele: renderPermissionButton({
      //     onClick: () => this.handleGotoArchiveView(record),
      //     disabled: !record.get('billPoolHeaderId'),
      //     permissionCode: 'archive-view',
      //     permissionMeaning: '按钮-查看档案',
      //     title: intl.get(`${modelCode}.button.archiveView`).d('查看档案'),
      //   }),
      //   len: 6,
      //   title: intl.get(`${modelCode}.button.archiveView`).d('查看档案'),
      // },
    ];
    const archiveViewBtn = {
      key: 'archiveView',
      ele: renderPermissionButton({
        onClick: () => this.handleGotoArchiveView(record),
        disabled: !record.get('billPoolHeaderId'),
        permissionCode: 'archive-view',
        permissionMeaning: intl.get('hivp.invoicesArchiveUpload.path.viewArchives'),
        title: intl.get('hivp.invoicesArchiveUpload.path.viewArchives').d('查看档案'),
      }),
      len: 6,
      title: intl.get('hivp.invoicesArchiveUpload.path.viewArchives').d('查看档案'),
    };
    if (record.get('fileUrl')) {
      operators.push(archiveViewBtn);
    }
    const btnMenu = (
      <Menu>
        {operators.map(action => {
          const { key } = action;
          return <Menu.Item key={key}>{action.ele}</Menu.Item>;
        })}
      </Menu>
    );
    return (
      <span className="action-link">
        {renderPermissionButton({
          onClick: () => this.handleGotoViewLines(record),
          disabled: !(record.get('billPoolHeaderId') && record.get('billType') === 'BLOCK_CHAIN'),
          permissionCode: 'view-lines',
          permissionMeaning: '按钮-行查看',
          title: intl.get(`${modelCode}.button.viewLines`).d('行查看'),
        })}
        <Dropdown overlay={btnMenu}>
          <a>
            {intl.get('hzero.common.table.column.option').d('操作')}
            <Icon type="arrow_drop_down" />
          </a>
        </Dropdown>
      </span>
    );
  }

  get columns(): ColumnProps[] {
    return [
      {
        name: 'billType',
        width: 200,
        renderer: ({ text, record }) => (
          <a onClick={() => this.handleGotoDetailPage(record)}>{text}</a>
        ),
      },
      {
        name: 'invoiceCode',
        width: 180,
        renderer: ({ value, record }) => {
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
              <span>{value}</span>
            </>
          );
        },
      },
      { name: 'invoiceNo', width: 150 },
      { name: 'invoiceDate', width: 150 },
      {
        name: 'totalAmount',
        width: 150,
      },
      {
        name: 'invoiceAmount',
        width: 150,
      },
      {
        name: 'taxAmount',
        width: 150,
      },
      { name: 'fare' },
      {
        name: 'aviationDevelopmentFund',
        width: 150,
      },
      { name: 'fuelSurcharge' },
      { name: 'otherTaxes' },
      { name: 'total' },
      { name: 'checkCode', width: 180 },
      { name: 'salerName', width: 260 },
      { name: 'salerTaxNo', width: 180 },
      { name: 'buyerName', width: 260 },
      { name: 'buyerTaxNo', width: 180 },
      { name: 'entrance', width: 130 },
      { name: 'destination', width: 130 },
      { name: 'trainAndFlight', width: 130 },
      { name: 'seatType', width: 130 },
      {
        name: 'boardingTime',
        width: 160,
        renderer: ({ value, text }) => value && text !== '无效日期' && text,
      },
      {
        name: 'alightingTime',
        width: 160,
        renderer: ({ value, text }) => value && text !== '无效日期' && text,
      },
      {
        name: 'remark',
        width: 200,
        editor: () => <TextField onBlur={() => this.props.headerDS.submit()} />,
      },
      { name: 'ticketCollectorObj', editor: true, width: 280 },
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
      { name: 'entryPoolSource', width: 120 },
      { name: 'entryPoolDatetime', width: 160 },
      { name: 'taxBureauManageState', width: 120 },
      { name: 'billPoolHeaderId', renderer: ({ value }) => <span>{value}</span> },
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
        header: intl.get('hzero.common.table.column.option').d('操作'),
        width: 100,
        command: ({ record }): Commands[] => {
          return [
            <a onClick={() => this.handleGotoHistory(record)}>
              {intl.get('hzero.common.button.history').d('历史记录')}
            </a>,
          ];
        },
        // renderer: ({ record }) => this.optionsRender(record),
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
        pathname: `/htc-front-ivp/bills/batch-upload/${sourceCode}/${curCompanyId}`,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              backPath: '/htc-front-ivp/bills/list',
            })
          ),
        }),
      })
    );
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
        key="filed"
        onClick={() => this.handleGotoBillArchive()}
        dataSet={this.props.headerDS}
        title={intl.get(`${modelCode}.button.archives`).d('档案归档')}
        permissionCode="filed"
        permissionMeaning={intl.get(`${modelCode}.button.archives`).d('档案归档')}
      />,
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
        {intl.get(`${modelCode}.button.fileDownload`).d('档案下载')}
      </PermissionButton>,
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
        key="addBill"
        onClick={() => this.handleAddBill()}
        disabled={!curCompanyId}
        icon="add"
        permissionList={[
          {
            code: `${permissionPath}.button.add-bill`,
            type: 'button',
            meaning: intl.get('hzero.common.button.add'),
          },
        ]}
      >
        {intl.get('hzero.common.button.add').d('新增')}
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
            meaning: intl.get(`${modelCode}.button.bulkArchiveUpload`).d('批量上传档案'),
          },
        ]}
      >
        {intl.get(`${modelCode}.button.bulkArchiveUpload`).d('批量上传档案')}
      </PermissionButton>,
      <Dropdown overlay={btnMenu}>
        <Button>
          {intl.get('hzero.common.view.archives').d('档案')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
      <HeaderButtons
        key="deleteHeaders"
        onClick={() => this.handleDeleteHeaders()}
        dataSet={this.props.headerDS}
        title={intl.get('hzero.common.button.delete').d('删除')}
        permissionCode="delete"
        permissionMeaning={intl.get('hzero.common.button.delete').d('删除')}
        condition="batchDelete"
      />,
      // <PermissionButton
      //   type="c7n-pro"
      //   key="save"
      //   onClick={() => this.handleSaveBill()}
      //   permissionList={[
      //     {
      //       code: `${permissionPath}.button.save`,
      //       type: 'button',
      //       meaning: '按钮-保存',
      //     },
      //   ]}
      // >
      //   {intl.get(`${modelCode}.button.save`).d('保存')}
      // </PermissionButton>,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title.ticketPool`).d('票据池')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/bill-pool-header-infos/export`}
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
