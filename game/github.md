# GitHub 版本管理

仓库使用 Git 管理源码、规则、构建脚本、测试与可运行页面；Git LFS 管理舰队二进制、GLB 模型和 HDR 素材。普通提交中保存小型 LFS 指针，运行时仍读取原始文件，资源哈希和冻结原版不变。

首次取得项目先安装 Git LFS，然后执行：

```powershell
git clone https://github.com/Furfur01/-.git galaxy-empire
cd galaxy-empire
git lfs install
git lfs pull
npm ci
npm start
```

更新与上传前：

```powershell
git pull --ff-only
git lfs pull
npm run build
npm test
git add -A
npm run check:git-size
git commit -m "说明本次改动"
npm run check:git-size -- --history
git push
```

`check:git-size` 检查索引中的普通 Git 对象与未忽略的大文件；`--history` 还检查当前分支可达历史。超过 100 MiB 会返回失败。LFS 文件必须通过 LFS 上传，不能跳过 LFS 钩子后只上传指针。

以下内容保留本地，不提交：

- `data/`：实际存档和本地会话。
- `output/`：录像、完整回放、隔离测试存档、截图、工具下载、Git 恢复备份。
- `opendesign/previews/`：带本机端口和临时战斗 ID 的启动页。
- `models/recovered/`：离线建模恢复材料；仅保留可编辑源模型的清单及两个 GLB，GLB 通过 LFS 管理。

不必删除这些本地文件。视频与原始验收指标通过本机播放器查看；当前玩法与构建方式见 [Three.js 说明](three-battle.md)。源码和已经复制到运行资源目录的模型、纹理仍随仓库提供。

2026-10-15 首次上传整理：GitHub 远端为空，旧的单次初始提交包含超限普通对象。先将原始历史保存并验证为 `output/git-backups/before-github-cleanup.bundle`，再重整初始提交。该 bundle 和 Codex 的本地恢复记录不上传。需要取回旧历史时，请在另一目录执行 `git clone <bundle路径>`，不要覆盖当前工作区。
