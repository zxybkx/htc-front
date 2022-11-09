/**
 * @Description:
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-03-23 15:40:29
 * @LastEditTime: 2022-06-13 17:53:29
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { FunctionComponent } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { isEmpty } from 'lodash';
import { Col, Row } from 'choerodon-ui';
import styles from '../invoiceWorkbench.module.less';

const invoiceVarietyConfig: any = {
  '0': intl.get('hzero.invoiceWorkbench.title.issuePreview').d('增值税专用发票'),
  '2': intl.get('hzero.invoiceWorkbench.title.issuePreview').d('增值税普通发票'),
  '41': intl.get('hzero.invoiceWorkbench.title.issuePreview').d('增值税普通发票（卷票）'),
  '51': intl.get('hzero.invoiceWorkbench.title.issuePreview').d('增值税电子普通发票'),
  '52': intl.get('hzero.invoiceWorkbench.title.issuePreview').d('增值税电子专用发票'),
};

interface Props {
  invoiceData: any;
}

/**
 * 渲染票面预览
 */
const IssuePreview: FunctionComponent<Props> = (props: Props) => {
  const { invoiceData } = props;
  const {
    invoiceVariety,
    totalExcludingTaxAmount,
    totalTax,
    totalPriceTaxAmount,
    lines,
    remark,
    userRemark,
    invoiceSourceType,
  } = invoiceData;
  let mark = '';
  if (['APPLY', 'RED_MARK', 'VOID', 'RED_INFO'].includes(invoiceSourceType)) {
    mark = userRemark && `${userRemark}`;
  } else if (remark) {
    if (userRemark) {
      mark = `${remark}${userRemark}`;
    } else {
      mark = `${remark}`;
    }
  } else if (userRemark) {
    mark = `${userRemark}`;
  }
  const title = invoiceVariety && invoiceVarietyConfig[invoiceVariety];
  const calcAmount = record => {
    const { taxIncludedFlag, amount, taxAmount } = record;
    // const taxRate = Number(record.taxRate) || 0;
    let amountWithoutTax = amount.toFixed(2);
    if (taxIncludedFlag === 1) {
      amountWithoutTax = (amount - taxAmount).toFixed(2);
    }
    return amountWithoutTax;
  };
  const calcUnitPrice = record => {
    const quantity = Number(record.quantity) || 0;
    const amountWithoutTax = calcAmount(record);
    if (quantity === 0) return;
    const unitPrice = amountWithoutTax / quantity;
    const x = unitPrice.toString().indexOf('.') + 1;
    const y = unitPrice.toString().length - x;
    if (y > 8) {
      return Number(unitPrice).toFixed(8);
    } else {
      return Number(unitPrice);
    }
  };
  const calcTaxRate = record => {
    const { taxRate } = record;
    if (taxRate === -1) {
      return '';
    } else {
      return `${Number(taxRate * 100).toString()}%`;
    }
  };
  const renderHeader = () => {
    return (
      <div className={styles.invoice_top}>
        <Row type="flex" align="bottom" style={{ height: '80px' }}>
          <Col span={8}>
            {totalPriceTaxAmount && totalPriceTaxAmount < 0 && (
              <div className={styles.negative}>
                <span>销 项 负 数</span>
              </div>
            )}
            {invoiceVariety === '2' && (
              <div style={{ textAlign: 'center' }}>
                <span style={{ marginRight: '90px' }}>校验码：</span>
              </div>
            )}
            {['51', '52'].includes(invoiceVariety) && <span>机器编号：</span>}
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <span className={styles.top_middle}>{title}</span>
            </div>
          </Col>
          <Col span={8}>
            <div>
              {['0', '2'].includes(invoiceVariety) && (
                <>
                  <div style={{ fontSize: '24px' }}>No</div>
                  <div style={{ textAlign: 'center' }}>开票日期：</div>
                </>
              )}
              {['51', '52'].includes(invoiceVariety) && (
                <>
                  <div>发票代码：</div>
                  <div>发票号码：</div>
                  <div>开票日期：</div>
                  <div>校&nbsp;验&nbsp;码：</div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </div>
    );
  };
  const amountTax = record => {
    const { taxIncludedFlag, amount, taxAmount } = record;
    let amountIncludeTax = amount.toFixed(2);
    if (taxIncludedFlag === 0) {
      amountIncludeTax = (amount + taxAmount).toFixed(2);
    }
    return amountIncludeTax;
  };
  const unitPriceTax = record => {
    const amountIncludeTax = amountTax(record);
    const quantity = Number(record.quantity) || 0;
    if (quantity === 0) return;
    const unitPrice = amountIncludeTax / quantity;
    const x = unitPrice.toString().indexOf('.') + 1;
    const y = unitPrice.toString().length - x;
    if (y > 8) {
      return Number(unitPrice).toFixed(8);
    } else {
      return Number(unitPrice);
    }
  };
  const thTitle = invoiceVariety === '52' ? '项目名称' : '货物或应税劳务、服务名称';
  return (
    <>
      {invoiceVariety === '41' ? (
        <>
          <div className={styles.ticketTile}>
            <div>
              <span>增值税普通发票（卷票）</span>
            </div>
            <div className={styles.ticketSubTit}>
              <span>发&emsp;票&emsp;联</span>
            </div>
          </div>
          <div className={styles.contain}>
            <table className={styles.ticketTable}>
              <tr>
                <td colSpan={4} className={styles.ticketLabel}>
                  发票代码：
                </td>
              </tr>
              <tr>
                <td colSpan={4} className={styles.ticketLabel}>
                  发票代码：
                </td>
              </tr>
              <tr>
                <td width="50%" className={styles.ticketLabel}>
                  机打号码：
                </td>
                <td className={styles.ticketLabel}>机器编号：</td>
              </tr>
              <tr>
                <td colSpan={4}>
                  <span className={styles.ticketLabel}>销售方名称：</span>
                  <span className={styles.ticketField}>{invoiceData.sellerName}</span>
                </td>
              </tr>
              <tr>
                <td colSpan={4}>
                  <span className={styles.ticketLabel}>纳税人识别号：</span>
                  <span className={styles.ticketField}>{invoiceData.sellerTaxpayerNumber}</span>
                </td>
              </tr>
              <tr>
                <td width="50%" className={styles.ticketLabel}>
                  开票日期：
                </td>
                <td>
                  <span className={styles.ticketLabel}>收款员：</span>
                  <span className={styles.ticketField}>{invoiceData.payeeName}</span>
                </td>
              </tr>
              <tr>
                <td colSpan={4}>
                  <span className={styles.ticketLabel}>购买方名称：</span>
                  <span className={styles.ticketField}>{invoiceData.buyerName}</span>
                </td>
              </tr>
              <tr>
                <td colSpan={4}>
                  <span className={styles.ticketLabel}>纳税人识别号：</span>
                  <span className={styles.ticketField}>{invoiceData.buyerTaxpayerNumber}</span>
                </td>
              </tr>
              <tr>
                <td colSpan={4}>
                  <table width="100%" style={{ marginTop: 20 }}>
                    <tr>
                      <td width="25%" className={styles.ticketLabel}>
                        项目
                      </td>
                      <td width="25%" className={styles.ticketLabel}>
                        数量
                      </td>
                      <td width="25%" className={styles.ticketLabel}>
                        含税单价
                      </td>
                      <td width="25%" className={styles.ticketLabel}>
                        含税金额
                      </td>
                    </tr>
                    {!isEmpty(lines) &&
                      lines.map(item => {
                        return (
                          <tr>
                            <td>{item.projectName}</td>
                            <td valign="top">{item.quantity}</td>
                            <td valign="top">{unitPriceTax(item)}</td>
                            <td valign="top">{amountTax(item)}</td>
                          </tr>
                        );
                      })}
                  </table>
                </td>
              </tr>
              <tr>
                <td colSpan={4}>
                  <table width="100%" style={{ marginTop: 40, whiteSpace: 'pre-wrap' }}>
                    <tr>
                      <td colSpan={4}>
                        <span className={styles.ticketLabel}>备注：</span>
                        <span className={styles.ticketField}>{mark}</span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4}>
                        <span className={styles.ticketLabel}>合计金额（小写）：</span>
                        <span className={styles.ticketField}>
                          {totalPriceTaxAmount && totalPriceTaxAmount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4}>
                        <span className={styles.ticketLabel}>合计金额（大写）：</span>
                        <span className={styles.ticketField}>
                          {invoiceData.totalPriceTaxAmountUpper}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className={styles.ticketLabel}>
                        校验码：
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        </>
      ) : (
        <div className={styles.background}>
          {renderHeader()}
          <div>
            <table className={styles.invoiceTable}>
              <tr>
                <td className={styles.topSide}>购买方</td>
                <td width="55%">
                  <span className={styles.label}>名&emsp;&emsp;&emsp;&emsp;称：</span>
                  <span className={styles.labelField}>{invoiceData.buyerName}</span>
                  <br />
                  <span className={styles.label}>纳税人识别号：</span>
                  <span className={styles.labelField}>{invoiceData.buyerTaxpayerNumber}</span>
                  <br />
                  <span className={styles.label}>地&nbsp;址、电&nbsp;话：</span>
                  <span className={styles.labelField}>{invoiceData.buyerCompanyAddressPhone}</span>
                  <br />
                  <span className={styles.label}>开户行及账号：</span>
                  <span className={styles.labelField}>{invoiceData.buyerBankNumber}</span>
                </td>
                <td className={styles.topSide}>密码区</td>
                <td />
              </tr>
            </table>
            <table className={styles.goodTable}>
              <tr style={{ textAlign: 'center' }}>
                <td width="30%">
                  <span className={styles.goodLabel}>{thTitle}</span>
                </td>
                <td width="10%">
                  <span className={styles.goodLabel}>规格型号</span>
                </td>
                <td width="5%">
                  <span className={styles.goodLabel}>单位</span>
                </td>
                <td width="10%">
                  <span className={styles.goodLabel}>数量</span>
                </td>
                <td width="10%">
                  <span className={styles.goodLabel}>单价</span>
                </td>
                <td width="15%">
                  <span className={styles.goodLabel}>金额</span>
                </td>
                <td width="5%">
                  <span className={styles.goodLabel}>税率</span>
                </td>
                <td width="15%">
                  <span className={styles.goodLabel}>税额</span>
                </td>
              </tr>
              {!isEmpty(lines) &&
                lines.map(item => {
                  return (
                    <tr key={item.invoicingOrderLineId} className={styles.goodInfo}>
                      <td width="30%" align="left">
                        <span>{item.projectName}</span>
                      </td>
                      <td width="10%" align="left">
                        <span>{item.model}</span>
                      </td>
                      <td width="5%" align="center">
                        <span>{item.projectUnit}</span>
                      </td>
                      <td width="10%" align="right">
                        <span>{item.quantity}</span>
                      </td>
                      <td width="10%" align="right">
                        <span>{calcUnitPrice(item)}</span>
                      </td>
                      <td width="15%" align="right">
                        <span>{calcAmount(item)}</span>
                      </td>
                      <td width="5%" align="right">
                        <span>{calcTaxRate(item)}</span>
                      </td>
                      <td width="15%" align="right">
                        <span>{item.taxAmount}</span>
                      </td>
                    </tr>
                  );
                })}
              <tr className={styles.total}>
                <td width="30%" align="center" className={styles.goodLabel}>
                  合计
                </td>
                <td width="10%" />
                <td width="5%" />
                <td width="10%" />
                <td width="10%" />
                <td width="15%" align="right">
                  <span>￥{totalExcludingTaxAmount}</span>
                </td>
                <td width="5%" />
                <td width="15%" align="right">
                  <span>￥{totalTax}</span>
                </td>
              </tr>
              <tr className={styles.goodBottom}>
                <td align="center" className={styles.goodLabel}>
                  价税合计（大写）
                </td>
                <td colSpan={4} style={{ borderRight: 'none' }}>
                  {invoiceData.totalPriceTaxAmountUpper}
                </td>
                <td colSpan={3}>
                  <span className={styles.goodLabel}>(小写)</span>
                  <span>￥{totalPriceTaxAmount && totalPriceTaxAmount.toFixed(2)}</span>
                </td>
              </tr>
            </table>
            <table className={styles.sellerInfo}>
              <tr>
                <td className={styles.topSide}>销售方</td>
                <td width="55%">
                  <span className={styles.label}>名&emsp;&emsp;&emsp;&emsp;称：</span>
                  <span className={styles.labelField}>{invoiceData.sellerName}</span>
                  <br />
                  <span className={styles.label}>纳税人识别号：</span>
                  <span className={styles.labelField}>{invoiceData.sellerTaxpayerNumber}</span>
                  <br />
                  <span className={styles.label}>地&nbsp;址、电&nbsp;话：</span>
                  <span className={styles.labelField}>{invoiceData.sellerCompanyAddressPhone}</span>
                  <br />
                  <span className={styles.label}>开户行及账号：</span>
                  <span className={styles.labelField}>{invoiceData.sellerBankNumber}</span>
                </td>
                <td className={styles.topSide}>备注</td>
                <td valign="top" style={{ padding: '0 4px' }}>
                  <span className={styles.remark}>{mark}</span>
                </td>
              </tr>
            </table>
            <table className={styles.bottomTable}>
              <tr>
                <td width="10%" align="right" className={styles.label}>
                  收款人：
                </td>
                <td width="15%" className={styles.labelField}>
                  {invoiceData.payeeName}
                </td>
                <td width="10%" align="right" className={styles.label}>
                  复核：
                </td>
                <td width="15%" className={styles.labelField}>
                  {invoiceData.reviewerName}
                </td>
                <td width="10%" align="right" className={styles.label}>
                  开票人：
                </td>
                <td width="15%" className={styles.labelField}>
                  {invoiceData.issuerName}
                </td>
                {invoiceVariety !== '52' && (
                  <td width="25%" className={styles.label}>
                    销售单位：（章）
                  </td>
                )}
              </tr>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default formatterCollections({
  code: ['hiop.invoiceWorkbench'],
})(IssuePreview);
