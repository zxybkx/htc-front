/*
 * @Description:批量识别查验
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-1-25 10:51:22
 * @LastEditTime: 2021-03-18 10:56:18
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { API_HOST } from 'utils/config';
import { Content, Header } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { find } from 'lodash';
import ExcelExport from 'components/ExcelExport';
import { DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';
import { openTab, closeTab } from 'utils/menuTab';
import queryString from 'query-string';
import querystring from 'querystring';
import commonConfig from '@common/config/commonConfig';
import {
  Button,
  DataSet,
  Form,
  Lov,
  Output,
  Table,
  Upload,
  Select,
  Modal,
  TextField,
} from 'choerodon-ui/pro';
import { Col, Row } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import withProps from 'utils/withProps';
import uuidv4 from 'uuid/v4';
import moment from 'moment';
import {
  getBatchNum,
  addInvoicePool,
  addMyInvoice,
  invoiceRecheck,
} from '@src/services/batchCheckService';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { getAccessToken, getCurrentOrganizationId, getResponse } from 'utils/utils';
import BatchCheckDS from '../stores/BatchCheckPageDS';

const modelCode = 'hivp.batch-check';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IVP_API || '';
const { Option } = Select;

interface InvoiceWorkbenchPageProps {
  dispatch: Dispatch<any>;
  batchCheckDS: DataSet;
}

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
@connect()
export default class InvoiceWorkbenchPage extends Component<InvoiceWorkbenchPageProps> {
  state = {
    batchNum: [],
    loadingFlag: false,
    companyCode: '',
    employeeNum: '',
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
      const res = await getCurrentEmployeeInfo({ tenantId });
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
        }
        if (curCompanyId) {
          const companyCode = queryDataSet.current!.get('companyCode');
          const employeeNum = queryDataSet.current!.get('employeeNum');
          this.setState({
            companyCode,
            employeeNum,
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
    // console.log('this.multipleUpload.fileList', this.multipleUpload.fileList);
    if (value) {
      const { companyCode, employeeNum } = value;
      const params = { tenantId, companyCode, employeeNum };
      this.setState({
        companyCode,
        employeeNum,
      });
      this.getBatchNum(params);
    }
    this.multipleUpload.fileList = [];
    this.props.batchCheckDS.loadData([]);
    const { queryDataSet } = this.props.batchCheckDS;
    if (queryDataSet) {
      queryDataSet.current!.set({ batchCode: '' });
    }
  }

  saveMultipleUpload = (node) => {
    this.multipleUpload = node;
  };

  handleUploadSuccess = (response) => {
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
        const message = `本次识别${fileSize}张发票，成功上传${successSize}张，失败${failTotalSize}张，其中${existsSize}张已存在,发票号码为:[${existsSet.join(
          ','
        )}],${failSize}张ocr识别失败`;
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
        message: intl.get(`${modelCode}.view.uploadInvalid`).d('上传返回数据无效'),
      });
    }
    this.setState({ loadingFlag: false });
  };

  handleUploadError = (response) => {
    this.setState({ loadingFlag: false });
    notification.error({
      description: '',
      message: response,
    });
  };

  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, buttons, dataSet } = props;
    const { batchNum, companyCode, employeeNum } = this.state;
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
      showPreviewImage: true,
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleUploadError,
    };
    if (queryDataSet) {
      return (
        <>
          <Form columns={4} dataSet={queryDataSet}>
            <Lov name="companyObj" colSpan={1} onChange={this.handleCompanyChange} />
            <Output name="employeeDesc" colSpan={1} />
            <Output
              value={moment().format(DEFAULT_DATE_FORMAT)}
              colSpan={1}
              label={intl.get(`${modelCode}.view.curDate`).d('当前日期')}
            />
            <Output
              label="文件选择"
              colSpan={1}
              // key={Math.random()}
              renderer={() => (
                <Upload
                  ref={this.saveMultipleUpload}
                  {...uploadProps}
                  accept={['.zip', '.rar', '.7z']}
                  action={`${API_HOST}${API_PREFIX}/v1/${tenantId}/invoice-pool-main/batck-check`}
                />
              )}
            />
            {/*---*/}
            <Select name="batchCode" colSpan={1}>
              {batchNum.map((item) => (
                <Option value={item}>{item}</Option>
              ))}
            </Select>
            <Select name="invoicePoolStatus" colSpan={1} />
            <TextField name="invoiceCode" colSpan={1} />
            <TextField name="invoiceNumber" colSpan={1} />
          </Form>
          <Row type="flex" justify="space-between">
            <Col span={20}>{buttons}</Col>
            <Col span={4} style={{ textAlign: 'end', marginBottom: '2px' }}>
              <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
                {intl.get(`${modelCode}.button.save`).d('查询')}
              </Button>
            </Col>
          </Row>
        </>
      );
    }
    return <></>;
  }

  // 导出
  @Bind()
  exportParams() {
    const queryParams = this.props.batchCheckDS.queryDataSet!.map((data) => data.toData()) || {};
    // queryParams[0].forEach(item => {
    //   if(item === null) delete item;
    // });
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
    const invoiceHeaderId = record.get('invoiceHeaderId');
    const invoiceType = record.get('invoiceType');
    const invoiceTypeObj = record.getField('invoiceType').getLookupData(invoiceType);
    if (invoiceHeaderId) {
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
        search: querystring.stringify({
          invoiceInfo: encodeURIComponent(JSON.stringify(record.toData())),
        }),
      })
    );
  }

  // 重新查验
  @Bind()
  async reView(record) {
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
    const res = await invoiceRecheck(_data);
    if (res && res.data && res.data.status === '0001') {
      notification.success({
        description: '',
        message: res.message,
      });
      this.props.batchCheckDS.query();
    } else {
      notification.warning({
        description: '',
        message: res.data.message,
      });
    }
  }

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      { name: 'fileName' },
      { name: 'recognitionStatus' },
      { name: 'fileType', editor: (record) => record.get('invoicePoolStatus') === 'N' },
      {
        name: 'invoiceType',
        editor: (record) => record.get('invoicePoolStatus') === 'N',
        width: 200,
      },
      { name: 'invoicePoolStatus', width: 170 },
      {
        name: 'invoiceCode',
        editor: (record) => record.get('invoicePoolStatus') === 'N',
        width: 150,
      },
      {
        name: 'invoiceNumber',
        editor: (record) => record.get('invoicePoolStatus') === 'N',
        width: 130,
      },
      {
        name: 'invoiceDate',
        editor: (record) => record.get('invoicePoolStatus') === 'N',
        width: 150,
      },
      {
        name: 'totalAmount',
        editor: (record) => record.get('invoicePoolStatus') === 'N',
        width: 150,
        align: ColumnAlign.right,
      },
      {
        name: 'aviationDevelopmentFund',
        editor: (record) => record.get('invoicePoolStatus') === 'N',
        width: 150,
      },
      { name: 'checkCode', editor: (record) => record.get('invoicePoolStatus') === 'N' },
      { name: 'checkStatus' },
      {
        name: 'ticketCollectorObj',
        editor: (record) =>
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
        header: intl.get('hzero.common.action').d('操作'),
        width: 400,
        command: ({ record }): Commands[] => {
          const recognitionStatus = record.get('recognitionStatus');
          const checkStatus = record.get('checkStatus');
          const invoiceType = record.get('invoiceType');
          return [
            <Button
              key="viewArchive"
              disabled={
                !(['3', '4'].includes(checkStatus) && recognitionStatus === 'RECOGNITION_FINISHED')
              }
              onClick={() => this.archiveView(record)}
            >
              {intl.get(`${modelCode}.button.viewArchive`).d('查看档案')}
            </Button>,
            <Button
              key="viewDetail"
              disabled={!invoiceType || checkStatus !== '4'}
              onClick={() => this.checkDetail(record)}
            >
              {intl.get(`${modelCode}.button.viewDetail`).d('查看详情')}
            </Button>,
            <Button
              key="relateDoc"
              disabled={['2', '3', '4'].includes(checkStatus)}
              onClick={() => this.reView(record)}
            >
              {intl.get(`${modelCode}.button.relateDoc`).d('重新查验')}
            </Button>,
            <Button
              key="delete"
              onClick={() => this.lineDelete(record)}
              disabled={record.get('invoicePoolStatus') !== 'N'}
            >
              {intl.get(`${modelCode}.button.delete`).d('删除记录')}
            </Button>,
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
      if (this.multipleUpload.fileList.length > 0) {
        this.setState({ loadingFlag: true });
      }
    }
  }

  @Bind()
  async addInvoice(type) {
    const list = this.props.batchCheckDS.selected.map((record) => record.toData());
    // 识别状态是（识别完成）且发票查验状态为（已查验||无需查验）、识别状态是（‘’）且发票查验状态为（已查验）
    const recogStatus = find(
      list,
      (item) =>
        !(
          (item.recognitionStatus === 'RECOGNITION_FINISHED' &&
            ['3', '4'].includes(item.checkStatus)) ||
          (item.recognitionStatus === '' && item.checkStatus === '4')
        )
    );
    const invoiceIds = this.props.batchCheckDS.selected.map((record) => record.get('invoiceId'));
    const curInfo = this.props.batchCheckDS.current!.toData();
    const { companyCode, employeeNum } = curInfo;
    const params = {
      companyCode,
      employeeNum,
      tenantId,
      invoiceIds: invoiceIds.join(','),
    };
    if (recogStatus) {
      return notification.warning({
        description: '',
        message:
          '识别状态为识别完成且发票查验状态为已查验或无需查验、无识别状态且发票查验状态为已查验的发票才能添加',
      });
    }
    if (type === 1) {
      // 添加至我的发票
      const haveNoEmploy = find(list, (item) => !item.ticketCollectorDesc);
      if (haveNoEmploy) {
        return notification.warning({
          description: '',
          message: '请填写收票员工，保存后再添加至我的发票',
        });
      }
    } else {
      const addNoTicketList = find(list, (item) => item.invoicePoolStatus !== 'N');
      if (addNoTicketList) {
        notification.warning({
          description: '',
          message: '存在已添加至发票/票据池的发票，不允许重复添加',
        });
        return;
      }
    }
    const res = type === 0 ? await addInvoicePool(params) : await addMyInvoice(params);
    if (res && res.status === 'H1024') {
      if (res.data && res.data.length > 0) {
        Modal.info({
          title: '以下发票已被采集，不允许重复采集',
          style: { width: '37%' },
          children: (
            <div>
              {res.data.map((item) => (
                <p>
                  发票代码：{item.invoiceCode}&emsp;发票号码：{item.invoiceNumber}&emsp;收票员工：
                  {item.ticketCollectorDesc}
                </p>
              ))}
            </div>
          ),
        });
      }
      this.props.batchCheckDS.query();
      return;
    }
    if (res && res.status === 'H1014') {
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

  // 添加至我的发票
  @Bind()
  async addToMyInvoice() {
    const validateValue = await this.props.batchCheckDS.validate(false, false);
    if (!validateValue) {
      return notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
    }
    this.addInvoice(1);
  }

  // 添加至发票/票据池
  @Bind()
  async addToInvoicePool() {
    const validateValue = await this.props.batchCheckDS.validate(false, false);
    if (!validateValue) {
      return notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
    }
    this.addInvoice(0);
  }

  @Bind()
  async batchSave() {
    const validateValue = await this.props.batchCheckDS.validate(false, false);
    if (!validateValue) {
      return notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
    }
    this.props.batchCheckDS.submit();
  }

  get buttons(): Buttons[] {
    const { loadingFlag } = this.state;
    const HeaderButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <Button key="upload" onClick={() => this.upload(true)} loading={loadingFlag}>
        {intl.get(`${modelCode}.button.upload`).d('上传并智能识别校验')}
      </Button>,
      <HeaderButtons
        key="addToMyInvoice"
        onClick={() => this.addToMyInvoice()}
        dataSet={this.props.batchCheckDS}
        title={intl.get(`${modelCode}.button.addToMyInvoice`).d('添加至我的发票')}
      />,
      <HeaderButtons
        key="addToInvoicePool"
        onClick={() => this.addToInvoicePool()}
        dataSet={this.props.batchCheckDS}
        title={intl.get(`${modelCode}.button.addToInvoicePool`).d('添加至发票/票据池')}
      />,
      <Button key="save" onClick={() => this.batchSave()}>
        {intl.get(`${modelCode}.button.save`).d('保存')}
      </Button>,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('批量识别查验')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoices/export`}
            queryParams={() => this.exportParams()}
          />
          <Button onClick={() => this.handleBatchExport()}>
            {intl.get(`${modelCode}.import`).d('导入')}
          </Button>
        </Header>
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.props.batchCheckDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
