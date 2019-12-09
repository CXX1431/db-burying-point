import * as _ from 'lodash';
import { buryingPointType } from '../config/baseInfo';
import { DEVICE_INFO } from '../util';
import { def } from '../types';

export default function(callback?: def.fn.IEventCallback, config?: def.modules.index.IUserOperation){
  // 记录用户点击元素的行为数据
  document.onclick = function (e) {
    window.console.log('eeeee', e, _.get(e, 'path'));
    const result: def.commonInfo.ICommonConfig = {
      reporterTime: Date.now(),
      buryingPointType: buryingPointType.pageAccess,
      browserName: DEVICE_INFO.browserName,
      browserVersion: DEVICE_INFO.browserVersion,
      deviceName: DEVICE_INFO.deviceName,
      pageUrl: window.location.href,
      className: "",
      placeholder: "",
      inputValue: "",
      tagName: _.get(e, 'target.tagName', '')
    };

    if (_.get(e, 'target.tagName', '') != "svg" && _.get(e, 'target.tagName', '') != "use") {
      result.className = _.get(e, 'target.className', '');
      result.placeholder = _.get(e, 'target.placeholder', '');
      result.inputValue = _.get(e, 'target.value', '');
      result.innerText = _.get(e, 'target.innerText')? _.get(e, 'target.innerText').replace(/\s*/g, "") : "";
      // 如果点击的内容过长，就截取上传
      const length = _.get(result, 'innerText.length');
      if (length > 200){
        result.innerText = result.innerText.substring(0, 100) + "... ..." + result.innerText.substring(length - 99, length - 1);
      }
      result.innerText = result.innerText.replace(/\s/g, '');
    }

    callback && callback(result);
  }
}