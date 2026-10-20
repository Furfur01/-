# v0.1.0-alpha.1 发布准备

2026-10-20。目标为 Windows 本地单机 Alpha：先保留本地提交和可运行 ZIP，再决定是否公开发行。

## 玩家不需要编译

发行包已包含构建好的页面、脚本、模型和音频。玩家安装 Node.js 24.x，解压后运行 `银河帝国.cmd`，启动后台并进入游戏；不需要 `npm install`、Git 或 Git LFS。升级与存档迁移见 [玩家说明](PLAYER-README.md)。

开发者从源码重建：

```powershell
npm ci
git lfs pull
npm run build
npm test
npm run package:alpha
```

Windows 打包使用现有 PowerShell / .NET ZIP 功能，没有新增打包依赖。产物位于 `output/releases/v0.1.0-alpha.1/<时间>/`，包含 `galaxy-empire-0.1.0-alpha.1-windows.zip` 和本地清单 `inventory.json`。ZIP 内有 `VERSION`、`release-manifest.json`、玩家说明、发行说明和依赖许可证。

本次最终候选位于 `output/releases/v0.1.0-alpha.1/2026-10-20T13-53-42.737Z/`：663 个文件，ZIP 327,488,292 字节（约 312.3 MiB）。后续重新打包会生成新目录，不覆盖已检查的候选包。

## 本轮完成的检查

- 完整前端构建成功；清理开发入口后重新构建正式界面。
- 统一 `npm test` 保留 18 项 P0 与少量 P1。首轮 17 项通过，新增回放用例因夹具未初始化 `world.battles` 失败；修正夹具后，该文件全部 3 项通过，其余 15 项结果仍有效。日志为 `minimal-tests.log` 和 `api-check.log`。
- 修复实际回放缺陷：服务端与回放入口原先遗漏 `spatial-v4/v5`，现在读取当前战斗记录。保留的 API 用例检查记录、帧和其他账号无权读取。
- ZIP 解压到全新临时目录，不使用源码目录或开发依赖。实际打开星图、建设并刷新恢复进度、加载和暂停／拖动战报回放；浏览器无运行异常及请求失败。另在世界准备完成、建筑镜头到位后检查银河和地表画面。
- 所有运行检查均使用非 8289 的独立端口、临时存档与会话，结束后关闭自己的服务并删除临时数据。

本机日志与操作结果保存在 `output/releases/v0.1.0-alpha.1/`；最终包复验为 `package-final-use.json`，截图在 `output/playwright/alpha-commit/`。这些记录不进入 Git 或发行包。当前统一检查的范围见 [tests/README.md](../../tests/README.md)。

## 测试收减与问题修复分开记录

已删除源码中的独立浏览器测试、基准平台、开发试玩接口、验证页面和预览服务；发行 ZIP 不含任何测试。今后仅允许统一入口中的 P0 与少量 P1，不恢复 P2/P3 防御测试。该约束已写入根目录 `AGENTS.md`。玩家靶场、正常回放及历史存档结算仍保留。

收减前的旧全集运行结果为 857 项、838 通过、19 失败，保存在 `unit-tests.log`。其中当前版本回放读取已修复；部分测试桩、暴击前提和旧模型／相机基线与现实现不一致。旧驾驶转向、轰炸舰与殖民舰喷口断言尚未完成产品层复核，作为 Alpha 已知待确认项保留。移除这些测试不代表其问题已修复，也不再宣称已通过旧性能或外观矩阵。

被清理的未提交开发文件已在本机归档：`output/releases/v0.1.0-alpha.1/source-cleanup/removed-development-tools.zip`；清单为同目录 `removed-files.txt`。归档不随源码或发行包分发。

## 公开发行前剩余一项

项目发布负责人需确认 APK 恢复资源、用户提供模型、贴图和音频的再分发条件，或替换无法确认权限的素材。依赖许可证已随包提供，素材清单与来源线索见 [ASSET-NOTICES.md](ASSET-NOTICES.md)。商业音效按其素材库许可随游戏分发，不单独发布素材库。

工业美术仍有过渡内容；大规模战斗与驾驶舱性能未作跨设备承诺。其余 Alpha 范围见 [发行说明](v0.1.0-alpha.1.md)。

## 推荐发行方式：GitHub Pre-release + Windows ZIP

确认上述素材条件并决定公开后：

1. 以已检查的本地提交为发布点，推送该提交。
2. 在 GitHub 仓库的 Releases 新建发行，标签用 `v0.1.0-alpha.1`，目标选择该提交；标题为“银河帝国 0.1 Alpha 1”。
3. 使用本目录的发行说明，上传已验证的 `galaxy-empire-0.1.0-alpha.1-windows.zip`，勾选 **Set as a pre-release**，不要设为稳定最新版。
4. 玩家下载上传的 Windows ZIP，不使用 GitHub 自动生成的 Source code 压缩包。

GitHub 的创建步骤见 [管理仓库发行版](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)。自动源码压缩包是否包含 LFS 实体取决于仓库设置；本项目的运行包已复制实际资源，见 [Git LFS 与源码归档](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-git-lfs-objects-in-archives-of-your-repository)。

当前准备操作只在本地进行，不推送、不打标签、不创建远程 Release。
