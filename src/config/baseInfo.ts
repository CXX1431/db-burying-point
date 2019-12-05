import { def } from '../types';

export const buryingPointType: { [propName: string]: def.commonInfo.IBuryingPointType } = {
  /** 页面访问 */
  pageAccess: 'pageAccess',
  /** 接口请求 */
  interfaceRequest: 'interfaceRequest',
  /** 用户操作 */
  userOperation: 'userOperation',
};

export const ajaxEventType = {
  ajaxLoadStart: 'ajaxLoadStart',
  ajaxLoadEnd: 'ajaxLoadEnd',
  ajaxLoadError: 'ajaxLoadError'
};