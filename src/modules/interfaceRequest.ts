/** 接口请求埋点
 * 1.若配置为 false 或 [],则不进行接口监听
 * 2.若配置为 true,则所有接口全监听
 * 3.若为非空数组，则监听包含数组中请求路径的接口
 */
import * as _ from 'lodash';
import { DEVICE_INFO } from '../util';
import { def } from '../types';
import { ajaxEventType, buryingPointType } from '../config/baseInfo';
import { url } from 'inspector';

export default function(callback?: def.fn.IEventCallback, config?:def.modules.index.IInterfaceRequest) {
  const oldXHR = XMLHttpRequest;
  /** 时间事件数据记录 */
  let timeRecordArray: def.modules.request.ITimeRecord[] = [];

  function newXHR(): XMLHttpRequest {
    const realXHR = new oldXHR();
    const oldOpen = realXHR.open;
    realXHR.open = function(...args) {
      this.requestMethod = args[0];
      oldOpen.call(this, ...args);
    };
    const oldSend = realXHR.send;
    realXHR.send = function(body){
      this.requestParams = body? body.toString : '';
      oldSend.call(realXHR, body);
    }
    realXHR.onloadstart = function() {
      const startEvent = new CustomEvent(ajaxEventType.ajaxLoadStart, {
        /** 如果用箭头函数，这个this就需要具名指向realXHR */
        detail: this
      });
      window.dispatchEvent(startEvent);
    };
    realXHR.onloadend = function(){
      const endEvent = new CustomEvent(ajaxEventType.ajaxLoadEnd, {
        detail: this
      });
      window.dispatchEvent(endEvent);
    };
    realXHR.onerror = function() {
      const errEvent = new CustomEvent(ajaxEventType.ajaxLoadError,{
        detail: this
      });
      window.dispatchEvent(errEvent);
    };
    return realXHR;
  }

  function isUrlValid(requestUrl: string, config: def.modules.index.IInterfaceRequest){
     /** 若config为undefind则全埋点，或url为非空数组，拦截其中的路径，若存在不正确的 url数组，则不埋点 */
    if(!config){
      return true;
    } else {
      const urlList = _.get(config, 'url');
      let isValid = false;
      const isUrlListValid = urlList && _.isArray(urlList) && !_.isEmpty(urlList);
      if(isUrlListValid){
        urlList.forEach( (url: string) =>{
          if(requestUrl.indexOf(url) > -1){
            isValid = true;
          }
        });
      } 
      return isValid;
    }
  }

  function handleHttpResult(timeRecord: def.modules.request.ITimeRecord){
    const result: def.commonInfo.ICommonConfig = {
      reporterTime: timeRecord.timestamp,
      buryingPointType: buryingPointType.interfaceRequest,
      browserName: DEVICE_INFO.browserName,
      browserVersion: DEVICE_INFO.browserVersion,
      deviceName: DEVICE_INFO.deviceName,
      requestType: (timeRecord as any).event.detail.requestMethod,
      pageUrl: timeRecord.pageUrl,
      requestUrl:(timeRecord as any).event.detail.responseURL,
      requestParams: (timeRecord as any).event.detail.requestParams,
      requestCode: (timeRecord as any).event.detail.status,
      errorType: (timeRecord as any).event.detail.status === 200
        ? ''
        : 'TypeError: ' + (timeRecord as any).event.detail.statusText,
      errorMessage: (timeRecord as any).event.detail.status === 200
      ? ''
      : (timeRecord as any).event.detail.statusText,
    };

    callback && callback(result);
  }

  (window as any).XMLHttpRequest = newXHR;
  window.addEventListener(ajaxEventType.ajaxLoadStart, function(
    e: def.modules.request.IEventWithDetail<XMLHttpRequest>
  ) {
      timeRecordArray.push({
        timestamp: Date.now(),
        event: e,
        pageUrl: window.location.href,
        uploadFlag: false
      });
    // }
  });
  window.addEventListener(ajaxEventType.ajaxLoadEnd, function() {
    timeRecordArray.forEach(timeRecord => {
      /**如果uploadFlag为true，代表已经上传过了  */
      if(timeRecord.uploadFlag) {
        return ;
      }
      if(timeRecord.event.detail.status > 0) {
        timeRecord.uploadFlag = true;
        const requestUrl = timeRecord.event.detail.responseURL;
        if(isUrlValid(requestUrl, config)){
          handleHttpResult(timeRecord);
        }
      }
    });
    /** 清除已经处理的数据 */
    timeRecordArray = timeRecordArray.filter(item => !item.uploadFlag);
  });

  /** 处理fetch请求 */
  if('fetch' in window) {
    const oldFetch = window.fetch;
    window.fetch = function(
      input: RequestInfo,
      init?: RequestInit
    ): Promise<Response>{
      let opt: RequestInit = _.isString(input)? init: input;
      let requestUrl = _.isString(input)? input: input.url;
      const result: def.commonInfo.ICommonConfig = {
        /** 待完善需传送的信息属性 */
        reporterTime: Date.now(),
        buryingPointType: buryingPointType.interfaceRequest,
        browserName: DEVICE_INFO.browserName,
        browserVersion: DEVICE_INFO.browserVersion,
        deviceName: DEVICE_INFO.deviceName,
        pageUrl: window.location.href,
        requestUrl,
        requestType: _.get(opt, 'method', 'GET'),
        requestParams: _.get(opt, 'body', '').toString()
      };
      return new Promise(function(resolve, reject) {
        return oldFetch(input, init)
          .then(res => {
            result.requestCode = res.status;
            result.errorType = res.status === 200? '': 'TypeError: ' + res.statusText;
            result.errorMessage = res.status === 200? '': res.statusText;
            if(isUrlValid(_.get(result,'requestUrl'),config)){
              callback && callback(result);
            }
            resolve(res);
          })
          .catch(e => {
            result.requestCode = 404;
            result.errorType = e.stack;
            result.errorMessage = e.message;
            if(isUrlValid(_.get(result,'requestUrl'),config)){
              callback && callback(result);
            }
            reject(e);
          });
      });
    };
  }
}