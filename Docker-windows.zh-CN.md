
# 安装 WSL2

## 打开 PowerShell（管理员）

右键开始菜单 → **Windows Terminal (Admin)**
或 **PowerShell (Admin)**

---

## 执行这一条命令

```powershell
wsl --install
```

---

## 重启后第一次启动 Ubuntu

开始菜单 → 搜索 **Ubuntu** → 打开

第一次会让你：

* 创建 Linux 用户名
* 设置密码

---

# Docker Desktop 使用 WSL2

## 设置 WSL2 backend

Docker Desktop → ⚙ Settings → **General**

✔ 勾选：

```
Use the WSL 2 based engine
```

点 **Apply & Restart**

---

## 开启 Ubuntu 的 WSL 集成

Docker Desktop → **Resources → WSL Integration**

✔ 勾选：

```
Enable integration with my default WSL distro
✔ Ubuntu
```

Apply & Restart

---

# 在 WSL2 里准备

**下面所有命令都在 Ubuntu 终端里执行**

## 更新基本工具

```bash
sudo apt update
sudo apt install -y git ca-certificates curl
```

---
