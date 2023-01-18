/*
 * @Description: 通用发票表格
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2023-01-05 17:06:17
 * @LastEditTime: 2023-01-18 10:30:09
 * @Copyright: Copyright (c) 2020, Hand
 */
import React from 'react';
import style from '../invoice-preview-css/FullElectricInvoice.module.less';

export default ({ lineData, buildingProjectName, buildingServicePlace }) => (
  <table style={{ textAlign: 'center' }}>
    <colgroup>
      <col style={{ width: '215px' }} />
      <col style={{ width: '233px' }} />
      <col style={{ width: '233px' }} />
      <col style={{ width: '145px' }} />
      <col style={{ width: '85px' }} />
      <col style={{ width: '145px' }} />
    </colgroup>
    <thead className={style.thead}>
      <tr>
        <th>
          <div>项目名称</div>
        </th>
        <th>
          <div>建筑服务发生地</div>
        </th>
        <th>
          <div>建筑项目名称</div>
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
            <td>{buildingServicePlace}</td>
            <td>{buildingProjectName}</td>
            <td>{item.amount}</td>
            <td>{item.taxRate}%</td>
            <td>{item.taxAmount}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
);
