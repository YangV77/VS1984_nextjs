# Install WSL2

## Open PowerShell (Administrator)

Right-click the Start menu → **Windows Terminal (Admin)**
or **PowerShell (Admin)**

---

## Run the following command

```powershell
wsl --install
```

---

## First launch of Ubuntu after reboot

After restarting Windows:

Start menu → search for **Ubuntu** → open it

On first launch, you will be asked to:

* Create a Linux username
* Set a password

---

# Configure Docker Desktop to use WSL2

## Enable the WSL2 backend

Open **Docker Desktop** → ⚙ **Settings** → **General**

✔ Check:

```
Use the WSL 2 based engine
```

Click **Apply & Restart**

---

## Enable WSL integration for Ubuntu

Docker Desktop → **Resources → WSL Integration**

✔ Check:

```
Enable integration with my default WSL distro
✔ Ubuntu
```

Click **Apply & Restart**

---

# Prepare the environment inside WSL2

**All commands below should be executed inside the Ubuntu terminal**

## Update basic tools

```bash
sudo apt update
sudo apt install -y git ca-certificates curl
```

---
