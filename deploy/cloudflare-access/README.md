# 100% 云原生后台登录配置指南（Cloudflare Zero Trust Access）

本项目已实现 **100% Serverless 云原生架构**（`Cloudflare Workers` + `D1` + `R2` + `Cloudflare Access`），**无需自建任何服务器、虚拟机、K8s 或数据库**，且在 Cloudflare Zero Trust 免费额度内（50 名用户以内永久免费）。

---

## 架构一览（全托管在 Cloudflare 边缘云）

```text
店主/店员访问 https://jianbingliu.uk/admin
        │
        ▼
[ Cloudflare Zero Trust 边缘登录页（可自定义煎饼刘 Logo 与配色） ]
   ├── 方式 1：邮箱一次性验证码（One-time PIN，免密防撞库，零配置）
   ├── 方式 2：Google / Apple / GitHub 社交账号一键登录（自带 Passkey / 2FA）
   └── 方式 3（可选）：挂载 Auth0 / ZITADEL Cloud 等全托管云原生 OIDC（账号+密码+Passkey）
        │
        ▼ 验证通过后注入加密签名的 Cf-Access-Jwt-Assertion
[ Cloudflare Workers (jian-bing-liu) ]
   └── src/lib/admin-auth.ts 拉取 Cloudflare JWKS 公钥完成二次签名校验 → 进入管理中心
```

---

## 5 分钟上线步骤（全程网页端完成，零运维）

### 第 1 步：配置登录方式与品牌外观
1. 登录 [Cloudflare Zero Trust 控制台](https://one.dash.cloudflare.com/)（首次进入会提示起一个 Team Name，即 `<你的-team-名称>.cloudflareaccess.com`，选择 **Free Plan**，无需扣费）。
2. 进入 **Settings → Authentication → Login methods**：
   - 默认已开启 **One-time PIN（邮箱验证码）**，开箱即用。
   - 如需一键登录，点击 **Add new** 可直接添加 **Google**、**GitHub**（或 **OpenID Connect** 对接 **Auth0 / ZITADEL Cloud** 免费云托管身份库，替代笨重的自建 Keycloak）。
3. *(可选)* 进入 **Settings → Custom Pages / Login Page**，上传煎饼刘的 `logo.svg`，将背景色设为宣纸暖白 `#fbf6ec`、主色设为朱砂红 `#b8251c`，打造专属品牌登录页。

---

### 第 2 步：创建 Access Application 保护 `/admin`
1. 进入 **Access → Applications → Add an application → Self-hosted**。
2. **Application name** 填写 `Jian Bing Liu Admin`，**Session Duration** 建议选 `1 week` 或 `1 month`（方便门店手机/iPad 日常免重复登录）。
3. 在 **Public Hostnames** 添加 **两条** 受保护路径：
   - Domain: `jianbingliu.uk` · Path: `admin*`
   - Domain: `jianbingliu.uk` · Path: `api/admin*`
4. 添加一条 **Access Policy**（例如命名为 `Store Staff`）：
   - **Action**: `Allow`
   - **Include → Emails**：填入你和店员的邮箱地址（只有白名单内的邮箱才能登录，陌生人即使拿到验证码或有 Google 账号也会在边缘被直接拒绝）。
5. 保存后，在应用详情页复制 **Application Audience (AUD) Tag**（一串 64 位十六进制字符）。

---

### 第 3 步：填入 `wrangler.jsonc` 并重新部署 Worker
打开项目根目录 [`wrangler.jsonc`](../../wrangler.jsonc)，在 `"vars"` 中加入这两个公开验签参数：

```jsonc
  "vars": {
    "NEXT_PUBLIC_SITE_URL": "https://jianbingliu.uk",
    "CF_ACCESS_TEAM_DOMAIN": "https://<你的-team-名称>.cloudflareaccess.com",
    "CF_ACCESS_AUD": "<复制的-64位-AUD-Tag>"
  },
```

然后执行一键云端发布：
```bash
pnpm cf:deploy
```

*(注：如果之前配置过旧的 `ADMIN_PASSWORD` Secret，可以顺手执行 `pnpm exec wrangler secret delete ADMIN_PASSWORD` 清理。同时建议在 Cloudflare Workers 设置里关闭默认的 `*.workers.dev` 预览域名，确保 100% 流量经过 `jianbingliu.uk` 自定义域名。)*

---

## 本地开发说明
平时在电脑本地运行 `pnpm dev` 修改后台界面时，在 `.env.local` 或 `.dev.vars` 中添加：
```ini
ADMIN_DEV_BYPASS=true
```
即可在 `NODE_ENV=development` 下免网关进入本地后台预览（生产环境会自动失效，绝对安全）。
