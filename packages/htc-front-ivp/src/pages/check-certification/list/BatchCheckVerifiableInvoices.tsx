/**
 * @Description:勾选认证-批量勾选可认证发票
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-09-23 14:26:15
 * @LastEditTime: 2022-09-20 13:49
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  DataSet,
  DatePicker,
  DateTimePicker,
  Dropdown,
  Form,
  Lov,
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
  creatBatchNumber,
  batchScanGunInvoices,
  unCertifiedInvoiceQuery,
  getCurPeriod,
} from '@src/services/checkCertificationService';
import withProps from 'utils/withProps';
import { getAccessToken, getResponse } from 'utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnAlign, ColumnLock, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import queryString from 'query-string';
import commonConfig from '@htccommon/config/commonConfig';
import { downLoadFiles } from '@htccommon/utils/utils';
import { API_HOST } from 'utils/config';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { Col, Icon, message, Row, Tag } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import { ValueChangeAction } from 'choerodon-ui/pro/lib/text-field/enum';
import BatchInvoiceHeaderDS from '../stores/BatchInvoiceHeaderDS';
import ScanGunModalDS from '../stores/ScanGunModalDS';
import InvoiceCategoryContext from './CommonStore';
import styles from '../checkcertification.less';

const { Item: MenuItem } = Menu;

const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();
const HIVP_API = commonConfig.IVP_API || '';

interface BatchCheckVerifiableInvoicesProps {
  companyAndPassword: DataSet;
  empInfo: any;
  currentPeriodData: any;
  history: any;
  batchInvoiceHeaderDS?: DataSet;
}

const BatchCheckVerifiableInvoices: React.FC<BatchCheckVerifiableInvoicesProps> = props => {
  const { batchInvoiceHeaderDS, empInfo, currentPeriodData, companyAndPassword, history } = props;
  const taxDiskPassword = companyAndPassword.current?.get('taxDiskPassword');
  const [showMore, setShowMore] = useState<boolean>(false);
  const { immediatePeriod, setImmediatePeriod } = useContext(InvoiceCategoryContext);

  const setCompanyObjFromProps = () => {
    if (batchInvoiceHeaderDS) {
      const { queryDataSet } = batchInvoiceHeaderDS;
      const currentPeriod = queryDataSet?.current?.get('currentPeriod');
      const { companyId } = empInfo;
      if (queryDataSet && queryDataSet.current) {
        queryDataSet.current!.set({
          companyObj: empInfo,
          authorityCode: empInfo.authorityCode,
        });
      }
      if (currentPeriod && companyId) batchInvoiceHeaderDS.query();
    }
  };

  const setCurrentPeriodFromProps = () => {
    if (batchInvoiceHeaderDS) {
      const { queryDataSet } = batchInvoiceHeaderDS;
      if (queryDataSet && queryDataSet.current) {
        const period = immediatePeriod || currentPeriodData;
        const {
          currentPeriod,
          currentOperationalDeadline,
          checkableTimeRange,
          currentCertState,
        } = period;
        const dateFrom = currentPeriod && moment(currentPeriod).startOf('month');
        const dateTo = currentPeriod && moment(currentPeriod).endOf('month');
        queryDataSet.current!.set({
          currentPeriod,
          currentOperationalDeadline,
          checkableTimeRange,
          currentCertState,
          entryAccountDateFrom: dateFrom,
          entryAccountDateTo: dateTo,
        });
      }
    }
  };

  useEffect(() => setCompanyObjFromProps(), [empInfo]);
  useEffect(() => setCurrentPeriodFromProps(), [currentPeriodData, immediatePeriod]);

  const handleUploadSuccess = response => {
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
  };

  const handleUploadError = response => {
    notification.error({
      description: '',
      message: response,
    });
  };

  const uploadProps = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      Authorization: `bearer ${getAccessToken()}`,
    },
    multiple: false,
    showUploadBtn: false,
    showPreviewImage: false,
    showUploadList: false,
    onUploadSuccess: handleUploadSuccess,
    onUploadError: handleUploadError,
  };

  const UploadButton = observer(() => {
    const {
      companyId,
      companyCode,
      employeeId,
      employeeNum,
      taxpayerNumber,
      authorityCode,
    } = empInfo;
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

  const HeaderButtons = observer((btnProps: any) => {
    const isDisabled = btnProps.dataSet!.selected.length === 0;
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={isDisabled}
        funcType={FuncType.flat}
      >
        {btnProps.title}
      </Button>
    );
  });

  const FreshButton = observer((btnProps: any) => {
    const { inChannelCode } = empInfo;
    const isDisabled = btnProps.dataSet!.selected.length === 0;
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={isDisabled}
        funcType={FuncType.flat}
        style={{
          display: ['AISINO_IN_CHANNEL', 'AISINO_IN_CHANNEL_PLUG'].includes(inChannelCode)
            ? 'inline'
            : 'none',
        }}
      >
        {btnProps.title}
      </Button>
    );
  });

  const TickButton = observer((btnProps: any) => {
    const isDisabled = btnProps.dataSet!.selected.length === 0;
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={isDisabled}
        funcType={FuncType.link}
      >
        {btnProps.title}
      </Button>
    );
  });

  const DeleteButton = observer((btnProps: any) => {
    const isDisabled = btnProps.dataSet!.selected.length === 0;
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={isDisabled}
        style={{ float: 'right', marginLeft: '0.08rem' }}
        color={ButtonColor.primary}
      >
        {btnProps.title}
      </Button>
    );
  });

  // 批量发票勾选（取消）可认证发票: 行
  const batchOperation = async () => {
    if (batchInvoiceHeaderDS) {
      const { queryDataSet } = batchInvoiceHeaderDS;
      const {
        companyId,
        companyCode,
        employeeId,
        employeeNum,
        taxpayerNumber,
        authorityCode,
      } = empInfo;
      const selectedList = batchInvoiceHeaderDS.selected.map(rec => rec.toData());
      if (queryDataSet) {
        const currentCertState = queryDataSet.current!.get('currentCertState');
        if (!taxDiskPassword) {
          return notification.warning({
            description: '',
            message: intl
              .get('hivp.checkCertification.notice.taxDiskPassword')
              .d('请输入税盘密码！'),
          });
        }
        if (!['0', '1'].includes(currentCertState)) {
          notification.warning({
            message: intl
              .get(`${modelCode}.validate.batchCheck`)
              .d('当前认证状态为“已统计/已确签"，不允许勾选'),
            description: '',
          });
        }
        const params = {
          tenantId,
          companyId,
          companyCode,
          employeeId,
          employeeNumber: employeeNum,
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
        // 更新所属期
        const periodRes = getResponse(await getCurPeriod({ tenantId, companyId }));
        if (periodRes) setImmediatePeriod(periodRes);
      }
    }
  };

  const btnMenu = (
    <Menu>
      <MenuItem>
        <TickButton
          key="submitTickRequest"
          onClick={() => batchOperation()}
          dataSet={batchInvoiceHeaderDS}
          title={intl.get(`${modelCode}.button.submitTickRequest`).d('提交勾选')}
        />
      </MenuItem>
      <MenuItem>
        <TickButton
          key="submitCancelTickRequest"
          onClick={() => batchOperation()}
          dataSet={batchInvoiceHeaderDS}
          title={intl.get(`${modelCode}.button.submitCancelTickRequest`).d('取消勾选')}
        />
      </MenuItem>
    </Menu>
  );

  const deductCheck = () => {
    if (batchInvoiceHeaderDS) {
      const { queryDataSet } = batchInvoiceHeaderDS;
      const selectedList = batchInvoiceHeaderDS.selected.map(rec => rec.toData());
      if (queryDataSet) {
        const currentCertState = queryDataSet.current!.get('currentCertState');
        if (
          !['0', '1'].includes(currentCertState) ||
          selectedList?.some(item => item.checkState === 'R')
        ) {
          notification.warning({
            message: intl
              .get(`${modelCode}.validate.deductCheck`)
              .d('当前认证状态为“已统计/已确签"、或存在勾选状态为“请求中”的数据，不允许抵扣勾选'),
            description: '',
          });
        }
      }
    }
  };

  const NoDeductButton = observer((btnProps: any) => {
    const isDisabled = btnProps.dataSet!.selected.length === 0;
    return (
      <Button
        key={btnProps.key}
        onClick={btnProps.onClick}
        disabled={isDisabled}
        funcType={FuncType.link}
      >
        {btnProps.title}
      </Button>
    );
  });

  const noDeductMenu = (
    <Menu>
      <MenuItem>
        <NoDeductButton
          key="noDeductCheck"
          onClick={() => deductCheck()}
          dataSet={batchInvoiceHeaderDS}
          title={intl.get(`${modelCode}.button.noDeductCheck`).d('不抵扣勾选')}
        />
      </MenuItem>
      <MenuItem>
        <NoDeductButton
          key="cancelNoDeductibleCheck"
          onClick={() => deductCheck()}
          dataSet={batchInvoiceHeaderDS}
          title={intl.get(`${modelCode}.button.cancelNoDeductibleCheck`).d('取消不抵扣勾选')}
        />
      </MenuItem>
    </Menu>
  );

  // 下载发票文件
  const downLoad = async () => {
    if (batchInvoiceHeaderDS) {
      const { companyId, companyCode, employeeId, employeeNum, taxpayerNumber } = empInfo;
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
        const fileList = [
          {
            data: res,
            fileName: `${taxpayerNumber}_${date}.xls`,
          },
        ];
        downLoadFiles(fileList, 1);
      }
    }
  };

  // 批量发票勾选（取消）可认证发票: 刷新状态
  const batchInvoiceRefresh = async () => {
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
  };

  /**
   * 删除勾选发票
   */
  const handleDeleteBatchCheck = () => {
    if (batchInvoiceHeaderDS) {
      batchInvoiceHeaderDS.delete(batchInvoiceHeaderDS.selected);
    }
  };

  // 点击扫码枪按钮
  const handleScanGun = () => {
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
    const ds = new DataSet({
      ...ScanGunModalDS(),
    });
    const handSave = async () => {
      const res = getResponse(await creatBatchNumber({ tenantId }));
      if (res) {
        const { companyId, companyCode, employeeId, employeeNum } = empInfo;
        const selectedList = ds.selected.map(rec => rec.toData());
        const result = getResponse(
          await batchScanGunInvoices({
            tenantId,
            batchNo: res,
            companyCode,
            companyId,
            employeeId,
            employeeNumber: employeeNum,
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
    const ObBtn = observer((btnProps: any) => {
      return (
        <Button
          key={btnProps.key}
          onClick={btnProps.onClick}
          icon={btnProps.icon}
          funcType={FuncType.flat}
          disabled={!ds.selected.length}
        >
          {btnProps.title}
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
  };

  const summarizeByCondition = async () => {
    if (batchInvoiceHeaderDS) {
      const { queryDataSet } = batchInvoiceHeaderDS;
      const checkableTimeRange = queryDataSet?.current!.get('checkableTimeRange');
      const invoiceDateFrom = queryDataSet?.current!.get('invoiceDateFrom');
      const invoiceDateEnd = queryDataSet?.current!.get('invoiceDateEnd');
      const xfsbh = queryDataSet?.current!.get('xfsbh');
      const qt = queryDataSet?.current!.get('tjyf');
      const { companyId, companyCode, employeeNum: employeeNumber, employeeId } = empInfo;
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
          invoiceDateFrom: invoiceDateFrom && invoiceDateFrom.format(DEFAULT_DATE_FORMAT),
          invoiceDateEnd: invoiceDateEnd && invoiceDateEnd.format(DEFAULT_DATE_FORMAT),
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
  };

  const batchButtons: Buttons[] = [
    <UploadButton />,
    <HeaderButtons
      key="downloadFile"
      onClick={() => downLoad()}
      dataSet={batchInvoiceHeaderDS}
      title={intl.get('hivp.taxRefund.button.downloadFile').d('下载发票文件')}
    />,
    <FreshButton
      key="refresh"
      onClick={() => batchInvoiceRefresh()}
      dataSet={batchInvoiceHeaderDS}
      title={intl.get(`${modelCode}.button.batchRefresh`).d('刷新状态')}
    />,
    <DeleteButton
      key="batchDelete"
      onClick={() => handleDeleteBatchCheck()}
      dataSet={batchInvoiceHeaderDS}
      title={intl.get('hzero.common.button.delete').d('删除')}
    />,
    <Dropdown overlay={btnMenu}>
      <Button color={ButtonColor.primary} style={{ float: 'right' }}>
        {intl.get(`${modelCode}.button.batchVerifiable`).d('勾选')}
        <Icon type="arrow_drop_down" />
      </Button>
    </Dropdown>,
    <Dropdown overlay={noDeductMenu}>
      <Button
        color={ButtonColor.primary}
        style={{
          float: 'right',
          display: ['ZK_IN_CHANNEL_DIGITAL', 'ZK_IN_CHANNEL'].includes(empInfo.inChannelCode)
            ? 'inline'
            : 'none',
        }}
      >
        {intl.get(`${modelCode}.button.noDeductCheck`).d('不抵扣勾选')}
        <Icon type="arrow_drop_down" />
      </Button>
    </Dropdown>,
    <Button
      color={ButtonColor.primary}
      funcType={FuncType.raised}
      style={{ float: 'right' }}
      onClick={() => handleScanGun()}
    >
      {intl.get(`${modelCode}.button.scanCodeGunCollection`).d('扫码枪采集')}
    </Button>,
    <Button
      color={ButtonColor.primary}
      funcType={FuncType.raised}
      style={{ float: 'right' }}
      onClick={() => summarizeByCondition()}
    >
      {intl.get(`${modelCode}.button.summarizeByCondition`).d('按条件汇总')}
    </Button>,
  ];

  const commonRendererFn = (value, record) => {
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
  };

  const handleBatchInvoiceDetail = (record, type) => {
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
            inChannelCode: empInfo.inChannelCode,
          })
        ),
      }),
    });
  };

  const columns: ColumnProps[] = [
    { name: 'batchNo', width: 130 },
    {
      name: 'invoiceNum',
      width: 140,
      renderer: ({ value, record }) => {
        return commonRendererFn(value, record);
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
                <a onClick={() => handleBatchInvoiceDetail(record, 2)}>{value}</a>
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
                <a onClick={() => handleBatchInvoiceDetail(record, 0)}>{value}</a>
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
          <a onClick={() => handleBatchInvoiceDetail(record, 1)}>
            {intl.get(`${modelCode}.button.batchInvoiceDetail`).d('查看明细')}
          </a>,
        ];
      },
      lock: ColumnLock.right,
      align: ColumnAlign.center,
    },
  ];

  const batchInvoiceQuery = dataSet => {
    dataSet.setQueryParameter('spmm', taxDiskPassword);
    dataSet.query();
  };

  const renderQueryBar = batchProps => {
    const { queryDataSet, buttons, dataSet } = batchProps;
    return (
      <div style={{ marginBottom: '0.1rem' }}>
        <Form dataSet={queryDataSet} columns={4}>
          <TextField name="currentPeriod" />
          <TextField name="checkableTimeRange" />
          <DatePicker name="currentOperationalDeadline" />
          <Select name="currentCertState" />
        </Form>
        <Row>
          <Col span={19}>
            {showMore ? (
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
                    <DatePicker name="invoiceDate" />
                    <Select name="entryAccountState" />
                    <DatePicker name="entryAccountDate" />
                    <Lov name="systemCodeObj" />
                    <Lov name="documentTypeCodeObj" />
                    <Lov name="documentNumberObj" />
                    <TextField name="salerName" />
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
            <Button funcType={FuncType.link} onClick={() => setShowMore(!showMore)}>
              {showMore ? (
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
            <Button color={ButtonColor.primary} onClick={() => batchInvoiceQuery(dataSet)}>
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
  };

  return (
    <>
      {batchInvoiceHeaderDS && (
        <Table
          buttons={batchButtons}
          dataSet={batchInvoiceHeaderDS}
          columns={columns}
          queryBar={renderQueryBar}
          style={{ height: 320 }}
        />
      )}
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
      const batchInvoiceHeaderDS = new DataSet({
        autoQuery: false,
        ...BatchInvoiceHeaderDS(),
      });
      return { batchInvoiceHeaderDS };
    },
    { cacheState: true }
  )(BatchCheckVerifiableInvoices)
);
