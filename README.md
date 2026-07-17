# +V 表单或电话核对小工具

一个纯前端的本地/在线可用小工具，用来记录每日 +V 名单、标记表单或电话预约状态、判断是否精准，并生成每日或周期未约名单和精准名单。

## 功能

- 录入每日 +V 名单
- 本地数据库保存
- 按 +V 日期筛选本地数据库记录
- 模糊搜索 ID 并标记已约
- 标记是否精准：精准、不确定、不精准
- 分开标记是否约上电话、是否填表单，任意一项完成都会统计为已约
- 标记是否追踪：未追踪、已追踪1次、已追踪2次、已追踪3次、已追踪4次
- 生成每日未约名单和精准名单
- 生成周期统计、周期未约名单和周期精准名单
- 统计约成率、精准人数、精准率
- 支持撤回上一步数据库操作
- 支持 CSV 导入/导出
- 支持 Google Sheets 云同步
- 支持每 5 分钟自动拉取并上传云端数据
- 显示最新上传时间和最新双向同步时间

## 在线部署

这个项目是静态网页，只需要部署 `index.html`。

### GitHub Pages

1. 新建 GitHub 仓库，例如 `wechat-v-checker`。
2. 上传本项目里的文件：
   - `index.html`
   - `README.md`
   - `google-sheets-sync-apps-script.js`
3. 进入仓库 `Settings -> Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main`，目录选择 `/root`。
6. 保存后等待 GitHub Pages 生成网址。

部署完成后，访问地址通常是：

```text
https://你的用户名.github.io/wechat-v-checker/
```

## Google Sheets 云同步

网页本身只是前端，云数据库使用 Google Sheets + Google Apps Script。

### 设置步骤

1. 新建一个 Google Sheet。
2. 在表格中点击 `扩展程序 -> Apps Script`。
3. 复制 `google-sheets-sync-apps-script.js` 的全部代码进去。
4. 修改第一行：

```js
const SECRET = '换成你自己的同步密钥';
```

5. 点击 `部署 -> 新建部署`。
6. 类型选择 `Web 应用`。
7. 执行身份选择 `我`。
8. 访问权限选择 `任何知道链接的人`。
9. 部署后复制 Web App URL。
10. 回到网页顶部“云同步”区域，填写：
    - Google Apps Script 接口地址
    - 同步密钥
11. 第一次使用建议先点击“上传到云端”。
12. 其他设备打开网页后，填写同样配置，再点击“从云端拉取”。

## 使用注意

- 同步密钥不会写在网页源码里，只保存在当前浏览器本地。
- 如果勾选“自动同步本地改动”，每次改动会自动上传到云端。
- 如果勾选“每 5 分钟自动拉取并上传”，工具会定时把云端和本地数据合并，再上传合并后的数据库。
- 多人同时编辑时，最后上传的一方可能覆盖前一方数据，建议先单人使用。
- 更新 `google-sheets-sync-apps-script.js` 后，需要在 Apps Script 里重新部署新版本。
- `google-sheets-sync-apps-script.js` 不要直接公开真实密钥，上传到 GitHub 前请保持示例占位即可。
