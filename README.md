# ArcadeKit：30 秒接取小游戏模板

纯静态 HTML / CSS / JavaScript，无依赖、无构建。手机竖屏、触摸拖动、桌面鼠标与方向键都能玩。

- **完整游戏**：根目录 `index.html`，《弹幕接接乐》。移动小电视接住好弹幕、避开剧透和卡顿，30 秒结算。
- **模板示例**：`template/index.html`，《星星收集站》。展示同一运行时更换内容后的效果。

## 本地运行

可以直接双击 HTML。也可以在仓库目录启动静态服务：

```sh
python3 -m http.server 8044
```

游戏入口：`http://localhost:8044/`；模板入口：`http://localhost:8044/template/`。

## 操作与计分

在游戏区域左右移动鼠标，或用手指拖动角色；键盘支持 `←` / `→`、`A` / `D`。暂停按钮与 `Esc` 暂停/继续，切换窗口会自动暂停。

接住普通弹幕得 10–20 分，连续接住 5 个后获得 ×2 加成，10 个后 ×3。漏接目标或碰到障碍会中断连击；障碍扣除配置分数，最低为 0。每局 30 秒，结算显示称号、得分、接住目标数、最高连击、碰撞次数；最佳分数保存在当前浏览器。

## 文件结构

```text
index.html                完整示例游戏入口
content/game-config.js    弹幕接接乐内容配置
runtime/game.js           共用玩法运行时
runtime/style.css         共用界面样式
template/index.html       模板入口
template/config.js        新作品配置起点
```

## 快速制作新游戏

1. 复制仓库，保留 `runtime/`。
2. 将 `template/config.js` 的内容复制到 `content/game-config.js`，修改题材。
3. 修改标题、介绍、目标与障碍、角色颜色与表情、主题和结算称号。
4. 更换 `storageKey`，让新作品的最佳分数独立保存。
5. 打开 `index.html` 试玩即可。发布静态目录时不需要安装依赖。

配置字段：

| 字段 | 用途 |
| --- | --- |
| `title` / `subtitle` / `intro` | 游戏名称、介绍、开始页文案 |
| `duration` | 单局时长，单位秒 |
| `player` | 角色名称、颜色（6 位十六进制色值）、屏幕表情 |
| `targets` | 目标的 `text`、`color`、`points` |
| `obstacles` | 障碍的 `text`、`color`、`penalty` |
| `difficulty.startSpeed` / `endSpeed` | 开始与结束时的下落速度 |
| `difficulty.spawnStart` / `spawnEnd` | 开始与结束时的生成间隔，单位秒 |
| `difficulty.obstacleChance` | 每次生成障碍的概率，0–1 |
| `theme` | 强调色 `accent`、得分色 `mint`、场景底色 `background` |
| `ranks` | 按得分匹配的结算称号，包含最低分 `min`、`title`、`line`、`icon`；保留一个 `min: 0` |
| `storageKey` | 浏览器最佳分数存储名称 |

运行时直接读取配置，不需要 API、登录或外部素材。目标与障碍数组各放至少一项；颜色使用完整的 `#RRGGBB` 格式。文字建议 2–6 个中文字符。

## 轻量验证

```sh
node --check runtime/game.js
node --check content/game-config.js
node --check template/config.js
```

本仓库不配置测试框架、全量门禁或 CI。GitHub 仓库用于用户审阅；Bilibili Toy 和 VibeHub 发布在用户试玩确认后另行进行。

## 许可

MIT。界面、玩法代码与游戏文案为本项目原创，未使用外部图片、音频或字体文件。
