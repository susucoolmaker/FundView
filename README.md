# 商户资金看板

面向企业微信工作台的移动端 H5 查询 Demo，提供商户共享钱包余额、门店资金记录、保证金和销售明细查询。

## 启动

```bash
npm install
npm run dev
```

## 验证

```bash
npm test
npm run build
```

项目使用 Vue 3、TypeScript、Vant 4、Pinia 和本地强类型 Mock 数据。默认访问地址为 `/dashboard`，可从页面底部导航进入明细和我的页面。

## HTML 文件说明

- `index.html`：项目工程入口，给前端开发、GitHub 上传和正式部署使用。
- `打开预览.html`：本地双击预览文件，由 `npm run build` 自动生成，不作为开发源文件。

如果只是想在文件夹里直接看效果，双击 `打开预览.html`。如果误点了 `index.html`，它也会在本地自动跳到 `打开预览.html`。

以后每次修改项目后，请重新执行：

```bash
npm run build
```

这样正常项目代码和本地双击预览文件会一起更新。

## 首版范围外

- 登录、企业微信 JS-SDK 与单点登录
- 真实接口、服务端分页与文件存储
- 真实权限鉴权和资金操作能力
- 趋势图、报表导出、消息推送和多商户切换
