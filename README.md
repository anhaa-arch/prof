# University Research & Credit Management System
## Эрдэм шинжилгээний бүртгэл, кредит тооцоолол

Энэ нь их сургуулийн багш, судлаачдын эрдэм шинжилгээний бүтээл (өгүүлэл, илтгэл, ном, патент)-ийг бүртгэж, хянаж, баталгаажуулж, автомат кредит тооцоолол хийдэг веб систем юм.

## 🚀 Технологийн стек

### Backend
- **Framework**: NestJS + TypeScript
- **API**: GraphQL (Apollo Server)
- **ORM**: Prisma
- **Database**: MySQL 8.0
- **Cache/Queue**: Redis + BullMQ
- **File Storage**: AWS S3 (эсвэл MinIO)
- **Auth**: JWT + Refresh Tokens

### Frontend
- **Framework**: Next.js 14 + TypeScript
- **UI Library**: React 18
- **GraphQL Client**: Apollo Client
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest, React Testing Library, Playwright

## 📋 Үндсэн модулиуд

1. **Users & Auth** - Хэрэглэгч, эрх (RBAC)
2. **Works** - Бүтээл бүртгэл (өгүүлэл, илтгэл, патент)
3. **Verification** - ЭШ албаны баталгаажуулалт
4. **Credits** - Кредит автомат тооцоолол
5. **Reports** - Жилийн тайлан, статистик
6. **Search** - Өгүүлэл хайх, шүүх

## 🏗️ Төслийн бүтэц

```
university-research-credit-system/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/       # Authentication & Authorization
│   │   │   ├── users/      # User management
│   │   │   ├── works/      # Works/publications
│   │   │   ├── credits/    # Credit calculation
│   │   │   ├── reports/    # Annual reports
│   │   │   └── files/      # File upload/storage
│   │   ├── common/         # Shared utilities
│   │   └── config/         # Configuration
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── test/               # Tests
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # App router
│   │   ├── components/     # React components
│   │   ├── graphql/        # GraphQL queries/mutations
│   │   ├── lib/            # Utilities
│   │   └── types/          # TypeScript types
│   └── public/             # Static files
├── docker-compose.yml      # Docker services
└── package.json            # Root package
```

## 🚦 Эхлүүлэх

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- MySQL 8.0 (эсвэл Docker ашиглана)

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd university-research-credit-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start services with Docker**
```bash
npm run docker:up
```

5. **Run database migrations**
```bash
npm run prisma:migrate
```

6. **Seed initial data**
```bash
cd backend
npm run seed
```

7. **Start development servers**
```bash
npm run dev
```

Backend GraphQL Playground: http://localhost:4000/graphql
Frontend: http://localhost:3000

## 🔑 Default Admin Credentials

After seeding:
- **Email**: admin@university.edu
- **Password**: Admin123!

## 📊 Database Schema

### Main Tables

- `users` - Хэрэглэгчид (багш, ЭШ алба, админ)
- `departments` - Тэнхимүүд
- `works` - Бүтээлүүд (өгүүлэл, илтгэл, патент)
- `work_authors` - Хамтарсан зохиогчид
- `work_files` - Файлууд (PDF, хавсралт)
- `credits` - Тооцоологдсон кредитүүд
- `annual_reports` - Жилийн тайлан
- `verification_logs` - Баталгаажуулалтын түүх
- `audit_logs` - Системийн audit log

## 🧮 Кредит тооцоолол

**Алгоритм**:
```
1. Суурь кредит = works.credit_base (Scopus=10, SCI=12, local=4, г.м.)
2. Зохиогчийн хувь = author_share = contribution_percent / SUM(contribution_percent)
3. Тухайн хүний кредит = credit_value = round(suurь_credit * author_share, 2)
```

**Жишээ**: 
- Суурь: 10 кредит
- 3 зохиогч: 40%, 35%, 25%
- Үр дүн: 4.0, 3.5, 2.5 кредит

## 🔐 Эрх (Roles)

- **ADMIN** - Системийн админ (бүх эрх)
- **ESH** - ЭШ албаны ажилтан (баталгаажуулалт)
- **PROFESSOR** - Профессор (өгүүлэл оруулах)
- **ASSOC_PROF** - Дэд профессор
- **SENIOR_LECTURER** - Ахлах багш
- **LECTURER** - Багш
- **TRAINEE** - Дадлагажигч багш
- **STUDENT** - Оюутан (харах эрх)

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🐳 Docker Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
docker-compose logs -f

# Prisma Studio (DB GUI)
npm run prisma:studio
```

## 📦 Build & Deploy

```bash
# Build all
npm run build

# Production Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 📖 API Documentation

GraphQL Playground: http://localhost:4000/graphql

### Sample Queries

```graphql
# Get all works
query {
  works(filter: { status: PUBLISHED }, page: 1, size: 10) {
    edges {
      node {
        id
        title
        journalIndex
        year
        authors {
          authorName
          contributionPercent
        }
      }
    }
  }
}

# Get user credits
query {
  credits(userId: "user-id", year: 2024) {
    creditValue
    work {
      title
    }
  }
}
```

## 🔄 Development Workflow

1. Create feature branch
2. Make changes
3. Run tests: `npm run test`
4. Commit with meaningful message
5. Push and create PR
6. CI/CD runs automatically
7. After approval, merge to main

## 📝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

Proprietary - University Internal Use Only

## 👥 Team

Developed for University Research Management

## 📞 Support

For issues and questions, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: October 2025

