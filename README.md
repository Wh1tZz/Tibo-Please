# Tibo-Please

一条可独立编辑、预览和导出的 Remotion 60FPS 动效源码。

动画从 ChatGPT 标志与文字开始，通过连续字形翻转过渡为 Codex，镜头推进至 Codex Logo 内部符号并自然接管为输入框，随后近景平滑跟随输入文字，直至语音与发送按钮进入画面。

## 下载后在 Remotion 中打开

需要先安装 [Node.js 20 或更高版本](https://nodejs.org/) 和 Git。

```bash
git clone https://github.com/Wh1tZz/Tibo-Please.git
cd Tibo-Please
npm ci
npm run studio
```

如果通过 GitHub 的 **Download ZIP** 下载，解压后进入 `Tibo-Please` 文件夹，从 `npm ci` 开始执行即可。

`npm` 只负责按照仓库中的 `package-lock.json` 安装固定版本依赖并调用项目内的 Remotion。启动 Studio 的等价直接命令是：

```bash
npx remotion studio
```

Remotion Studio 中的 Composition ID 为 `Tibo-Please`。

## 导出视频

```bash
npm run render
```

视频将输出到 `out/Tibo-Please.mp4`。

等价的 Remotion 直接命令为：

```bash
npx remotion render Tibo-Please out/Tibo-Please.mp4 --codec=h264
```

## 结构

- `src/TiboPlease.tsx`：完整动画、镜头和时间线
- `src/Root.tsx`：Composition 注册与默认文案
- `lib/`：字体加载与 30FPS 设计帧到 60FPS 输出帧的换算
- `public/brand/`：ChatGPT 与 Codex 所需视觉资源
- `public/fonts/`：渲染所需本地字体

## 说明

项目代码采用 MIT License。ChatGPT、Codex 及其品牌素材的商标和相关权利归其各自权利人所有。
