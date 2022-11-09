/**
 * @Description:批量识别查验
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-1-25 10:51:22
 * @LastEditTime: 2021-11-25 14:17:05
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { API_HOST } from 'utils/config';
import { Content, Header } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { find } from 'lodash';
import ExcelExport from 'components/ExcelExport';
import { closeTab, openTab } from 'utils/menuTab';
import queryString from 'query-string';
import commonConfig from '@htccommon/config/commonConfig';
import {
  Button,
  DataSet,
  Dropdown,
  Form,
  Icon,
  Lov,
  Menu,
  Modal,
  Select,
  Table,
  Tabs,
  TextField,
  Upload,
} from 'choerodon-ui/pro';
import { Col, Row, Tag } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import withProps from 'utils/withProps';
import uuidv4 from 'uuid/v4';
import moment from 'moment';
import { RouteComponentProps } from 'react-router-dom';
import {
  addInvoicePool,
  addMyInvoice,
  getBatchNum,
  invoiceRecheck,
} from '@src/services/batchCheckService';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { getAccessToken, getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import BatchCheckDS from '../stores/BatchCheckPageDS';
import styles from '../denitification.less';

const modelCode = 'hivp.batchCheck';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IVP_API || '';
const { Option } = Select;
const { TabPane } = Tabs;
const { Item: MenuItem } = Menu;
const acceptType = ['.pdf', '.jpg', '.png', '.ofd', '.zip', '.rar', '.7z', 'image/jpeg'];

interface BatchCheckPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  batchCheckDS: DataSet;
}
@formatterCollections({
  code: [modelCode, 'htc.common', 'hivp.invoicesArchiveUpload', 'hivp.bill'],
})
@withProps(
  () => {
    const batchCheckDS = new DataSet({
      autoQuery: false,
      ...BatchCheckDS(),
    });
    return { batchCheckDS };
  },
  { cacheState: true }
)
export default class BatchCheckPage extends Component<BatchCheckPageProps> {
  state = {
    batchNum: [],
    // loadingFlag: false,
    companyCode: '',
    employeeNum: '',
    activeKey: 'notAdd',
  };

  multipleUpload;

  multipleUploadUuid;

  // 获取批次号
  @Bind()
  async getBatchNum(params) {
    const batchNumRes = getResponse(await getBatchNum(params));
    if (batchNumRes) {
      this.setState({ batchNum: batchNumRes });
    }
  }

  async componentDidMount() {
    const { queryDataSet } = this.props.batchCheckDS;
    if (queryDataSet) {
      const { search } = this.props.location;
      const companyId = new URLSearchParams(search).get('companyId');
      const res = await getCurrentEmployeeInfo({ tenantId, companyId });
      const curCompanyId = queryDataSet.current!.get('companyId');
      if (res && res.content) {
        const empInfo = res.content[0];
        if (empInfo && !curCompanyId) {
          const { companyCode, employeeNum } = empInfo;
          queryDataSet.current!.set({ companyObj: empInfo });
          // 获取批次号
          const params = { tenantId, companyCode, employeeNum };
          this.getBatchNum(params);
          this.setState({
            companyCode: empInfo.companyCode,
            employeeNum: empInfo.employeeNum,
          });
          this.props.batchCheckDS.query();
        }
        if (curCompanyId) {
          const companyCode = queryDataSet.current!.get('companyCode');
          const employeeNum = queryDataSet.current!.get('employeeNum');
          const invoicePoolStatus = queryDataSet.current!.get('invoicePoolStatus');
          this.setState({
            companyCode,
            employeeNum,
            activeKey: invoicePoolStatus === 'N' ? 'notAdd' : 'add',
          });
          // 获取批次号
          const params = { tenantId, companyCode, employeeNum };
          this.getBatchNum(params);
        }
      }
    }
  }

  @Bind()
  async handleCompanyChange(value) {
    if (value) {
      const { companyCode, employeeNum } = value;
      const params = { tenantId, companyCode, employeeNum };
      this.setState({
        companyCode,
        employeeNum,
      });
      this.getBatchNum(params);
      this.multipleUpload.fileList = [];
      this.props.batchCheckDS.loadData([]);
      const { queryDataSet } = this.props.batchCheckDS;
      if (queryDataSet) {
        queryDataSet.current!.set({ batchCode: '' });
      }
    }
  }

  saveMultipleUpload = node => {
    this.multipleUpload = node;
  };

  handleUploadSuccess = response => {
    try {
      const multipleData = JSON.parse(response);
      const res = getResponse(multipleData);
      if (res && res.status === 'H1024') {
        const {
          batchCode,
          fileSize,
          failTotalSize,
          successSize,
          existsSize,
          failSize,
          existsSet,
        } = res.data;
        const messageText = `本次识别${fileSize}张发票，成功上传${successSize}张，失败${failTotalSize}张，其中${existsSize}张已存在,发票号码为:[${existsSet.join(
          ','
        )}],${failSize}张ocr识别失败`;
        const message = intl
          .get(`${modelCode}.notice.ocrResult`, {
            fileSize,
            successSize,
            failTotalSize,
            existsSize,
            invoiceNumber: existsSet.join(','),
            failSize,
          })
          .d(messageText);
        notification.success({
          description: message,
          message: '',
          duration: 5,
        });
        const { queryDataSet } = this.props.batchCheckDS;
        if (queryDataSet) {
          const companyCode = queryDataSet.current!.get('companyCode');
          const employeeNum = queryDataSet.current!.get('employeeNum');
          const params = { tenantId, companyCode, employeeNum };
          this.getBatchNum(params);
          queryDataSet.current!.set('batchCode', batchCode);
          this.props.batchCheckDS.query();
        }
      } else {
        notification.error({
          description: '',
          message: res.message,
        });
      }
    } catch (err) {
      notification.error({
        description: err.message,
        message: intl.get('hivp.invoicesArchiveUpload.view.uploadInvalid').d('上传返回数据无效'),
      });
    }
  };

  handleUploadError = response => {
    notification.error({
      description: '',
      message: response,
    });
  };

  @Bind()
  tabChange(newActiveKey) {
    this.setState({ activeKey: newActiveKey });
    const { queryDataSet } = this.props.batchCheckDS;
    if (queryDataSet) {
      if (newActiveKey === 'notAdd') {
        queryDataSet.current!.set({ invoicePoolStatus: 'N' });
      } else {
        queryDataSet.current!.set({ invoicePoolStatus: null });
      }
      this.props.batchCheckDS.query();
    }
  }

  @Bind()
  handleReset(queryDataSet) {
    queryDataSet.reset();
    queryDataSet.create();
    this.setState({ activeKey: 'notAdd' });
  }

  @Bind()
  handleQuery(dataSet) {
    dataSet.query().then(res => {
      if (res && res.content.length > 0) {
        const { invoicePoolStatus } = res.content[0];
        if (invoicePoolStatus === 'N') {
          this.setState({ activeKey: 'notAdd' });
          this.props.batchCheckDS.queryDataSet?.current!.set({ invoicePoolStatus: 'N' });
        } else {
          this.setState({ activeKey: 'add' });
          this.props.batchCheckDS.queryDataSet?.current!.set({ invoicePoolStatus: null });
        }
      }
    });
  }

  @Bind()
  batchDelete() {
    this.props.batchCheckDS.delete(this.props.batchCheckDS.selected);
  }

  // 识别状态是（识别完成）且发票查验状态为（已查验||无需查验）、识别状态是（‘’）且发票查验状态为（已查验）
  filterRecogStatus(list) {
    return find(
      list,
      item =>
        !(
          (item.recognitionStatus === 'RECOGNITION_FINISHED' &&
            ['3', '4'].includes(item.checkStatus)) ||
          (item.recognitionStatus === '' && item.checkStatus === '4')
        )
    );
  }

  @Bind()
  renderQueryBar(tableProps) {
    const { queryDataSet, dataSet } = tableProps;
    const { batchNum, activeKey } = this.state;
    const RenderButton = observer((props: any) => {
      let isDisabled = props.dataSet!.selected.length === 0;
      const list = props.dataSet!.selected.map(record => record.toData());
      // 识别状态是（识别完成）且发票查验状态为（已查验||无需查验）、识别状态是（‘’）且发票查验状态为（已查验）
      const recogStatus = this.filterRecogStatus(list);
      if (recogStatus) isDisabled = true;
      return (
        <Button onClick={props.onClick} disabled={isDisabled} funcType={FuncType.link}>
          {props.title}
        </Button>
      );
    });
    const DeleteButton = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button onClick={props.onClick} disabled={isDisabled}>
          {props.title}
        </Button>
      );
    });
    const addBtns = [
      <RenderButton
        key="addToMyInvoice"
        onClick={() => this.addToInvoice(1)}
        dataSet={dataSet}
        title={intl.get(`${modelCode}.button.addToMyInvoice`).d('至我的发票')}
      />,
      <RenderButton
        key="addToInvoicePool"
        onClick={() => this.addToInvoice(0)}
        dataSet={dataSet}
        title={intl.get(`${modelCode}.button.addToInvoicePool`).d('至发票池/票据池')}
      />,
    ];
    const btnMenu = (
      <Menu>
        {addBtns.map(action => {
          return <MenuItem>{action}</MenuItem>;
        })}
      </Menu>
    );
    if (queryDataSet) {
      return (
        <>
          <Row>
            <Col span={20}>
              <Form columns={3} dataSet={queryDataSet}>
                <Lov name="companyObj" onChange={this.handleCompanyChange} />
                <TextField name="employeeDesc" />
                <TextField name="currentTime" />
                <Select name="batchCode">
                  {batchNum.map(item => (
                    <Option value={item}>{item}</Option>
                  ))}
                </Select>
                <TextField name="invoiceCode" />
                <TextField name="invoiceNumber" />
              </Form>
            </Col>
            <Col span={4} style={{ textAlign: 'end' }}>
              <Button onClick={() => this.handleReset(queryDataSet)}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button color={ButtonColor.primary} onClick={() => this.handleQuery(dataSet)}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Col>
          </Row>
          <Tabs
            activeKey={activeKey}
            onChange={newActiveKey => this.tabChange(newActiveKey)}
            style={{ marginBottom: 10 }}
          >
            <TabPane tab={intl.get(`${modelCode}.button.notAdd`).d('未添加')} key="notAdd">
              <Button key="save" onClick={() => this.batchSave()} color={ButtonColor.primary}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Dropdown overlay={btnMenu}>
                <Button>
                  {intl.get('hivp.batchCheck.button.addTo').d('添加')}
                  <Icon type="arrow_drop_down" />
                </Button>
              </Dropdown>
              <DeleteButton
                key="batchDelete"
                onClick={this.batchDelete}
                dataSet={dataSet}
                title={intl.get('hzero.common.button.delete').d('删除')}
              />
            </TabPane>
            <TabPane tab={intl.get(`${modelCode}.button.added`).d('已添加')} key="add">
              <Form dataSet={queryDataSet} columns={4}>
                <Select
                  name="invoicePoolStatus"
                  colSpan={1}
                  onChange={() => this.props.batchCheckDS.query()}
                  optionsFilter={record => record.get('value') !== 'N'}
                />
              </Form>
            </TabPane>
          </Tabs>
        </>
      );
    }
    return <></>;
  }

  // 导出
  @Bind()
  exportParams() {
    const queryParams = this.props.batchCheckDS.queryDataSet!.map(data => data.toData()) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    const { companyObj, ...otherData } = queryParams[0];
    const _queryParams = {
      ...companyObj,
      ...otherData,
    };
    return { ..._queryParams } || {};
  }

  // 导入
  @Bind()
  async handleBatchExport() {
    const code = 'HIVP.INVOICE_CHECK';
    const { queryDataSet } = this.props.batchCheckDS;
    const companyCode = queryDataSet && queryDataSet.current?.get('companyCode');
    const employeeNumber = queryDataSet && queryDataSet.current?.get('employeeNum');
    const params = {
      companyCode,
      employeeNumber,
      tenantId,
    };
    await closeTab(`/himp/commentImport/${code}`);
    if (companyCode) {
      const argsParam = JSON.stringify(params);
      openTab({
        key: `/himp/commentImport/${code}`,
        title: intl.get('hzero.common.button.import').d('导入'),
        search: queryString.stringify({
          prefixPath: API_PREFIX,
          action: intl.get(`${modelCode}.view.invoiceReqImport`).d('发票查验导入'),
          tenantId,
          args: argsParam,
        }),
      });
    }
  }

  // 查看发票明细
  @Bind()
  handleGotoDetailPage(invoiceHeaderId, invoiceTypeObj) {
    const { dispatch } = this.props;
    if (invoiceTypeObj.tag === 'I') {
      const pathname = `/htc-front-ivp/batch-check/invoiceDetail/${invoiceHeaderId}/${invoiceTypeObj.value}`;
      dispatch(
        routerRedux.push({
          pathname,
        })
      );
    } else {
      const pathname = `/htc-front-ivp/batch-check/billDetail/${invoiceHeaderId}`;
      dispatch(
        routerRedux.push({
          pathname,
        })
      );
    }
  }

  // 查看详情
  @Bind()
  async checkDetail(record) {
    const { dispatch } = this.props;
    const invoiceHeaderId = record.get('invoiceHeaderId');
    const invoiceType = record.get('invoiceType');
    const invoiceTypeObj = record.getField('invoiceType').getLookupData(invoiceType);
    if (['BLOCK_CHAIN', 'GENERAL_MACHINE_INVOICE'].includes(invoiceType)) {
      const invoiceId = record.get('invoiceId');
      dispatch(
        routerRedux.push({
          pathname: `/htc-front-ivp/batch-check/blockAndCeneralDetail/${invoiceId}`,
        })
      );
    } else if (invoiceHeaderId) {
      this.handleGotoDetailPage(invoiceHeaderId, invoiceTypeObj);
    } else {
      notification.warning({
        description: '',
        message: '该发票没有全票面信息',
      });
    }
  }

  // 删除记录
  @Bind()
  async lineDelete(record) {
    const res = await this.props.batchCheckDS.delete(record);
    if (res && res.success) {
      const { queryDataSet } = this.props.batchCheckDS;
      if (queryDataSet) {
        const companyCode = queryDataSet.current!.get('companyCode');
        const employeeNum = queryDataSet.current!.get('employeeNum');
        const params = { tenantId, companyCode, employeeNum };
        this.getBatchNum(params);
      }
    }
  }

  // 查看档案
  @Bind()
  archiveView(record) {
    const { dispatch } = this.props;
    const pathname = `/htc-front-ivp/batch-check/archive-view`;
    dispatch(
      routerRedux.push({
        pathname,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(JSON.stringify(record.toData())),
        }),
      })
    );
  }

  @Bind()
  async reviewService(record) {
    const data = record.toData(true);
    const {
      companyCode,
      employeeNum,
      totalAmount,
      amount,
      checkCode,
      invoiceDate,
      invoiceCode,
      invoiceNumber,
    } = data;
    const _data = {
      tenantId,
      companyCode,
      employeeNum,
      invoiceAmount: totalAmount || amount,
      checkNumber: checkCode,
      invoiceCode,
      invoiceNumber,
      invoiceDate: moment(invoiceDate).format('YYYYMMDD'),
    };
    const res = getResponse(await invoiceRecheck(_data));
    if (res && res.data && res.data.status === '0001') {
      notification.success({
        description: '',
        message: res.message,
      });
    } else {
      notification.warning({
        description: '',
        message: res.data.message,
      });
    }
    this.props.batchCheckDS.query();
  }

  // 重新查验
  @Bind()
  async reView(record) {
    if (record.dirty) {
      // 先保存
      const saveRes = await this.batchSave();
      if (saveRes && saveRes.content) {
        this.reviewService(record);
      }
    } else {
      this.reviewService(record);
    }
  }

  get columns(): ColumnProps[] {
    const amountEditable = record =>
      record.get('invoicePoolStatus') === 'N' && record.get('invoiceType') !== 'FLIGHT_ITINERARY';
    const flightEditable = record =>
      record.get('invoicePoolStatus') === 'N' && record.get('invoiceType') === 'FLIGHT_ITINERARY';
    const editable = record => record.get('invoicePoolStatus') === 'N';
    const viewDetailAble = record => {
      const invoiceType = record.get('invoiceType');
      const checkStatus = record.get('checkStatus');
      if (['BLOCK_CHAIN', 'GENERAL_MACHINE_INVOICE'].includes(invoiceType)) {
        return false;
      } else {
        return !invoiceType || checkStatus !== '4';
      }
    };
    return [
      {
        name: 'fileName',
        width: 350,
        renderer: ({ value, record }) => {
          const checkStatus = record?.get('checkStatus');
          const recognitionStatus = record?.get('recognitionStatus');
          const checkStatusTxt = record?.getField('checkStatus')?.getText(checkStatus);
          let color = '';
          let textColor = '';
          switch (checkStatus) {
            case '1':
              color = '#DBEEFF';
              textColor = '#3889FF';
              break;
            case '2':
            case '3':
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            case '4':
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            case '5':
              color = '#FFDCD4';
              textColor = '#FF5F57';
              break;
            default:
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {checkStatusTxt}
              </Tag>
              &nbsp;
              {!(
                ['3', '4'].includes(checkStatus) && recognitionStatus === 'RECOGNITION_FINISHED'
              ) ? (
                value
              ) : (
                <a onClick={() => this.archiveView(record)}>{value}</a>
              )}
            </>
          );
        },
      },
      {
        name: 'invoiceType',
        editor: record => editable(record),
        width: 200,
      },
      {
        name: 'invoiceCode',
        editor: record => editable(record),
        width: 150,
      },
      {
        name: 'invoiceNumber',
        editor: record => editable(record),
        width: 130,
      },
      {
        name: 'invoiceAmount',
        editor: record => amountEditable(record),
        width: 150,
      },
      {
        name: 'totalAmount',
        editor: record => amountEditable(record),
        width: 150,
      },
      {
        name: 'buyerName',
        editor: record => editable(record),
      },
      { name: 'recognitionStatus' },
      { name: 'fileType', editor: record => editable(record) },
      { name: 'invoicePoolStatus', width: 170 },
      {
        name: 'invoiceDate',
        editor: record => editable(record),
        width: 150,
      },
      {
        name: 'fare',
        editor: record => flightEditable(record),
      },
      {
        name: 'aviationDevelopmentFund',
        editor: record => flightEditable(record),
        width: 150,
      },
      { name: 'fuelSurcharge', editor: record => flightEditable(record) },
      { name: 'otherTaxes', editor: record => flightEditable(record) },
      { name: 'total', editor: record => flightEditable(record) },
      { name: 'checkCode', editor: record => editable(record) },
      {
        name: 'ticketCollectorObj',
        editor: record =>
          record.get('invoiceBillFlag') !== '1' || !record.get('ticketCollectorDesc'),
        width: 280,
      },
      { name: 'countryCode' },
      { name: 'employeeIdentify' },
      { name: 'returnCode' },
      { name: 'returnMsg' },
      { name: 'invoiceStatus' },
      { name: 'batchCode', width: 250 },
      {
        name: 'operation',
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 170,
        command: ({ record }): Commands[] => {
          const checkStatus = record.get('checkStatus');
          return [
            <span className="action-link" key="action">
              <Button
                key="viewDetail"
                disabled={viewDetailAble(record)}
                onClick={() => this.checkDetail(record)}
                funcType={FuncType.link}
                color={ButtonColor.primary}
              >
                {intl.get('hzero.common.button.detail').d('查看详情')}
              </Button>
              <Button
                key="relateDoc"
                disabled={['2', '3', '4'].includes(checkStatus)}
                onClick={() => this.reView(record)}
                funcType={FuncType.link}
                color={ButtonColor.primary}
              >
                {intl.get(`${modelCode}.button.Check`).d('查验')}
              </Button>
              <Button
                key="delete"
                onClick={() => this.lineDelete(record)}
                disabled={record.get('invoicePoolStatus') !== 'N'}
                funcType={FuncType.link}
                color={ButtonColor.primary}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </span>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  // 上传并智能识别校验
  @Bind()
  async upload(startFlag) {
    if (startFlag) {
      // 开始上传
      this.multipleUploadUuid = uuidv4();
      this.multipleUpload.startUpload();
    }
  }

  @Bind()
  addInvoiceFn(res, type, params) {
    if (res && res.data === 'N') {
      Modal.confirm({
        key: Modal.key,
        title: intl
          .get('hivp.invoicesArchiveUpload.validate.confirmArchive')
          .d('当前发票档案文件非发票原文件，是否继续上传？'),
      }).then(async button => {
        if (button === 'ok') {
          const _params = {
            ...params,
            uploadFlag: '2',
          };
          const result = type === 0 ? await addInvoicePool(_params) : await addMyInvoice(_params);
          this.addInvoiceFn(result, type, params);
        } else {
          const _params = {
            ...params,
            uploadFlag: '1',
          };
          const result = type === 0 ? await addInvoicePool(_params) : await addMyInvoice(_params);
          this.addInvoiceFn(result, type, params);
        }
      });
    }
    if (res && res.status === 'H1024') {
      if (res.data && res.data.length > 0) {
        Modal.info({
          title: intl.get(`${modelCode}.notice.message4`).d('以下发票已被采集，不允许重复采集'),
          style: { width: '37%' },
          children: (
            <div>
              {res.data.map(item => (
                <p>
                  {intl.get('htc.common.view.invoiceCode').d('发票代码')}：{item.invoiceCode}&emsp;
                  {intl.get('htc.common.view.invoiceNo').d('发票号码')}：{item.invoiceNumber}&emsp;
                  {intl.get(`${modelCode}.view.collectionStaff`).d('收票员工')}：
                  {item.ticketCollectorDesc}
                </p>
              ))}
            </div>
          ),
        });
      }
      this.props.batchCheckDS.query();
    } else if (res && res.status === 'H1014') {
      notification.success({
        description: '',
        message: res.message,
      });
      this.props.batchCheckDS.query();
    } else {
      notification.warning({
        description: '',
        message: res.message,
      });
    }
  }

  @Bind()
  async addInvoice(type) {
    const list = this.props.batchCheckDS.selected.map(record => record.toData());
    // 识别状态是（识别完成）且发票查验状态为（已查验||无需查验）、识别状态是（‘’）且发票查验状态为（已查验）
    const recogStatus = this.filterRecogStatus(list);
    const invoiceIds = this.props.batchCheckDS.selected.map(record => record.get('invoiceId'));
    const curInfo = this.props.batchCheckDS.current!.toData();
    const { companyCode, employeeNum } = curInfo;

    const params = {
      companyCode,
      employeeNum,
      tenantId,
      invoiceIds: invoiceIds.join(','),
      uploadFlag: '0',
    };
    if (recogStatus) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.notice.message1`)
          .d(
            '识别状态为识别完成且发票查验状态为已查验或无需查验、无识别状态且发票查验状态为已查验的发票才能添加'
          ),
      });
      return;
    }
    if (type === 1) {
      // 添加至我的发票
      const haveNoEmploy = find(list, item => !item.ticketCollectorDesc);
      if (haveNoEmploy) {
        return notification.warning({
          description: '',
          message: intl
            .get(`${modelCode}.notice.message2`)
            .d('请填写收票员工，保存后再添加至我的发票'),
        });
      }
    } else {
      const addNoTicketList = find(list, item => item.invoicePoolStatus !== 'N');
      if (addNoTicketList) {
        notification.warning({
          description: '',
          message: intl.get(`${modelCode}.notice.message3`).d(' '),
        });
        return;
      }
    }
    const res = type === 0 ? await addInvoicePool(params) : await addMyInvoice(params);
    this.addInvoiceFn(res, type, params);
  }

  // 添加至我的发票/发票/票据池
  @Bind()
  async addToInvoice(type) {
    const validateValue = await this.props.batchCheckDS.validate(false, false);
    if (!validateValue) {
      return notification.error({
        description: '',
        message: intl.get(`${modelCode}.notification.invalid`).d('数据校验不通过！'),
      });
    }
    this.addInvoice(type);
  }

  @Bind()
  async batchSave() {
    const validateValue = await this.props.batchCheckDS.validate(false, false);
    if (!validateValue) {
      notification.error({
        description: '',
        message: intl.get(`${modelCode}.notification.invalid`).d('数据校验不通过！'),
      });
      return false;
    }
    return this.props.batchCheckDS.submit();
  }

  render() {
    const { companyCode, employeeNum } = this.state;
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
      },
      data: {
        companyCode,
        employeeNumber: employeeNum,
        sign: 'N',
      },
      multiple: false,
      uploadImmediately: false,
      showUploadBtn: false,
      showPreviewImage: false,
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleUploadError,
    };
    const HeaderButtons = observer((props: any) => {
      const { upload } = props;
      if (upload && upload.fileList.length > 0) {
        return (
          <Button
            key={props.key}
            onClick={props.onClick}
            color={ButtonColor.primary}
            style={{ marginLeft: 10 }}
          >
            {props.title}
          </Button>
        );
      } else {
        return null;
      }
    });
    return (
      <>
        <Header title={intl.get(`${modelCode}.title.check`).d('批量识别查验')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoices/export`}
            queryParams={() => this.exportParams()}
          />
          <Button onClick={() => this.handleBatchExport()}>
            {intl.get('hzero.common.button.import').d('导入')}
          </Button>
        </Header>
        <div className={styles.header}>
          <Upload
            ref={this.saveMultipleUpload}
            {...uploadProps}
            accept={acceptType}
            action={`${API_HOST}${API_PREFIX}/v1/${tenantId}/invoice-pool-main/batck-check`}
          >
            <Button color={ButtonColor.primary}>
              <Icon type="backup-o" className={styles.btnIcon} />
              {intl.get('hivp.invoicesArchiveUpload.button.uploadFile').d('上传文件')}
            </Button>
          </Upload>
          <HeaderButtons
            key="batchOcr"
            onClick={() => this.upload(true)}
            title={intl.get('hivp.invoicesArchiveUpload.button.check').d('智能校验')}
            upload={this.multipleUpload}
          />
        </div>
        <Content>
          <Table
            dataSet={this.props.batchCheckDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            style={{ height: 350 }}
          />
        </Content>
      </>
    );
  }
}
