# Quick Start Guide

Энэ нь хамгийн хурдан эхлэх заавар юм.

## Prerequisites

Дараах зүйлс суулгасан байх:
- Node.js >= 18
- Docker Desktop
- npm >= 9

## 5 минутад эхлүүлэх

### 1. Repository татах

```bash
cd university-research-credit-system
```

### 2. Environment файл үүсгэх

```bash
cp .env.example .env
```

`.env` файлыг засах шаардлагагүй (development-д ашиглах default утгууд байна).

### 3. Docker services эхлүүлэх

```bash
docker-compose up -d mysql redis
```

Хүлээх: MySQL болон Redis бэлэн болтол (~30 секунд)

### 4. Backend суулгаж эхлүүлэх

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

Backend бэлэн: http://localhost:4000/graphql

### 5. Frontend суулгаж эхлүүлэх (шинэ terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend бэлэн: http://localhost:3000

## ✅ Амжилттай!

### Нэвтрэх:

1. Вэб хөтчөө http://localhost:3000 хаяг дээр нээ
2. Дараах нэвтрэх мэдээлэл ашигла:

**Admin:**
- Email: `admin@university.edu`
- Password: `Admin123!`

**Professor:**
- Email: `dorj.professor@university.edu`
- Password: `Prof123!`

**ESH User:**
- Email: `esh@university.edu`
- Password: `Esh123!`

## Дараагийн алхамууд

1. **Dashboard** - Нүүр хуудсаараа орж системтэй танилцах
2. **Create Work** - Шинэ бүтээл үүсгэх
3. **Submit** - Бүтээлээ баталгаажуулалтад илгээх
4. **ESH Login** - ESH хэрэглэгчээр нэвтрэж баталгаажуулах
5. **Credits** - Кредитүүдээ харах

## GraphQL Playground

GraphQL API-тай шууд харилцах:

1. Вэб хөтчөө http://localhost:4000/graphql хаяг дээр нээ
2. Дараах query-г туршиж үз:

```graphql
mutation {
  login(input: {
    email: "admin@university.edu"
    password: "Admin123!"
  }) {
    accessToken
    user {
      fullName
      role
    }
  }
}
```

## Troubleshooting

### MySQL холбогдохгүй байна

```bash
docker-compose logs mysql
docker-compose restart mysql
```

### Port ашиглагдаж байна

```bash
# MySQL port
lsof -ti:3306 | xargs kill -9

# Backend port  
lsof -ti:4000 | xargs kill -9

# Frontend port
lsof -ti:3000 | xargs kill -9
```

### Бүгдийг дахин эхлүүлэх

```bash
docker-compose down
docker-compose up -d mysql redis

cd backend
npm run start:dev

cd ../frontend
npm run dev
```

## Дараа нь уншихыг зөвлөж байна

- `README.md` - Дэлгэрэнгүй заавар
- `API_EXAMPLES.md` - GraphQL жишээнүүд
- `DEPLOYMENT.md` - Production deployment
- `PROJECT_SUMMARY.md` - Төслийн бүтэн тайлбар

## Тусламж хэрэгтэй юу?

- Logs шалгах: `docker-compose logs -f`
- Backend logs: `cd backend && npm run start:dev`
- Frontend logs: `cd frontend && npm run dev`

Баяр хүргэе! 🎉

