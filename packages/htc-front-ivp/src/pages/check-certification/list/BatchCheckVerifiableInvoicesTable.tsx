/**
 * @Description:勾选认证-批量勾选可认证发票
 * @version: 1.0
 * @Author: shan.zhang@hand-china.com
 * @Date: 2020-09-23 14:26:15
 * @LastEditTime: 2022-08-29 14:36:28
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import {
  Button,
  DataSet,
  DatePicker,
  DateTimePicker,
  Dropdown,
  Form,
  Menu,
  Modal as ModalPro,
  Select,
  Table,
  TextField,
  Upload,
} from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import {
  batchCheck,
  downloadFile,
  refreshStatus,
  unCertifiedInvoiceQuery,
  creatBatchNumber,
  batchScanGunInvoices,
} from '@src/services/checkCertificationService';
import withProps from 'utils/withProps';
import { getAccessToken, getResponse } from 'utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnAlign, ColumnLock, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import queryString from 'query-string';
import commonConfig from '@htccommon/config/commonConfig';
import { API_HOST } from 'utils/config';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import { Col, Icon, message, Row, Tag, Tooltip } from 'choerodon-ui';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { ValueChangeAction } from 'choerodon-ui/pro/lib/text-field/enum';
import BatchInvoiceHeaderDS from '../stores/BatchInvoiceHeaderDS';
import ScanGunModalDS from '../stores/ScanGunModalDS';
import styles from '../checkcertification.less';

const { Item: MenuItem } = Menu;

const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();
const HIVP_API = commonConfig.IVP_API || '';

interface BatchCheckVerifiableInvoicesTableProps {
  companyAndPassword: DataSet;
  empInfo: any;
  currentPeriodData: any;
  checkInvoiceCount: number;
  history: any;
  batchInvoiceHeaderDS?: DataSet;
}

@withProps(
  () => {
    const batchInvoiceHeaderDS = new DataSet({
      autoQuery: false,
      ...BatchInvoiceHeaderDS(),
    });
    return { batchInvoiceHeaderDS };
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
export default class BatchCheckVerifiableInvoicesTable extends Component<
  BatchCheckVerifiableInvoicesTableProps
> {
  state = {
    batchInvoiceMoreDisplay: false, // 批量可认证发票查询是否显示更多
  };

  async componentDidMount() {
    const { batchInvoiceHeaderDS, currentPeriodData, empInfo, checkInvoiceCount } = this.props;
    if (batchInvoiceHeaderDS) {
      const { queryDataSet } = batchInvoiceHeaderDS;
      const tjyf = queryDataSet?.current?.get('tjyf');
      if (!tjyf && queryDataSet) {
        const {
          currentPeriod,
          currentOperationalDeadline,
          checkableTimeRange,
          currentCertState,
        } = currentPeriodData;
        queryDataSet.create({
          companyObj: empInfo,
          authorityCode: empInfo.authorityCode,
          tjyf: currentPeriod,
          currentOperationalDeadline,
          checkableTimeRange,
          currentCertState,
          checkInvoiceCount,
        });
      }
      if (tjyf) batchInvoiceHeaderDS.query();
    }
  }

  componentDidUpdate(prevProps) {
    const { batchInvoiceHeaderDS } = this.props;
    if (prevProps.empInfo && prevProps.empInfo !== this.props.empInfo) {
      if (batchInvoiceHeaderDS) {
        const { queryDataSet } = batchInvoiceHeaderDS;
        queryDataSet?.current!.set({ companyObj: this.props.empInfo });
        queryDataSet?.current!.set({ authorityCode: this.props.empInfo.authorityCode });
      }
    }
    if (
      prevProps.currentPeriodData &&
      prevProps.currentPeriodData !== this.props.currentPeriodData
    ) {
      if (batchInvoiceHeaderDS) {
        const { queryDataSet } = batchInvoiceHeaderDS;
        const {
          currentPeriod,
          currentOperationalDeadline,
          checkableTimeRange,
          currentCertState,
        } = this.props.currentPeriodData;
        queryDataSet?.current!.set({ tjyf: currentPeriod });
        queryDataSet?.current!.set({ currentCertState });
        queryDataSet?.current!.set({ currentOperationalDeadline });
        queryDataSet?.current!.set({ checkableTimeRange });
      }
    }
    if (
      prevProps.checkInvoiceCount &&
      prevProps.checkInvoiceCount !== this.props.checkInvoiceCount
    ) {
      if (batchInvoiceHeaderDS) {
        const { queryDataSet } = batchInvoiceHeaderDS;
        if (queryDataSet) {
          queryDataSet?.current!.set({ checkInvoiceCount: this.props.checkInvoiceCount });
        }
      }
    }
  }

  @Bind()
  commonRendererFn({ value, record }): any {
    const checkState = record?.get('checkState');
    const checkStateTxt = record?.getField('checkState')?.getText(checkState);
    let color = '';
    let textColor = '';
    switch (checkState) {
      case '0':
        color = '#F0F0F0';
        textColor = '#959595';
        break;
      case '1':
        color = '#D6FFD7';
        textColor = '#19A633';
        break;
      case 'R':
        color = '#FFECC4';
        textColor = '#FF9D23';
        break;
      default:
        break;
    }
    return (
      <>
        <Tag color={color} style={{ color: textColor }}>
          {checkStateTxt}
        </Tag>
        &nbsp;
        <span>{value}</span>
      </>
    );
  }

  // 下载发票文件
  @Bind()
  async downLoad() {
    const { empInfo, batchInvoiceHeaderDS } = this.props;
    const { companyId, companyCode, employeeId, employeeNum, taxpayerNumber } = empInfo;
    if (batchInvoiceHeaderDS) {
      const needDownloadKey = batchInvoiceHeaderDS.selected[0].get('redisKey');
      const params = {
        tenantId,
        companyId,
        companyCode,
        employeeId,
        employeeNumber: employeeNum,
        needDownloadKey,
      };
      if (batchInvoiceHeaderDS.selected.length > 1) {
        notification.warning({
          description: '',
          message: intl
            .get('hivp.checkCertification.notification.warning.upload')
            .d('当前只能同时操作一条数据，请重试！'),
        });
        return;
      }
      const res = getResponse(await downloadFile(params));
      if (res) {
        const date = moment().format('YYYY-MM-DD HH:mm:ss');
        const blob = new Blob([res]); // 字节流
        if ((window.navigator as any).msSaveBlob) {
          try {
            (window.navigator as any).msSaveBlob(blob, `${taxpayerNumber}_${date}.xls`);
          } catch (e) {
            notification.error({
              description: '',
              message: intl.get('hiop.invoiceRule.notification.error.upload').d('下载失败'),
            });
          }
        } else {
          const aElement = document.createElement('a');
          const blobUrl = window.URL.createObjectURL(blob);
          aElement.href = blobUrl; // 设置a标签路径
          aElement.download = `${taxpayerNumber}_${date}.xls`;
          aElement.click();
          window.URL.revokeObjectURL(blobUrl);
        }
      }
    }
  }

  // 批量发票勾选（取消）可认证发票: 刷新状态
  @Bind()
  async batchInvoiceRefresh() {
    const { empInfo, batchInvoiceHeaderDS } = this.props;
    if (batchInvoiceHeaderDS) {
      const selectedList = batchInvoiceHeaderDS.selected.map(rec => rec.toData());
      const unPass = selectedList.some(item => item.checkState !== 'R');
      if (unPass) {
        notification.warning({
          description: '',
          message: intl
            .get(`${modelCode}.view.tickInvalid2`)
            .d('存在勾选状态为非请求中状态的发票，无法刷新'),
        });
        return;
      }
      const params = { tenantId, empInfo, selectedList };
      const res = getResponse(await refreshStatus(params));
      if (res && res.status === '1000') {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        batchInvoiceHeaderDS.query();
      }
    }
  }

  /**
   * 获取当前可勾选发票
   */
  @Bind()
  async getCurrentCheckInvoices() {
    const { batchInvoiceHeaderDS, empInfo, companyAndPassword } = this.props;
    if (batchInvoiceHeaderDS) {
      const { queryDataSet } = batchInvoiceHeaderDS;
      const checkableTimeRange = queryDataSet?.current!.get('checkableTimeRange');
      const rqq = queryDataSet?.current!.get('rqq');
      const rqz = queryDataSet?.current!.get('rqz');
      const xfsbh = queryDataSet?.current!.get('xfsbh');
      const qt = queryDataSet?.current!.get('tjyf');
      const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
      const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
      if (!taxDiskPassword) {
        return notification.warning({
          description: '',
          message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
        });
      }
      const params = {
        tenantId,
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        list: {
          spmm: taxDiskPassword,
          gxzt: '0',
          checkableTimeRange,
          rqq: rqq && rqq.format(DEFAULT_DATE_FORMAT),
          rqz: rqz && rqz.format(DEFAULT_DATE_FORMAT),
          xfsbh,
          qt,
        },
      };
      const res = getResponse(await unCertifiedInvoiceQuery(params));
      if (res) {
        const { completeTime } = res;
        let checkState;
        if (completeTime) {
          checkState = '1';
        } else {
          checkState = '0';
        }
        const data = [
          {
            ...res,
            checkState,
          },
        ];
        batchInvoiceHeaderDS.loadData(data);
      }
    }
  }

  /**
   * 删除勾选发票
   */
  @Bind()
  handleDeleteBatchCheck() {
    const { batchInvoiceHeaderDS } = this.props;
    if (batchInvoiceHeaderDS) {
      batchInvoiceHeaderDS.delete(batchInvoiceHeaderDS.selected);
    }
  }

  // 点击扫码枪按钮
  @Bind()
  handleScanGun() {
    // 扫发票二维码对应字段
    let scanInput: TextField | null;
    const scanInvObjKeys = [
      'version',
      'invoiceType',
      'invoiceCode',
      'invoiceNo',
      'invoiceAmount',
      'invoiceDate',
      'checkCode',
      'crc',
    ];
    const { empInfo, batchInvoiceHeaderDS } = this.props;
    const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
    const ds = new DataSet({
      ...ScanGunModalDS(),
    });
    const handSave = async () => {
      const res = getResponse(await creatBatchNumber({ tenantId }));
      if (res) {
        const selectedList = ds.selected.map(rec => rec.toData());
        const result = getResponse(
          await batchScanGunInvoices({
            tenantId,
            batchNo: res,
            companyCode,
            companyId,
            employeeId,
            employeeNumber,
            checkResource: 'CODE_SCAN', // 扫码枪标识
            list: selectedList,
          })
        );
        if (result) {
          notification.success({
            description: '',
            message: intl.get('hzero.common.notification.success.save').d('保存成功'),
          });
          ModalPro.destroyAll();
          if (batchInvoiceHeaderDS) batchInvoiceHeaderDS.query();
        }
      }
    };
    const getFocus = () => scanInput?.focus();
    const handleScanInput = value => {
      const strArray = value ? value.split(',') : [];
      const invObj: any = {};
      if (value && value.trim()) {
        strArray.forEach((key, index) => {
          if (scanInvObjKeys[index] === 'invoiceDate') {
            invObj[scanInvObjKeys[index]] = `${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6)}`;
          } else {
            invObj[scanInvObjKeys[index]] = key;
          }
        });
        const { invoiceType, invoiceCode, invoiceNo, invoiceAmount, invoiceDate } = invObj;
        if (invoiceNo && invoiceDate) {
          const repeatRes = ds.toData().some((item: any) => {
            const { invoiceCode: itemInvoiceCode, invoiceNo: itemInvoiceNo } = item;
            return itemInvoiceCode === invoiceCode && itemInvoiceNo === invoiceNo;
          });
          if (repeatRes) {
            message.warning(
              intl.get(`${modelCode}.scanGun.invoiceCollected`).d('该发票已采集'),
              undefined,
              undefined,
              'top'
            );
            setTimeout(() => {
              scanInput!.value = '';
              getFocus();
            }, 300);
          } else {
            ds.create({ invoiceType, invoiceCode, invoiceNo, invoiceAmount, invoiceDate }, 0);
            setTimeout(() => {
              scanInput!.value = '';
              getFocus();
            }, 300);
          }
        } else {
          message.warning(
            intl.get(`${modelCode}.scanGun.invoiceCollectedProblem`).d('发票采集出现问题'),
            undefined,
            undefined,
            'top'
          );
          setTimeout(() => {
            getFocus();
          }, 300);
        }
      }
    };
    const ObBtn = observer((props: any) => {
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          icon={props.icon}
          funcType={FuncType.flat}
          disabled={!ds.selected.length}
        >
          {props.title}
        </Button>
      );
    });
    const saveButton = (
      <ObBtn
        icon="save"
        key="scanGunSave"
        title={intl.get('hzero.common.table.column.save').d('保存')}
        onClick={handSave}
      />
    );
    ModalPro.open({
      title: intl.get(`${modelCode}.button.scanCodeGunCollection`).d('扫码枪采集'),
      bodyStyle: { width: '700px', minHeight: '400px' },
      contentStyle: { width: '700px', minHeight: '400px' },
      children: (
        <div>
          <TextField
            style={{ width: '450px' }}
            placeholder={intl.get(`${modelCode}.scanGun.acceptData`).d('请点击此处接受扫码枪数据')}
            // onInput={handleScanInput}
            onChange={handleScanInput}
            valueChangeAction={ValueChangeAction.input}
            wait={200}
            ref={input => {
              scanInput = input;
            }}
          />
          <Table
            dataSet={ds}
            buttons={[saveButton, TableButtonType.delete]}
            columns={[
              {
                name: 'invoiceType',
                width: 150,
              },
              {
                name: 'invoiceCode',
              },
              {
                name: 'invoiceNo',
              },
              {
                name: 'invoiceDate',
              },
              {
                name: 'invoiceAmount',
              },
            ]}
            pagination={false}
          />
        </div>
      ),
      closable: true,
      resizable: true,
      footer: '',
    });
    setTimeout(() => {
      getFocus();
    }, 300);
  }

  // 批量发票勾选（取消）可认证发票: 按钮
  get buttons(): Buttons[] {
    const { empInfo } = this.props;
    const {
      companyId,
      companyCode,
      employeeId,
      employeeNum,
      taxpayerNumber,
      authorityCode,
    } = empInfo;
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
      },
      multiple: false,
      showUploadBtn: false,
      showPreviewImage: false,
      showUploadList: false,
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleUploadError,
    };
    const UploadButton = observer(() => {
      return (
        <Upload
          {...uploadProps}
          disabled={!companyId}
          accept={[
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
          ]}
          action={`${API_HOST}${HIVP_API}/v1/${tenantId}/batch-check/upload-certified-file?companyId=${companyId}&companyCode=${companyCode}&employeeId=${employeeId}&employeeNumber=${employeeNum}&taxpayerNumber=${taxpayerNumber}&taxDiskPassword=${taxDiskPassword}&authorityCode=${authorityCode}`}
        />
      );
    });
    const HeaderButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
        >
          {props.title}
        </Button>
      );
    });
    const TickButton = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.link}
        >
          {props.title}
        </Button>
      );
    });
    const DeleteButton = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          style={{ float: 'right', marginLeft: '0.08rem' }}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    const CurrentCheckInvoicesButton = observer((props: any) => {
      const { queryDataSet } = props.dataSet;
      const checkInvoiceCount = queryDataSet && queryDataSet.current?.get('checkInvoiceCount');
      const isDisabled = checkInvoiceCount !== 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          color={ButtonColor.primary}
          id="checkInvoice"
        >
          {props.title}
        </Button>
      );
    });
    const Tooltips = observer((props: any) => {
      const { queryDataSet } = props.dataSet;
      const checkInvoiceCount = queryDataSet && queryDataSet.current?.get('checkInvoiceCount');
      const title =
        checkInvoiceCount === 0
          ? '根据当前输入查询条件，实时获取可勾选发票并汇总'
          : '当前系统中存在请求中的发票，可在当期勾选可认证发票查看，请请求完成后再重新获取';
      return (
        <Tooltip title={title} placement="right">
          <Icon type="help_outline" className={styles.icon} />
        </Tooltip>
      );
    });
    const btnMenu = (
      <Menu>
        <MenuItem>
          <TickButton
            key="submitTickRequest"
            onClick={() => this.batchOperation()}
            dataSet={this.props.batchInvoiceHeaderDS}
            title={intl.get(`${modelCode}.button.submitTickRequest`).d('提交勾选')}
          />
        </MenuItem>
        <MenuItem>
          <TickButton
            key="submitCancelTickRequest"
            onClick={() => this.batchOperation()}
            dataSet={this.props.batchInvoiceHeaderDS}
            title={intl.get(`${modelCode}.button.submitCancelTickRequest`).d('取消勾选')}
          />
        </MenuItem>
      </Menu>
    );
    return [
      <UploadButton />,
      <HeaderButtons
        key="downloadFile"
        onClick={() => this.downLoad()}
        dataSet={this.props.batchInvoiceHeaderDS}
        title={intl.get('hivp.taxRefund.button.downloadFile').d('下载发票文件')}
      />,
      <HeaderButtons
        key="refresh"
        onClick={() => this.batchInvoiceRefresh()}
        dataSet={this.props.batchInvoiceHeaderDS}
        title={intl.get(`${modelCode}.button.batchRefresh`).d('刷新状态')}
      />,
      <CurrentCheckInvoicesButton
        key="getCurrentCheckInvoices"
        onClick={() => this.getCurrentCheckInvoices()}
        dataSet={this.props.batchInvoiceHeaderDS}
        title={intl.get(`${modelCode}.button.getCurrentCheckInvoices`).d('实时汇总可勾选发票')}
        type="getCurrentCheckInvoices"
      />,
      <Tooltips dataSet={this.props.batchInvoiceHeaderDS} />,
      <DeleteButton
        key="batchDelete"
        onClick={() => this.handleDeleteBatchCheck()}
        dataSet={this.props.batchInvoiceHeaderDS}
        title={intl.get('hzero.common.button.delete').d('删除')}
      />,
      <Dropdown overlay={btnMenu}>
        <Button color={ButtonColor.primary} style={{ float: 'right' }}>
          {intl.get(`${modelCode}.button.batchVerifiable`).d('勾选')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
      <Button
        color={ButtonColor.primary}
        funcType={FuncType.raised}
        style={{ float: 'right' }}
        onClick={() => this.handleScanGun()}
      >
        {intl.get(`${modelCode}.button.scanCodeGunCollection`).d('扫码枪采集')}
      </Button>,
    ];
  }

  // 批量发票勾选（取消）可认证发票: 行
  async batchOperation() {
    const { empInfo, batchInvoiceHeaderDS } = this.props;
    if (batchInvoiceHeaderDS) {
      const selectedList = batchInvoiceHeaderDS.selected.map(rec => rec.toData());
      const {
        companyId,
        companyCode,
        employeeNum: employeeNumber,
        employeeId,
        taxpayerNumber,
        authorityCode,
      } = empInfo;
      const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
      if (!taxDiskPassword) {
        return notification.warning({
          description: '',
          message: intl.get('hivp.checkCertification.notice.taxDiskPassword').d('请输入税盘密码！'),
        });
      }
      const params = {
        tenantId,
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        taxpayerNumber,
        taxDiskPassword,
        authorityCode,
        invoiceCheckCollects: selectedList,
      };
      const res = getResponse(await batchCheck(params));
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        batchInvoiceHeaderDS.query();
      }
    }
  }

  /**
   * 批量勾选发票明细
   */
  handleBatchInvoiceDetail(record, type) {
    const { history } = this.props;
    const recordData = record.toData();
    const { batchNumber, batchNo, requestTime, completeTime, invoiceCheckCollectId } = recordData;
    history.push({
      pathname: `/htc-front-ivp/check-certification/batch-check-detail/${invoiceCheckCollectId}/${type}`,
      search: queryString.stringify({
        batchInvoiceInfo: encodeURIComponent(
          JSON.stringify({
            batchNo,
            requestTime,
            completeTime,
            batchNumber,
          })
        ),
      }),
    });
  }

  get columns(): ColumnProps[] {
    return [
      { name: 'batchNo', width: 130 },
      {
        name: 'invoiceNum',
        width: 140,
        renderer: ({ value, record }) => {
          return this.commonRendererFn({ value, record });
        },
      },
      { name: 'totalInvoiceAmountGross', width: 120 },
      { name: 'totalInvoiceTheAmount', width: 120 },
      { name: 'checkResource' },
      {
        name: 'abnormalInvoiceCount',
        width: 150,
        className: styles.batchInvoice,
        align: ColumnAlign.left,
        renderer: ({ value, record }) => {
          if (value === 0) {
            return <span>非正常状态的发票不计入批量勾选，数量为：0</span>;
          } else {
            return (
              <div>
                <span>
                  非正常状态的发票不计入批量勾选，数量为：
                  <a onClick={() => this.handleBatchInvoiceDetail(record, 2)}>{value}</a>
                </span>
              </div>
            );
          }
        },
      },
      { name: 'batchNumber' },
      {
        name: 'failCount',
        width: 150,
        renderer: ({ value, record }) => {
          if (value === 0) {
            return <span>本次勾选失败份数：0</span>;
          } else {
            return (
              <div>
                <span>
                  本次勾选失败份数：
                  <a onClick={() => this.handleBatchInvoiceDetail(record, 0)}>{value}</a>
                </span>
                ;
              </div>
            );
          }
        },
      },
      { name: 'taxStatistics', width: 120 },
      { name: 'uploadTime', width: 160 },
      { name: 'requestTime', width: 160 },
      { name: 'completeTime', width: 160 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        command: ({ record }): Commands[] => {
          return [
            <a onClick={() => this.handleBatchInvoiceDetail(record, 1)}>
              {intl.get(`${modelCode}.button.batchInvoiceDetail`).d('查看明细')}
            </a>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  @Bind()
  handleUploadSuccess(response) {
    const { batchInvoiceHeaderDS } = this.props;
    if (batchInvoiceHeaderDS) {
      try {
        const multipleData = JSON.parse(response);
        const res = getResponse(multipleData);
        if (res) {
          notification.success({
            description: '',
            message: intl.get('hzero.c7nProUI.Upload.upload_success').d('上传成功'),
          });
          batchInvoiceHeaderDS.query();
        }
      } catch (err) {
        notification.error({
          description: '',
          message: err.message,
        });
      }
    }
  }

  @Bind()
  handleUploadError(response) {
    notification.error({
      description: '',
      message: response,
    });
  }

  @Bind()
  batchInvoiceQuery(dataSet) {
    const taxDiskPassword = this.props.companyAndPassword.current?.get('taxDiskPassword');
    dataSet.setQueryParameter('spmm', taxDiskPassword);
    dataSet.query();
  }

  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, buttons, dataSet } = props;
    const { batchInvoiceMoreDisplay } = this.state;
    return (
      <div style={{ marginBottom: '0.1rem' }}>
        <Row>
          <Col span={19}>
            {batchInvoiceMoreDisplay ? (
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
                    <Select name="checkState" />
                    <DateTimePicker name="requestTime" colSpan={2} />
                    <TextField name="batchNo" />
                    <Select name="checkResource" />
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
                      {intl.get('hivp.checkCertification.view.aggregateConditions').d('汇总条件')}
                    </b>
                  </h3>
                  <Form dataSet={queryDataSet} columns={3}>
                    <TextField name="tjyf" />
                    <TextField name="currentOperationalDeadline" />
                    <TextField name="checkableTimeRange" />
                    <Select name="currentCertState" />
                    <DatePicker name="rqq" />
                    <DatePicker name="rqz" />
                    <TextField name="xfsbh" />
                  </Form>
                </div>
              </div>
            ) : (
              <Form dataSet={queryDataSet} columns={3}>
                <Select name="checkState" />
                <TextField name="batchNo" />
                <Select name="lylx" />
              </Form>
            )}
          </Col>
          <Col span={5} style={{ textAlign: 'end' }}>
            <Button
              funcType={FuncType.link}
              onClick={() => this.setState({ batchInvoiceMoreDisplay: !batchInvoiceMoreDisplay })}
            >
              {batchInvoiceMoreDisplay ? (
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
            <Button color={ButtonColor.primary} onClick={() => this.batchInvoiceQuery(dataSet)}>
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
          </Col>
        </Row>
        {buttons}
        <div className="c7n-pro-table-header">
          {intl.get('hivp.taxRefund.table.DataSummary').d('数据汇总情况')}
        </div>
      </div>
    );
  }

  render() {
    const { batchInvoiceHeaderDS } = this.props;
    return (
      <>
        {batchInvoiceHeaderDS && (
          <Table
            buttons={this.buttons}
            dataSet={batchInvoiceHeaderDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            style={{ height: 320 }}
          />
        )}
      </>
    );
  }
}
