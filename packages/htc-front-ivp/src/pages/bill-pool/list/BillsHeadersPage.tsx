/*
 * @Description:票据池-头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-12 15:34:30
 * @LastEditTime: 2021-03-19 11:34:24
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import { Header, Content } from 'components/Page';
import {
  DataSet,
  Table,
  Button,
  Form,
  Lov,
  Output,
  DatePicker,
  Select,
  TextField,
  Currency,
  Menu,
  Dropdown,
  Icon,
} from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import querystring from 'querystring';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { isNullOrUndefined } from 'util';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@common/config/commonConfig';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@common/utils/utils';
import { invoiceCheckExist, invoiceCheckComplete } from '@src/services/invoicesService';
import BillsHeadersDS from '../stores/BillsHeadersDS';

const modelCode = 'hivp.bills';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IVP_API || '';
const permissionPath = `${getPresentMenu().name}.ps`;
const sourceCode = 'BILL_POOL';

interface BillsHeadersPageProps {
  dispatch: Dispatch<any>;
  headerDS: DataSet;
}

@formatterCollections({
  code: [modelCode],
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
    // const { dispatch } = this.props;
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet && !queryDataSet.current) {
      const res = await Promise.all([
        getCurrentEmployeeInfo({ tenantId }),
        queryMapIdpValue({
          // displayOptions: 'HIVP.DISPLAY_OPTIONS',
          invoiceState: 'HMDM.INVOICE_STATE',
          // abnormalSign: 'HIVP.ABNORMAL_SIGN',
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
        lovList.invoiceState.map((is) => is.value)
      );
      queryDataSet.getField('entryAccountStates')!.set(
        'defaultValue',
        lovList.accountState.map((is) => is.value)
      );
      queryDataSet.getField('receiptsStates')!.set(
        'defaultValue',
        lovList.interfaceDocsState.map((is) => is.value)
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
      queryMoreArray.push(<Select key="recordState" name="recordState" colSpan={1} />);
      queryMoreArray.push(<Select key="entryPoolSource" name="entryPoolSource" colSpan={1} />);
      queryMoreArray.push(<Lov key="ticketCollectorObj" name="ticketCollectorObj" colSpan={2} />);
      queryMoreArray.push(<TextField key="invoiceCode" name="invoiceCode" />);
      queryMoreArray.push(<TextField key="invoiceNo" name="invoiceNo" />);
      queryMoreArray.push(<Currency key="amount" name="amount" />);
      queryMoreArray.push(<TextField key="salerName" name="salerName" colSpan={2} newLine />);
      queryMoreArray.push(<TextField key="buyerName" name="buyerName" colSpan={2} />);

      return (
        <>
          <Form columns={6} dataSet={queryDataSet}>
            <Lov
              name="companyObj"
              colSpan={2}
              onChange={(value) => this.handleCompanyChange(value)}
            />
            <Output name="employeeDesc" colSpan={2} />
            <Select
              name="billType"
              colSpan={2}
              renderer={({ value, text }) => value && `${value} - ${text}`}
            />
            <DatePicker name="invoiceDateFrom" />
            <DatePicker name="invoiceDateTo" />
            <DatePicker name="ticketCollectorDateFrom" />
            <DatePicker name="ticketCollectorDateTo" />
            <DatePicker name="entryPoolDatetimeFrom" />
            <DatePicker name="entryPoolDatetimeTo" />
            <DatePicker name="entryAccountDateFrom" />
            <DatePicker name="entryAccountDateTo" />
            <Select key="invoiceStates" name="invoiceStates" colSpan={4} />
            queryMoreArray.push(
            <Select key="entryAccountStates" name="entryAccountStates" colSpan={2} />
            ); queryMoreArray.push(
            <Select key="receiptsStates" name="receiptsStates" colSpan={2} />
            );
            {queryMoreDisplay && queryMoreArray}
          </Form>
          <Row type="flex" justify="space-between">
            <Col span={18}>{buttons}</Col>
            <Col span={6} style={{ textAlign: 'end', marginBottom: '2px' }}>
              <Button onClick={() => this.setState({ queryMoreDisplay: !queryMoreDisplay })}>
                {queryMoreDisplay
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                onClick={() => {
                  queryDataSet.reset();
                  queryDataSet.create();
                }}
              >
                {intl.get('hzero.c7nProUI.Table.reset_button').d('重置')}
              </Button>
              <Button
                color={ButtonColor.primary}
                onClick={() => {
                  dataSet.query();
                }}
              >
                {intl.get('hzero.c7nProUI.Table.query_button').d('查询')}
              </Button>
            </Col>
          </Row>
        </>
      );
    }
    return <></>;
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
      this.props.headerDS.create(newLine, 0);
    }
    // this.props.headerDS.create({}, 0);
  }

  // 跳转通用参数
  @Bind()
  goToByQueryParams(comParams) {
    const { dispatch } = this.props;
    const { queryDataSet } = this.props.headerDS;
    // const { inChannelCode } = this.state;
    if (queryDataSet) {
      const curQueryInfo = queryDataSet.current!.toData();
      dispatch(
        routerRedux.push({
          pathname: comParams.pathname,
          search: querystring.stringify({
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
    const selectedHeaderList = this.props.headerDS.selected.map((record) => record.toData());
    const selectedRowKeys = selectedHeaderList.map((record) => record.billPoolHeaderId);
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
    const checkedFlag = headersList.some((hl) => {
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
      (hh) => isNullOrUndefined(hh.get('invoiceType')) && hh.get('billType') === 'BLOCK_CHAIN'
    );
    if (unCheckedFlag) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.checkdFlag`)
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
    const { dispatch } = this.props;
    const pathname = `/htc-front-ivp/bills/detail/${billPoolHeaderId}`;
    dispatch(
      routerRedux.push({
        pathname,
      })
    );
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
        search: querystring.stringify({
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
      pathname: `/htc-front-ivp/bills/doc-related/${sourceCode}/${billPoolHeaderId}`,
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
    const comParams = {
      pathname: `/htc-front-ivp/bills/bill-history/${sourceCode}/${billPoolHeaderId}`,
      otherSearch: { backPath: '/htc-front-ivp/bills/list' },
    };
    this.goToByHeaderParams(record, comParams);
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
        search: querystring.stringify({
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
    const queryParams = this.props.headerDS.queryDataSet!.map((data) => data.toData(true)) || {};
    const exportParams = { ...queryParams[0] } || {};
    return exportParams;
  }

  @Bind()
  optionsRender(record) {
    const renderPermissionButton = (params) => (
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
          permissionMeaning: '按钮-查验补全',
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
          permissionMeaning: '按钮-查看详情',
          title: intl.get(`${modelCode}.button.viewDetail`).d('查看详情'),
        }),
        len: 6,
        title: intl.get(`${modelCode}.button.viewDetail`).d('查看详情'),
      },
      {
        key: 'relateDoc',
        ele: renderPermissionButton({
          onClick: () => this.handleGotoDocRelated(record),
          disabled: !record.get('billPoolHeaderId'),
          permissionCode: 'relate-doc',
          permissionMeaning: '按钮-单据关联',
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
          permissionMeaning: '按钮-历史记录',
          title: intl.get(`${modelCode}.button.history`).d('历史记录'),
        }),
        len: 6,
        title: intl.get(`${modelCode}.button.history`).d('历史记录'),
      },
      {
        key: 'archiveUpload',
        ele: renderPermissionButton({
          onClick: () => this.handleGotoArchiveUpload(record),
          disabled: !record.get('billPoolHeaderId'),
          permissionCode: 'archive-upload',
          permissionMeaning: '按钮-上传档案',
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
        permissionMeaning: '按钮-查看档案',
        title: intl.get(`${modelCode}.button.archiveView`).d('查看档案'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.archiveView`).d('查看档案'),
    };
    if (record.get('fileUrl')) {
      operators.push(archiveViewBtn);
    }
    const btnMenu = (
      <Menu>
        {operators.map((action) => {
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
            {intl.get('hzero.common.button.action').d('操作')}
            <Icon type="arrow_drop_down" />
          </a>
        </Dropdown>
      </span>
    );
  }

  get columns(): ColumnProps[] {
    const editAble = (record) =>
      !record.get('recordType') &&
      !(
        record.get('recordState') === 'ARCHIVED' ||
        record.get('receiptsState') === '1' ||
        record.get('entryAccountState') === '1'
      );
    return [
      { name: 'billType', editor: (record) => editAble(record), width: 200 },
      { name: 'invoiceState', width: 110 },
      { name: 'invoiceCode', editor: (record) => editAble(record), width: 180 },
      { name: 'invoiceNo', editor: (record) => editAble(record), width: 150 },
      { name: 'invoiceDate', editor: (record) => editAble(record), width: 150 },
      {
        name: 'totalAmount',
        width: 150,
        editor: (record) => editAble(record),
        align: ColumnAlign.right,
      },
      {
        name: 'invoiceAmount',
        editor: (record) => editAble(record),
        width: 150,
        align: ColumnAlign.right,
      },
      {
        name: 'taxAmount',
        width: 150,
        editor: (record) => editAble(record),
        align: ColumnAlign.right,
      },
      {
        name: 'aviationDevelopmentFund',
        editor: (record) => editAble(record),
        width: 150,
        align: ColumnAlign.right,
      },
      { name: 'invoiceTotalAmount', width: 150, align: ColumnAlign.right },
      { name: 'checkCode', editor: (record) => editAble(record), width: 180 },
      { name: 'salerName', width: 260, editor: (record) => editAble(record) },
      { name: 'salerTaxNo', width: 180, editor: (record) => editAble(record) },
      { name: 'buyerName', width: 260, editor: (record) => editAble(record) },
      { name: 'buyerTaxNo', width: 180, editor: (record) => editAble(record) },
      { name: 'entrance', width: 130, editor: (record) => editAble(record) },
      { name: 'destination', width: 130, editor: (record) => editAble(record) },
      { name: 'trainAndFlight', width: 130, editor: (record) => editAble(record) },
      { name: 'seatType', width: 130, editor: (record) => editAble(record) },
      {
        name: 'boardingTime',
        width: 160,
        editor: (record) => editAble(record),
        renderer: ({ value, text }) => value && text !== '无效日期' && text,
      },
      {
        name: 'alightingTime',
        width: 160,
        editor: (record) => editAble(record),
        renderer: ({ value, text }) => value && text !== '无效日期' && text,
      },
      { name: 'remark', width: 200, editor: true },
      { name: 'ticketCollectorObj', editor: true, width: 280 },
      {
        name: 'internationalTelCode',
        editor: (record) => record.get('employeeTypeCode') === 'PRESET',
        width: 130,
      },
      {
        name: 'employeeIdentify',
        editor: (record) => record.get('employeeTypeCode') === 'PRESET',
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
      { name: 'fileUrl', width: 300 },
      { name: 'fileName', width: 220 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 160,
        renderer: ({ record }) => this.optionsRender(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const { curCompanyId } = this.state;
    const HeaderButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
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
    return [
      <PermissionButton
        type="c7n-pro"
        key="addBill"
        onClick={() => this.handleAddBill()}
        disabled={!curCompanyId}
        permissionList={[
          {
            code: `${permissionPath}.button.add-bill`,
            type: 'button',
            meaning: '按钮-票据新增',
          },
        ]}
      >
        {intl.get(`${modelCode}.button.addBill`).d('票据新增')}
      </PermissionButton>,
      <HeaderButtons
        key="filed"
        onClick={() => this.handleGotoBillArchive()}
        dataSet={this.props.headerDS}
        title={intl.get(`${modelCode}.button.filed`).d('档案归档')}
        permissionCode="filed"
        permissionMeaning="按钮-档案归档"
      />,
      <PermissionButton
        type="c7n-pro"
        key="fileDownload"
        onClick={() => this.handleGotoFileDownload()}
        disabled={!curCompanyId}
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
      <HeaderButtons
        key="deleteHeaders"
        onClick={() => this.handleDeleteHeaders()}
        dataSet={this.props.headerDS}
        title={intl.get(`${modelCode}.button.deleteHeaders`).d('删除')}
        permissionCode="delete"
        permissionMeaning="按钮-删除"
      />,
      <PermissionButton
        type="c7n-pro"
        key="save"
        onClick={() => this.handleSaveBill()}
        permissionList={[
          {
            code: `${permissionPath}.button.save`,
            type: 'button',
            meaning: '按钮-保存',
          },
        ]}
      >
        {intl.get(`${modelCode}.button.save`).d('保存')}
      </PermissionButton>,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('票据池')}>
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
