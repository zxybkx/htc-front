/**
 * @Description:公用方法
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-15 15:32:53
 * @LastEditTime: 2021-03-16 17:49:20
 * @Copyright: Copyright (c) 2020, Hand
 */

/**
 * @name: getPresentMenu
 * @description: 获取当前菜单的信息
 * @return {object}
 */
export function getPresentMenu() {
  const state = window.dvaApp._store.getState();
  const { global } = state;
  const presentMenu = global.menuLeafNode.find((t) => {
    const pathLength = t.path.length;
    return t.path === global.activeTabKey.substr(0, pathLength);
  });
  return presentMenu || {};
}

/**
 * @name: base64toBlob
 * @description: base64toBlob
 * @return Blob
 */
export function base64toBlob(data) {
  const byteCharacters = atob(data);
  const byteArrays: any = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays);
}

/**
 * @name: phoneReg
 * @description: 手机正则校验
 * @return RegExp
 */
const phoneReg = new RegExp(
  /^134[0-8]\d{7}$|^13[^4]\d{8}$|^14[5-9]\d{8}$|^15[^4]\d{8}$|^16[6]\d{8}$|^17[0-8]\d{8}$|^18[\d]{9}$|^19[1,8,9]\d{8}$/
);
export { phoneReg };
