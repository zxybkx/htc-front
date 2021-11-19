/*
 * @Descripttion:发票池-头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2021-03-04 15:58:49
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
import { getCurrentEmployeeInfo, getTenantAgreementCompany } from '@common/services/commonService';
import {
  invoiceCheckExist,
  invoiceCheckComplete,
  invoiceCheckState,
  invoiceUpdateState,
} from '@src/services/invoicesService';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@common/utils/utils';
import InvoicesHeadersDS from '../stores/InvoicesHeadersDS';

const modelCode = 'hivp.invoices';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IVP_API || '';
const permissionPath = `${getPresentMenu().name}.ps`;
const sourceCode = 'INVOICE_POOL';

interface InvoicesHeadersPageProps {
  dispatch: Dispatch<any>;
  invoices: any;
  headerDS: DataSet;
}

@formatterCollections({
  code: [modelCode],
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

  async componentDidMount() {
    // const { dispatch } = this.props;
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
        getTenantAgreementCompany(params).then((resCom) => {
          if (resCom) {
            this.setState({ inChannelCode: resCom.inChannelCode });
          }
        });
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
        lovList.displayOptions.map((is) => is.value)
      );
      queryDataSet.getField('invoiceStateStr')!.set(
        'defaultValue',
        lovList.invoiceState.map((is) => is.value)
      );
    }
    queryDataSet.reset();
    queryDataSet.create({}, 0);
  }

  @Bind()
  handleCompanychange(value) {
    if (value && value.companyId) {
      const params = { tenantId, companyId: value.companyId };
      getTenantAgreementCompany(params).then((resCom) => {
        if (resCom) {
          this.setState({ inChannelCode: resCom.inChannelCode });
        }
      });
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
      queryMoreArray.push(<Select key="recordState" name="recordState" />);
      queryMoreArray.push(<Lov key="authenticationDateObj" name="authenticationDateObj" />);
      queryMoreArray.push(
        <Select key="authenticationState" name="authenticationState" colSpan={2} />
      );
      queryMoreArray.push(
        <Select key="authenticationType" name="authenticationType" colSpan={2} />
      );
      queryMoreArray.push(
        <Select key="taxBureauManageState" name="taxBureauManageState" colSpan={2} />
      );
      queryMoreArray.push(<Select key="abnormalSign" name="abnormalSign" colSpan={2} />);
      queryMoreArray.push(<Select key="entryAccountState" name="entryAccountState" colSpan={2} />);
      queryMoreArray.push(<Select key="receiptsState" name="receiptsState" colSpan={2} />);
      queryMoreArray.push(<Select key="checkStates" name="checkStates" colSpan={2} />);
      queryMoreArray.push(<TextField key="invoiceCode" name="invoiceCode" />);
      queryMoreArray.push(<TextField key="invoiceNo" name="invoiceNo" />);
      queryMoreArray.push(<Currency key="invoiceAmount" name="invoiceAmount" />);
      queryMoreArray.push(<TextField key="salerName" name="salerName" colSpan={2} newLine />);
      queryMoreArray.push(<TextField key="buyerName" name="buyerName" colSpan={2} />);

      return (
        <>
          <Form columns={6} dataSet={queryDataSet}>
            <Lov
              name="companyObj"
              colSpan={2}
              onChange={(value) => this.handleCompanychange(value)}
              clearButton={false}
            />
            <Output name="employeeDesc" colSpan={2} />
            <Select
              name="invoiceType"
              colSpan={2}
              renderer={({ value, text }) => value && `${value} - ${text}`}
            />
            <DatePicker name="invoiceDateFrom" />
            <DatePicker name="invoiceDateTo" />
            <DatePicker name="ticketCollectorDateFrom" />
            <DatePicker name="ticketCollectorDateTo" />
            <DatePicker name="entryAccountDateFrom" />
            <DatePicker name="entryAccountDateTo" />
            <DatePicker name="entryPoolDatetimeFrom" />
            <DatePicker name="entryPoolDatetimeTo" />
            <DatePicker name="warehousingDateFrom" />
            <DatePicker name="warehousingDateTo" />
            <DatePicker name="checkDateFrom" />
            <DatePicker name="checkDateTo" />
            <Select key="displayOptions" name="displayOptions" colSpan={3} />
            <Select key="invoiceStateStr" name="invoiceStateStr" colSpan={3} />
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
   * 新增发票
   * @returns
   */
  @Bind()
  handleAddIvc() {
    // const { queryDataSet } = this.props.headerDS;
    // if (queryDataSet) {
    //   const curInfo = queryDataSet.current!.toData();
    //   const newLine = {
    //     companyId: curInfo.companyId,
    //     companyCode: curInfo.companyCode,
    //     companyName: curInfo.companyName,
    //     taxpayerNumber: curInfo.taxpayerNumber,
    //     employeeId: curInfo.employeeId,
    //     employeeNum: curInfo.employeeNum,
    //   };
    //   this.props.headerDS.create(newLine, 0);
    // }
    this.props.headerDS.create({}, 0);
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
    const selectedHeaderList = this.props.headerDS.selected.map((record) => record.toData());
    const selectedRowKeys = selectedHeaderList.map((record) => record.invoicePoolHeaderId);
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
    const selectedHeaderList = this.props.headerDS.selected.map((record) => record.toData());
    const selectedRowKeys = selectedHeaderList.map((record) => record.invoicePoolHeaderId);
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
    const selectedHeaderList = this.props.headerDS.selected.map((record) => record.toData());
    const selectedRowKeys = selectedHeaderList.map((record) => record.invoicePoolHeaderId);
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
    // const checkdFlag = headersList.some((hl) => !isNullOrUndefined(hl.get('buyerTaxNo')));
    const checkdFlag = headersList.some((hl) => {
      const rec = hl.toData();
      return (
        rec.invoicePoolHeaderId && !(rec.inOutType === 'IN' && rec.buyerName !== rec.companyName)
      );
    });
    const relatedFlag = headersList.some((hl) => {
      const rec = hl.toData();
      return (
        rec.invoicePoolHeaderId &&
        !(rec.inOutType === 'IN' && rec.receiptsState !== '1' && rec.entryAccountState !== '1')
      );
    });
    if (checkdFlag) {
      notification.warning({
        description: '',
        message: intl.get(`${modelCode}.view.checkdFlag`).d('不允许删除购方名称为当前公司的发票'),
      });
      return;
    }
    if (relatedFlag) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.checkdFlag`)
          .d('当前发票已入账或已关联单据，不允许删除'),
      });
      return;
    }
    this.props.headerDS.delete(headersList);
  }

  // 保存
  @Bind()
  handleSaveIvc() {
    const unCheckedFlag = this.props.headerDS.some((hh) =>
      isNullOrUndefined(hh.get('invoiceType'))
    );
    if (unCheckedFlag) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.checkdFlag`)
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
    const {
      invoiceCode,
      invoiceNo,
      invoiceDate,
      checkCode,
      invoiceAmount,
      buyerTaxNo,
      invoicePoolHeaderId,
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
        search: querystring.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              // companyDesc: `${headerData.companyCode}-${headerData.companyName}`,
              companyId: headerData.companyId,
              // companyCode: headerData.companyCode,
              // employeeNum: headerData.employeeNum,
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
  handleGotoHistory(record) {
    const invoicePoolHeaderId = record.get('invoicePoolHeaderId');
    if (!invoicePoolHeaderId) return;
    const comParams = {
      pathname: `/htc-front-ivp/invoices/invoice-history/${sourceCode}/${invoicePoolHeaderId}`,
      otherSearch: { backPath: '/htc-front-ivp/invoices/list' },
    };
    this.goToByHeaderParams(record, comParams);
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
        search: querystring.stringify({
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
      // {
      //   key: 'viewLines',
      //   ele: renderPermissionButton({
      //     onClick: () => this.handleGotoViewLines(record),
      //     disabled: !record.get('invoicePoolHeaderId'),
      //     permissionCode: 'view-lines',
      //     permissionMeaning: '按钮-行查看',
      //     title: intl.get(`${modelCode}.button.viewLines`).d('行查看'),
      //   }),
      //   len: 5,
      //   title: intl.get(`${modelCode}.button.viewLines`).d('行查看'),
      // },
      {
        key: 'completed',
        // ele: (
        //   <a onClick={() => this.handleComplete(record)}>
        //     {intl.get(`${modelCode}.button.completed`).d('查验补全')}
        //   </a>
        // ),
        ele: renderPermissionButton({
          onClick: () => this.handleComplete(record),
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
          // disabled: !(record.get('invoiceHeaderId') && record.get('invoiceType') && !record.get('EXTERNAL_IMPORT')),
          disabled:
            (!record.get('invoiceHeaderId') &&
              record.get('entryPoolSource') !== 'EXTERNAL_IMPORT') ||
            (!record.get('invoiceType') && record.get('entryPoolSource') !== 'EXTERNAL_IMPORT'),
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
          disabled: !record.get('invoicePoolHeaderId'),
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
          disabled: !record.get('invoicePoolHeaderId'),
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
          disabled: !record.get('invoicePoolHeaderId'),
          permissionCode: 'archive-upload',
          permissionMeaning: '按钮-上传档案',
          title: intl.get(`${modelCode}.button.archiveUpload`).d('上传档案'),
        }),
        len: 6,
        title: intl.get(`${modelCode}.button.archiveUpload`).d('上传档案'),
      },
    ];
    const archiveViewBtn = {
      key: 'archiveView',
      ele: renderPermissionButton({
        onClick: () => this.handleGotoArchiveView(record),
        disabled: !record.get('invoicePoolHeaderId'),
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
    const updateStateBtn = {
      key: 'updateState',
      ele: renderPermissionButton({
        onClick: () => this.handleUpdateState(record),
        disabled: !record.get('invoicePoolHeaderId'),
        permissionCode: 'update-state',
        permissionMeaning: '按钮-状态更新',
        title: intl.get(`${modelCode}.button.updateState`).d('状态更新'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.updateState`).d('状态更新'),
    };
    const invoiceDate = record.get('invoiceDate');
    const beforeYearFlag = moment().subtract(1, 'years').isAfter(invoiceDate, 'day');
    if (!beforeYearFlag && record.get('invoicePoolHeaderId')) {
      operators.push(updateStateBtn);
    }
    // const newOperators = operators.filter(Boolean);
    // return operatorRender(newOperators, record, { limit: 2 });
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
          disabled: !record.get('invoicePoolHeaderId'),
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

  // 渲染列脚
  @Bind()
  renderColumnFooter(dataSet, name) {
    let total;
    dataSet.map((record) => {
      const _total = Number(total) || 0;
      const _amount = Number(record.get(name)) || 0;
      total = ((_total * 100 + _amount * 100) / 100).toFixed(2);
      return total;
    });
    total =
      total &&
      total.toString().replace(/\d+/, (n) => {
        return n.replace(/(\d)(?=(\d{3})+$)/g, (i) => {
          return `${i},`;
        });
      });
    return `合计：${total || 0}`;
  }

  get columns(): ColumnProps[] {
    return [
      { name: 'invoiceType', width: 200 },
      { name: 'invoiceState' },
      { name: 'invoiceCode', editor: (record) => !record.get('invoicePoolHeaderId'), width: 150 },
      { name: 'invoiceNo', editor: (record) => !record.get('invoicePoolHeaderId'), width: 150 },
      { name: 'invoiceDate', editor: (record) => !record.get('invoicePoolHeaderId'), width: 150 },
      {
        name: 'invoiceAmount',
        editor: (record) => !record.get('invoicePoolHeaderId'),
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
      { name: 'checkCode', editor: (record) => !record.get('invoicePoolHeaderId'), width: 180 },
      { name: 'annotation', editor: true, width: 200 },
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
      { name: 'entryPoolDatetime', width: 160 },
      { name: 'taxBureauManageState', width: 120 },
      { name: 'abnormalSign', editor: true, width: 240 },
      { name: 'inOutType' },
      { name: 'invoicePoolHeaderId', renderer: ({ value }) => <span>{value}</span> },
      { name: 'fileUrl', width: 300 },
      { name: 'fileName', width: 220 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 180,
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
      // return (
      //   <Button
      //     key={props.key}
      //     onClick={props.onClick}
      //     disabled={isDisabled}
      //     funcType={FuncType.flat}
      //     color={ButtonColor.primary}
      //   >
      //     {props.title}
      //   </Button>
      // );
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
        key="addIvc"
        onClick={() => this.handleAddIvc()}
        disabled={!curCompanyId}
        permissionList={[
          {
            code: `${permissionPath}.button.add-invoice`,
            type: 'button',
            meaning: '按钮-发票新增',
          },
        ]}
      >
        {intl.get(`${modelCode}.button.addIvc`).d('发票新增')}
      </PermissionButton>,
      <PermissionButton
        type="c7n-pro"
        key="getOriginalAcc"
        onClick={() => this.handleGotoOriginalAccount()}
        disabled={!curCompanyId}
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
      <HeaderButtons
        key="layoutPush"
        onClick={() => this.handleGotoLayoutPush()}
        dataSet={this.props.headerDS}
        title={intl.get(`${modelCode}.button.layoutPush`).d('版式推送')}
        permissionCode="layout-push"
        permissionMeaning="按钮-版式推送"
      />,
      <HeaderButtons
        key="filed"
        onClick={() => this.handleGotoFileArchive()}
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
        key="checkState"
        onClick={() => this.handleCheckState()}
        dataSet={this.props.headerDS}
        title={intl.get(`${modelCode}.button.checkState`).d('检查状态')}
        permissionCode="check-state"
        permissionMeaning="按钮-检查状态"
      />,
      <HeaderButtons
        key="deleteHeaders"
        onClick={() => this.handleDeleteHeaders()}
        dataSet={this.props.headerDS}
        title={intl.get(`${modelCode}.button.deleteHeaders`).d('删除')}
        permissionCode="delete"
        permissionMeaning="按钮-删除"
      />,
      // <Button key="save" onClick={() => this.handleSaveIvc()}>
      //   {intl.get(`${modelCode}.button.save`).d('保存')}
      // </Button>,
      <PermissionButton
        type="c7n-pro"
        key="save"
        onClick={() => this.handleSaveIvc()}
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
        <Header title={intl.get(`${modelCode}.title`).d('发票池')}>
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
            // editMode={TableEditMode.inline}
            spin={this.state.spinProps}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
