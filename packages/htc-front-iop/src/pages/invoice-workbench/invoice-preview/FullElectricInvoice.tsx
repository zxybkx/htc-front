/*
 * @Description: 全电专普票预览
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2023-01-04 15:54:20
 * @LastEditTime: 2023-01-11 15:47:38
 * @Copyright: Copyright (c) 2020, Hand
 */

import React, { FunctionComponent, ReactElement } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import SimpleTable from './SimpleTable';
import RealEstateOperatingLeaseTable from './RealEstateOperatingLeaseTable';
import ConstructionServicesTable from './ConstructionServicesTable';
import style from '../invoice-preview-css/FullElectricInvoice.module.less';

interface Props {
  invoiceData: any;
}
const invoiceVarietyConfig: any = {
  '81': '电子发票（增值税专用发票）',
  '82': '电子发票（普通发票）',
};
const IssuePreview: FunctionComponent<Props> = (props: Props) => {
  const formatDate = value => value && moment(value).format(DEFAULT_DATE_FORMAT);
  const { invoiceData } = props;
  const {
    purchaseInvoiceFlag,
    invoiceVariety,
    lines,
    areaUnitMeaning,
    houseOrRealEstate,
    buildingServicePlace,
    buildingProjectName,
    realEstateAddress,
    leaseTermFrom,
    leaseTermTo,
    leaseCrossCitySign,
    landVatItemNo,
    buildingCrossCitySign,
  } = invoiceData;
  let remarkDom: ReactElement | null = null;
  let headerLeftDom: ReactElement | null = null;
  let tableDom: ReactElement = <SimpleTable lineData={lines} />;
  if (purchaseInvoiceFlag === 6) {
    remarkDom = (
      <div className={style.remarkAdd}>
        <p>
          不动产地址：<span className={style.color333}>{realEstateAddress}</span>
        </p>
        <p>
          租赁期起止：
          <span className={style.color333}>
            {formatDate(leaseTermFrom)} {formatDate(leaseTermTo)}
          </span>
        </p>
        <p>
          跨地（市）标志：{' '}
          <span className={style.color333}>{leaseCrossCitySign === 'Y' ? '是' : '否'}</span>
        </p>
      </div>
    );
    headerLeftDom = <div className={style.invoiceInfoHeader__label}>不动产经营租赁服务</div>;
    tableDom = (
      <RealEstateOperatingLeaseTable
        lineData={lines}
        houseOrRealEstate={houseOrRealEstate}
        areaUnitMeaning={areaUnitMeaning}
      />
    );
  } else if (purchaseInvoiceFlag === '22') {
    remarkDom = (
      <div className={style.remarkAdd}>
        <p>
          土地增值税项目编号：<span className={style.color333}>{landVatItemNo}</span>
        </p>
        <p>
          跨地（市）标志：{' '}
          <span className={style.color333}>{buildingCrossCitySign === 'Y' ? '是' : '否'}</span>
        </p>
      </div>
    );
    headerLeftDom = <div className={style.invoiceInfoHeader__label}>建筑服务</div>;
    tableDom = (
      <ConstructionServicesTable
        lineData={lines}
        buildingProjectName={buildingProjectName}
        buildingServicePlace={buildingServicePlace}
      />
    );
  }
  return (
    <div className={style.tDialogBody}>
      <div className={style.tLoading__parent}>
        <div className={style.invoiceInfo}>
          {headerLeftDom}
          <div className={style.invoiceInfoHeader}>
            <div className={style.invoiceInfoHeader__title}>
              {invoiceVarietyConfig[invoiceVariety]}
            </div>
            <div className={style.invoiceInfoHeader__content}>
              <p>
                <span className={style.invoiceInfo__color}>发票号码：</span>-
              </p>
            </div>
          </div>
          <div className={style.invoiceInfo__body}>
            <div className={style.invoiceMain__header}>
              <div className={style.buyerInfo}>
                <div className={style.invoiceMain__header__lab}> 购买方信息</div>
                <div className={style.invoiceMain__header__container}>
                  <div className={style.invoiceMain__header__content}>
                    <p>
                      名称：
                      <span>{invoiceData.buyerName}</span>
                    </p>
                    <p>
                      统一社会信用代码/纳税人识别号：
                      <span>{invoiceData.buyerTaxpayerNumber}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className={style.sellerInfo}>
                <div
                  className={style.invoiceMain__header__lab}
                  style={{ borderLeft: '2px solid #a15f3b' }}
                >
                  销售方信息
                </div>
                <div className={style.invoiceMain__header__container}>
                  <div className={style.invoiceMain__header__content}>
                    <p>
                      名称：
                      <span>{invoiceData.sellerName}</span>
                    </p>
                    <p>
                      统一社会信用代码/纳税人识别号：
                      <span>{invoiceData.sellerTaxpayerNumber}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div>
                <div>
                  <div style={{ height: '260px' }}>{tableDom}</div>
                </div>
                <div className={style.invoiceMain__table__footer}>
                  <span style={{ left: '76px' }}>合计</span>
                  <span className={style.color333} style={{ right: '240px' }}>
                    ¥{invoiceData.totalExcludingTaxAmount.toFixed(2)}
                  </span>
                  <span className={style.color333} style={{ right: '46px' }}>
                    ¥{invoiceData.totalTax.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className={style.invoiceMain__table__price}>
                <span> 价税合计（大写）</span>
                <div>
                  <span className={style.color333}>{invoiceData.totalPriceTaxAmountUpper}</span>
                  <span>
                    （小写）
                    <span className={style.color333}>
                      {invoiceData.totalPriceTaxAmount.toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className={style.invoiceInfoFooter}>
                <div className={style.invoiceInfoFooter__body}>
                  <div className={style.invoiceInfoFooter__lab}>备注</div>
                  <div style={{ padding: '16px' }}>
                    {remarkDom}
                    <div className={style.color333}>{invoiceData.remark}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p style={{ padding: '16px 0 0 40px' }}>
            开票人：<span className={style.color333}>{invoiceData.issuerName}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['hiop.invoiceWorkbench'],
})(IssuePreview);
