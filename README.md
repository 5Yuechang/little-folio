# Little Folio

Shuo Yin / 尹硕的个人作品集公开版。包含视觉作品、Showreel、交互项目与经历摘要。

公开版不包含私人邮箱、手机号或完整简历。角色插画使用已有素材；个人分工为字体、排版和视觉合成。

## 本地预览

无需构建，使用 Python 启动静态服务：

```sh
python -m http.server 8765 --directory dist
```

打开 http://localhost:8765/ 。

## 更新与发布

修改 `dist/` 中的 HTML、CSS、JavaScript 与资源，提交至 `main` 后由 GitHub Actions 自动发布至 GitHub Pages。
发布前运行 `python scripts/check_public.py`，检查公开文件与资源引用。

作品信息在 `dist/artworks.json`，交互项目在 `dist/products.js`。视频按需加载，动效支持关闭与系统减少动态偏好。

网站代码与作品分别保留其原有权利；本仓库不授予第三方素材的再分发许可。
