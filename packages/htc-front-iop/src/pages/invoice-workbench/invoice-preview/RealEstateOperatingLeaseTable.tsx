/*
 * @Description: 通用发票表格
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2023-01-05 17:06:17
 * @LastEditTime: 2023-01-11 15:18:19
 * @Copyright: Copyright (c) 2020, Hand
 */
import React from 'react';
import style from '../invoice-preview-css/FullElectricInvoice.module.less';

export default ({ lineData, areaUnitMeaning, houseOrRealEstate }) => (
  <table style={{ textAlign: 'center' }}>
    <colgroup>
      <col style={{ width: '153px' }} />
      <col style={{ width: '200px' }} />
      <col style={{ width: '80px' }} />
      <col style={{ width: '129px' }} />
      <col style={{ width: '129px' }} />
      <col style={{ width: '145px' }} />
      <col style={{ width: '95px' }} />
      <col style={{ width: '145px' }} />
    </colgroup>
    <thead className={style.thead}>
      <tr>
        <th>
          <div>项目名称</div>
        </th>
        <th>
          <div>房屋产权证书/不动产权证号</div>
        </th>
        <th>
          <div>面积单位</div>
        </th>
        <th>
          <div>数 量</div>
        </th>
        <th>
          <div>单 价</div>
        </th>
        <th>
          <div>金 额</div>
        </th>
        <th>
          <div>税率/征收率</div>
        </th>
        <th>
          <div>税 额</div>
        </th>
      </tr>
    </thead>
    <tbody className={style.color333}>
      {(lineData || []).map(item => {
        return (
          <tr>
            <td>{item.projectName}</td>
            <td>{houseOrRealEstate || '无'}</td>
            <td>{areaUnitMeaning || '无'}</td>
            <td>{item.quantity}</td>
            <td>{item.projectUnitPrice}</td>
            <td>{item.amount}</td>
            <td>{item.taxRate}%</td>
            <td>{item.taxAmount}</td>
          </tr>
        );
      })}
      ;
    </tbody>
  </table>
);
