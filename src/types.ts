export declare namespace def {
  export namespace commonInfo {
    /** 设备信息 */
    export type IDeviceInfo = {
      /** 是否ios */
      ios?: boolean;
      /** 是否安卓 */
      android?: boolean;
      /** 是否iphone */
      iphone?: boolean;
      /** 是否ipad */
      ipad?: boolean;
      /** 是否安卓chrome */
      androidChrome?: boolean;
      /** 是否微信 */
      isWeixin?: boolean;
      /** 是否基于webView渲染 */
      webView?: RegExpMatchArray;
      /** 系统 */
      os?: string;
      /** 设备名 */
      deviceName?: string;
      /** 系统版本 */
      osVersion?: string;
      /** 浏览器名 */
      browserName?: string;
      /** 浏览器版本 */
      browserVersion?: string;
    };

    /** 埋点类型 */
    export type IBuryingPointType = 'pageAccess' | 'interfaceRequest' | 'userOperation';

    /** 埋点信息的通用参数 */
    export type ICommonConfig = {
      /** 访问时间/请求时间/用户操作触发时间 */
      time: string | number;
      /** 设备名 */
      deviceName: string;
      /** 浏览器名 */
      browserName: string;
      /** 浏览器版本 */
      browserVersion: string;
      /** ip地址 */
      ipConfig?: string;
      /** 用户标识码, 若用户传入该id好，则优先使用用户的，若没有则使用自动生成的 */
      userId?: string;
      /** 埋点类型,页面访问|接口请求|用户操作 */
      buryingPointType: 'pageAccess' | 'interfaceRequest' | 'userOperation';
      /** 页面路径/接口url */
      url?: string;
      /** 页面或操作的对应标识,若无对应，则为 url */
      desc?: string;
      /** 请求类型 */
      requestType?: string;
      /** 请求参数 JSON.stringify处理参数 */
      requestParams?: string;
      /** 请求code */
      requestCode?: number;
      /** 捕获的信息,或者数据 JSON.stringify处理 */
      value?: string;
    };
  }

  /** 分模块类型 */
  export namespace modules {
    /** 主模块构造函数参数 */
    export namespace index {
      /** 通用配置 */
      export type IDefaultCfg = {
        /** 受否上报该埋点信息 */
        filter?: (data: commonInfo.ICommonConfig) => commonInfo.ICommonConfig;
        shouldReport?: boolean
      };

      export interface IPageAccess extends IDefaultCfg {
        /** 访问页面类型，
         * normal:普通多页面形式，
         * hashrouter：采用Hashrouter的单页面应用，
         * browserRouter 为BrowserRouter的单页面应用 */
        type: 'normal' | 'hashRouter' | 'browserRouter'
      }
      export interface IInterfaceRequest extends IDefaultCfg {}
      export interface IUserOperation extends IDefaultCfg {}
      /** 埋点信息上传自定义方式 */
      export type reportCfg = (data: commonInfo.ICommonConfig) => void;
      /** 配置格式 */
      export type IConfig = {
        /** 页面访问，若为true，默认监测 普通页面访问模式 */
        pageAccess ?: boolean | IPageAccess;
        /** 接口请求 */
        interfaceRequest ?: boolean | IInterfaceRequest;
        /** 用户操作监控 */
        userOperation ?: boolean | IUserOperation;
      };
      /** 埋点配置 */
      export type IBuryingPointCfg = {
        config?: IConfig,
        reporter?: string | reportCfg
      }
    }
  }

  /** 函数类型 */
  export namespace fn {
    export type IEventCallback = (val?: commonInfo.ICommonConfig) => void;
  }
}