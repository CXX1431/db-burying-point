## 埋点功能点

1.前端路由变化监测：
  1）单页面：分 hash路由 和 browser路由 两种；
            hash路由：监测 load，hashchange 事件；
            browser路由： 监测 load, popstate, pushstate, replacestate 事件；
  2）多页面：通过监测 load 事件来获取路由变更信息；
2.接口请求监测：分 不监测、 全监测 和 特定路径监测；
3.用户操作监测（实现待考虑）


## 配置

1. 开启功能，选择性传入需要开启的功能
2. 数据提交不同类型返回数据处理（可选）
3. 数据提交接口，默认方式（img 方式提交数据）

## 通用返回格式

```ts
interface ICommonRes {
  /** 访问时间/请求时间/用户操作触发时间 */
  time: string | number;
  /** 设备名 */
  deviceName: string;
  /** 浏览器名 */
  browserName: string;
  /** 浏览器版本 */
  browserVersion: string;
  /** ip地址 */
  ipConfig: string;
  /** 用户标识码, 若用户传入该id好，则优先使用用户的，若没有则使用自动生成的 */
  userId: string;
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
  reportValue: string;
}
```