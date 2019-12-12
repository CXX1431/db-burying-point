import * as _ from "lodash";
import pageAccess from "./modules/pageAccess";
import interfaceRequest from "./modules/interfaceRequest";
import userOperation from "./modules/userOperation";
import { restFulParam } from "./util";
import { def } from "./types";

export class DbBuryingPoint {
  /** 埋点信息发送的目标地址 */
  public reporterUrl: string = "";
  /** 埋点信息的发送函数，若有自定义的发送函数，则不需要使用上报地址了 */
  public reporter?: (data: def.commonInfo.ICommonConfig) => void = null;
  /** 埋点监听器 */
  public watchers = { pageAccess, interfaceRequest, userOperation };
  /** 埋点配置 */
  public config: def.modules.index.IConfig = {
    pageAccess: true,
    interfaceRequest: false,
    userOperation: false
  };

  constructor(buryingPoint?: def.modules.index.IBuryingPointCfg) {
    if (buryingPoint) {
      const { config, reporter } = buryingPoint;
      if (config) {
        this.config = config;
      }
      if (_.isString(reporter)) {
        this.reporterUrl = reporter;
      } else {
        this.reporter = reporter;
      }
    }
    this.install();
  }

  /** 安装相应的埋点功能 */
  public install() {
    Object.keys(this.watchers).forEach(key => {
      if (this.config[key]) {
        if (!_.isBoolean(this.config[key]) && !_.isEmpty(this.config[key])) {
          this.watchers[key](this.recordReceiver, this.config[key]);
        } else {
          this.watchers[key](this.recordReceiver);
        }
      }
    });
  }

  /** 接收器 */
  public recordReceiver = (data: def.commonInfo.ICommonConfig) => {
    let dt = data;
    if (
      !_.isBoolean(this.config) &&
      !_.isEmpty(_.get(this.config, "data.buryingPointType"))
    ) {
      const config: any = this.config[data.buryingPointType];
      const shouldReported: boolean = _.get(config, "shouldReport", true);
      if (!shouldReported) {
        return;
      }
      dt = config.filter ? config.filter(data) : data;
      if (_.isEmpty(dt)) {
        return;
      }
      if (this.reporter) {
        this.reporter(dt);
        return;
      }
    }
    this.defaultReporter(dt);
  };

  /** 默认上报请求 */
  public defaultReporter = (param: def.commonInfo.ICommonConfig) => {
    const img = new Image();
    const paramstr = restFulParam(param);
    img.src = `${this.reporterUrl}${paramstr ? "?" : ""}${paramstr}`;
    function loadFn() {
      removeEvt();
      img.remove();
    }
    function errFn() {
      window.console.log("上报失败：：", param);
      removeEvt();
      img.remove();
    }
    function removeEvt() {
      img.removeEventListener("load", loadFn);
      img.removeEventListener("abort", errFn);
      img.removeEventListener("cancel", errFn);
      img.removeEventListener("error", errFn);
    }

    img.addEventListener("load", loadFn);
    img.addEventListener("abort", errFn);
    img.addEventListener("cancel", errFn);
    img.addEventListener("error", errFn);
  };
}
