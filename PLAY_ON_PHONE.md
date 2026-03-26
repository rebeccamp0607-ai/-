# 手机玩 Project MING — 操作指南

## 前提：手机和电脑在同一个 WiFi 下

---

## 第一步：启动后端（在电脑上）

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

> `--host 0.0.0.0` 是关键，让局域网内的手机能访问到

---

## 第二步：查看电脑的局域网 IP

**Mac / Linux：**
```bash
ipconfig getifaddr en0
# 或
ip addr | grep "inet " | grep -v 127
```

**Windows：**
```cmd
ipconfig
# 找 "IPv4 地址"，类似 192.168.1.xxx
```

---

## 第三步：启动前端（在电脑上）

```bash
cd frontend
npm install

# 把 API 地址改成你电脑的局域网 IP（替换 192.168.1.100）
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000/api/v1 npm run dev
```

前端启动后监听在：`http://0.0.0.0:3000`（所有网络接口）

---

## 第四步：手机打开

在手机浏览器（Safari / Chrome）输入：

```
http://192.168.1.100:3000
```

（把 `192.168.1.100` 换成你第二步查到的 IP）

---

## 可选：安装到手机桌面（像 App 一样）

**iPhone / Safari：**
1. 打开网址后，点底部分享按钮 □↑
2. 选「添加到主屏幕」
3. 确认 → 桌面出现「MING命」图标

**Android / Chrome：**
1. 打开网址后，点右上角菜单 ⋮
2. 选「添加到主屏幕」或「安装应用」

安装后全屏运行，没有浏览器地址栏，体验接近原生 App。

---

## 游戏流程

```
主页
├── 模拟人生  → 输入生辰八字 → 查看命盘 → 选择世界 → 开始
├── 无限轮回  → 直接选择世界 → 开始
└── 创世神模式 → 输入世界描述（AI 构建）→ 开始
          ↓
       日间：遇到事件，做选择（或输入自由意志，AI 实时裁判）
          ↓
    San 值 < 40% → 进入梦境副本（AI 生成叙事）
          ↓
    第二天继续……
```

---

## 如果 AI 功能没反应

检查 `.env` 文件里的 `AI_API_KEY` 是否填写正确：

```
AI_API_KEY=sk-你的key
AI_BASE_URL=https://api.siliconflow.cn/v1
```

重启 `uvicorn` 后生效。

---

## 游戏内不需要网络的功能（离线可用）

- 查看命盘（纯算法）
- 选择预设选项（本地事件库）
- 查看五行分布

需要 AI API 的功能：
- 创世神模式（自定义世界）
- 自由意志输入裁判
- 梦境叙事生成
