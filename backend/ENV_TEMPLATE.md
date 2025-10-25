# Backend Environment Variables Template

Энэ файлыг `backend/.env` гэж хуулаад тохируулна уу.

## Заавал шаардлагатай тохиргоо:

```bash
# Database
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/research_credit_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Authentication (⚠️ Эдгээр утгыг production дээр ЗААВАЛ солих!)
JWT_SECRET="your-super-secret-jwt-key-12345"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-67890"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=4000
NODE_ENV=development

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

## Хэрхэн тохируулах:

### 1️⃣ Файл үүсгэх:
```powershell
cd C:\tootsoolol\backend
notepad .env
```

### 2️⃣ Дээрх агуулгыг хуулж оруулах

### 3️⃣ `YOUR_PASSWORD`-г MySQL нууц үгээр солих

### 4️⃣ Хадгалах (Ctrl+S)

### 5️⃣ Backend restart:
```powershell
# Backend terminal дээр Ctrl+C
npm start
```

---

## ⚠️ Аюулгүй байдал:

### Production дээр JWT secret үүсгэх:

Node.js ашиглан:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

PowerShell ашиглан:
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes(32))
```

---

## 🧪 Тест хийх:

`.env` файл үүссэний дараа:
1. Backend restart хийнэ
2. Frontend дээр login хийнэ
3. `GetMyWorks` query ажиллах ёстой

---

## 📝 Нэмэлт тохиргоо (optional):

```bash
# File Storage (S3)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=research-files

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Security
BCRYPT_ROUNDS=10
```

