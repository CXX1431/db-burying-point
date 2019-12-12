/** 埋点监控器
 * @description 
 * 1.普通页面监测 onload 事件，
 * 2.spa页面监测 popstate 事件
 * 3.监测特定接口请求，获取请求操作信息
 */
import * as _ from 'lodash';
import { buryingPointType } from '../config/baseInfo';
import { DEVICE_INFO } from '../util';
import { def } from '../types';

export default function(callback?: def.fn.IEventCallback, config?: def.modules.index.IPageAccess) {

  function sendResult(){
    const result: def.commonInfo.ICommonConfig = {
      reporterTime: Date.now(),
      buryingPointType: buryingPointType.pageAccess,
      browserName: DEVICE_INFO.browserName,
      browserVersion: DEVICE_INFO.browserVersion,
      deviceName: DEVICE_INFO.deviceName,
      pageUrl: window.location.href,
    };
    callback && callback(result);
  }

  /** 指标埋点 */
  //多页面应用加载成功，单页面应用加载成功 的监测
  window.addEventListener(
    'load',
    function(e) {
      if(_.get(e,'target') && _.get(e,'target.readyState') === 'complete'){
          let oldUrl = window.location.href;
          this.sessionStorage.setItem('oldUrl', oldUrl);
          sendResult();
      }
    },
    true
  );

  if(_.get(config,'type') === 'hashRouter'){
    /** 监测单页面应用 hashrouter 的变化 */
    window.addEventListener(
      'hashchange',
      function(e) {
        let oldUrl = window.location.href;
        this.sessionStorage.setItem('oldUrl', oldUrl);
        sendResult();
      },
      true
    );

  } else if( _.get(config,'type') === "browserRouter"){
    //监测单页面应用browser路由
    window.addEventListener(
      'popstate',
      function(e) {
        let oldUrl = window.location.href;
        this.sessionStorage.setItem('oldUrl', oldUrl);
        sendResult();
      },
      true
    );

    // 监测 browser路由 的变更，即监测 pushstate/replacestate 事件，且pushState事件不能再路径相同的时候重复埋点
    let _wr = function(type: string) {
      let orig = history[type];
      return function() {
          let rv = orig.apply(this, arguments);
          let e = new Event(type);
          e['arguments'] = arguments;
          window.dispatchEvent(e);
          return rv;
      };
    };
    history.pushState = _wr('pushState');
    history.replaceState = _wr('replaceState');

    window.addEventListener('replaceState', function(e) {
      let oldUrl = window.location.href;
      this.sessionStorage.setItem('oldUrl', oldUrl);
      sendResult();
    });
    window.addEventListener('pushState', function(e) {
      let oldUrl = sessionStorage.getItem('oldUrl');
      let newUrl = window.location.href;
      if(newUrl !== oldUrl){
        sessionStorage.setItem('oldUrl', newUrl);
        sendResult();
      }
    });
  }
}
