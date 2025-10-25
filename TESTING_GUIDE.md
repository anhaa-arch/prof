# 🧪 Систем шалгах гарын авлага

## 🔐 Нэвтрэх мэдээлэл

| Эрх | И-мэйл | Нууц үг | Тайлбар |
|-----|--------|---------|---------|
| **ADMIN** | `admin@university.edu` | `Admin123!` | Бүх эрхтэй, системийн админ |
| **ESH** | `esh@university.edu` | `Esh123!` | Эрдэм шинжилгээний хэлтэс, баталгаажуулалт |
| **PROFESSOR** | `dorj.professor@university.edu` | `Prof123!` | Профессор, бүтээл оруулах |

---

## 🌐 Системийн URL-үүд

| URL | Тайлбар |
|-----|---------|
| http://localhost:3000 | Frontend нүүр хуудас |
| http://localhost:3000/login | Нэвтрэх хуудас |
| http://localhost:3000/dashboard | Хянах самбар |
| http://localhost:3000/works | Бүтээлүүд |
| http://localhost:3000/works/new | Шинэ бүтээл нэмэх |
| http://localhost:3000/credits | Кредитүүд |
| http://localhost:3000/reports | Тайлан |
| http://localhost:3000/verification | Баталгаажуулалт (ESH/ADMIN) |
| http://localhost:3000/search | Хайлт |
| http://localhost:4000/graphql | GraphQL Playground (API) |

---

## 📋 Test Scenarios (Туршилтын хувилбарууд)

### 1️⃣ **PROFESSOR эрхээр нэвтрэх**

#### ✅ Нэвтрэх
1. http://localhost:3000 нээнэ үү
2. И-мэйл: `dorj.professor@university.edu`
3. Нууц үг: `Prof123!`
4. **Нэвтрэх** товч дарна

#### ✅ Dashboard шалгах
**Харах ёстой:**
- Профессорын нэр: "Доржийн Болд"
- Эрх: "PROFESSOR"
- Нийт бүтээл: 2 (Seed-с үүссэн)
- 2025 оны кредит: Харагдаж байх ёстой
- Сүүлийн бүтээлүүд: 2 бүтээл жагсаалт хэлбэрээр

**Navigation товчнууд:**
- ✅ Хянах самбар (Dashboard)
- ✅ Миний бүтээлүүд (Works)
- ✅ Кредитүүд (Credits)
- ✅ Тайлан (Reports)
- ✅ Хайх (Search)
- ❌ Баталгаажуулалт (харагдахгүй - зөвхөн ESH/ADMIN)

#### ✅ Миний бүтээлүүд (/works)
1. Dashboard-с **"Миний бүтээлүүд"** товч дарна
2. **Харах ёстой:**
   - Нийт: 2 бүтээл
   - Жагсаалт хэлбэрээр:
     - "Machine Learning Applications in Medical Diagnosis" - VERIFIED
     - "Quantum Computing Fundamentals" - PUBLISHED

**Үйлдлүүд:**
- ✅ **"+ Шинэ бүтээл"** товч байна
- ✅ Бүтээл дээр дарахад дэлгэрэнгүй харагдана
- ✅ Статус өнгөөр ялгагдана:
  - PUBLISHED = Ногоон
  - VERIFIED = Цэнхэр
  - SUBMITTED = Шар
  - REJECTED = Улаан
  - DRAFT = Саарал

#### ✅ Шинэ бүтээл нэмэх (/works/new) ⭐ ШИНЭ!
1. **"+ Шинэ бүтээл"** товч дарна эсвэл http://localhost:3000/works/new
2. **Форм харагдана** - Үндсэн мэдээлэл:
   - ✅ Гарчиг (заавал)
   - ✅ Хураангуй
   - ✅ Хэл (English/Монгол/Русс/Бусад)
   - ✅ Төрөл (Өгүүлэл/Бага хурал/Ном/Патент...)
   - ✅ Он (заавал)
   - ✅ Индекс (SCI/SCOPUS/LOCAL/NONE)
   - ✅ Сэтгүүлийн нэр
   - ✅ DOI, ISSN, Volume, Issue, Хуудас

3. **Зохиогчид нэмэх:**
   - ✅ Анхдагч 1 зохиогч байна (100%)
   - ✅ **"+ Зохиогч нэмэх"** товч дарж нэмэх
   - ✅ Нэр, Хувь (%), Эрэмбэ, Харилцагч зохиогч checkbox
   - ✅ **"Устгах"** товч дарж хасах
   - ⚠️ **Хувь нийлбэр 100% байх ёстой!**

4. **"Бүтээл үүсгэх"** товч дарна
5. **Амжилттай бол:**
   - ✅ "Бүтээл амжилттай үүслээ!" мессеж
   - ✅ /works хуудас руу redirect
   - ✅ Шинэ бүтээл DRAFT статустай жагсаалтанд харагдана

**Тест кейс:**
```
Гарчиг: "Test Article - AI in Healthcare"
Хураангуй: "Testing new work creation form"
Хэл: English
Төрөл: Өгүүлэл
Он: 2025
Индекс: SCOPUS
Сэтгүүл: "International Journal of AI"
DOI: 10.1234/test.2025
ISSN: 1234-5678

Зохиогч 1:
  Нэр: Доржийн Болд
  Хувь: 60%
  Эрэмбэ: 1
  Харилцагч: ✓

Зохиогч 2:
  Нэр: Болдын Батаа
  Хувь: 40%
  Эрэмбэ: 2
  Харилцагч: ✗
```

#### ✅ Кредитүүд (/credits)
1. **"Кредитүүд"** товч дарна
2. **Харах ёстой:**
   - Нийт кредит тоо
   - Жагсаалт:
     - Огноо
     - Бүтээлийн нэр
     - Кредит утга
     - Тооцооны дэлгэрэнгүй

#### ✅ Тайлан (/reports)
1. **"Тайлан"** товч дарна
2. **Харах ёстой:**
   - Он сонгох dropdown (2025, 2024, 2023...)
   - 4 карт:
     - Нийт кредит
     - SCI бүтээлүүд
     - SCOPUS бүтээлүүд
     - LOCAL бүтээлүүд
   - Дэлгэрэнгүй жагсаалт:
     - Бүтээл
     - Кредит
     - Огноо

#### ✅ Хайлт (/search)
1. **"Хайх"** товч дарна
2. Хайлтын талбарт "Machine Learning" гэж бичнэ
3. **"Хайх"** товч дарна
4. **Харах ёстой:**
   - Үр дүнгийн тоо
   - Олдсон бүтээлүүд:
     - Гарчиг
     - Хураангуй
     - Төрөл, Индекс, Он
     - Зохиогчид
     - Сэтгүүл

#### ✅ Гарах
1. Dashboard дээр **"Гарах"** товч дарна
2. Login хуудас руу буцна

---

### 2️⃣ **ESH эрхээр нэвтрэх**

#### ✅ Нэвтрэх
1. http://localhost:3000 нээнэ үү
2. И-мэйл: `esh@university.edu`
3. Нууц үг: `Esh123!`
4. **Нэвтрэх** товч дарна

#### ✅ Dashboard шалгах
**Харах ёстой:**
- ЭШХ-ийн нэр
- Эрх: "ESH"
- **Navigation дээр "Баталгаажуулалт" товч харагдана** ✅

#### ✅ Баталгаажуулалт (/verification)
1. **"Баталгаажуулалт"** товч дарна
2. **Харах ёстой:**
   - Хүлээгдэж буй бүтээлүүдийн тоо
   - Хэрэв бүтээл SUBMITTED төлөвтэй бол:
     - Гарчиг
     - Зохиогч
     - Тэнхим
     - Төрөл, Индекс, Сэтгүүл, Он
     - Хамтран зохиогчид (contribution %)

**Үйлдлүүд:**
- ✅ **"Дэлгэрэнгүй"** - бүтээлийн дэлгэрэнгүй харна
- ✅ **"Батлах"** - Confirm → Note оруулах (optional) → Батлагдана
- ✅ **"Татгалзах"** - Confirm → Шалтгаан оруулах (required) → Татгалзана

#### ✅ Бүтээл батлах тест (GraphQL Playground)
**Хэрэв SUBMITTED бүтээл байхгүй бол GraphQL-р үүсгэе:**

1. http://localhost:4000/graphql нээнэ
2. Эхлээд Professor-р нэвтэрч token авна:

```graphql
mutation {
  login(input: {
    email: "dorj.professor@university.edu"
    password: "Prof123!"
  }) {
    accessToken
    user {
      id
      fullName
    }
  }
}
```

3. Token-г HTTP Headers-д оруулна:
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
}
```

4. Шинэ бүтээл үүсгэнэ:

```graphql
mutation {
  createWork(input: {
    title: "Test Work for Verification"
    abstract: "This is a test abstract"
    language: ENGLISH
    type: ARTICLE
    journalName: "Test Journal"
    journalIndex: SCI
    year: 2025
    authors: [{
      authorName: "Доржийн Болд"
      contributionPercent: 100
      order: 1
      isCorresponding: true
    }]
  }) {
    id
    title
    status
  }
}
```

5. Бүтээлийг SUBMITTED төлөвт оруулна:

```graphql
mutation {
  submitWorkForVerification(id: "WORK_ID_FROM_PREVIOUS_STEP") {
    id
    status
  }
}
```

6. Одоо ESH-р нэвтэрч Verification хуудас руу орно
7. Шинэ бүтээл **"Хүлээгдэж буй бүтээлүүд"** дээр харагдана
8. **"Батлах"** эсвэл **"Татгалзах"** товч дарж туршина

---

### 3️⃣ **ADMIN эрхээр нэвтрэх**

#### ✅ Нэвтрэх
1. http://localhost:3000 нээнэ үү
2. И-мэйл: `admin@university.edu`
3. Нууц үг: `Admin123!`
4. **Нэвтрэх** товч дарна

#### ✅ Dashboard шалгах
**Харах ёстой:**
- Админы нэр: "System Admin"
- Эрх: "ADMIN"
- **Бүх хуудас руу хандах эрхтэй** ✅

#### ✅ Admin онцлог эрхүүд
- ✅ Бүх хэрэглэгчийн бүтээл үзэх
- ✅ Баталгаажуулалт хийх (ESH шиг)
- ✅ Бүх бүтээл засах/устгах
- ✅ Систем тохиргоо өөрчлөх (GraphQL-р)

---

## 🧪 GraphQL API тестлэх

### Нэвтрэх (Login)

```graphql
mutation Login {
  login(input: {
    email: "dorj.professor@university.edu"
    password: "Prof123!"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      fullName
      role
      department {
        name
      }
    }
  }
}
```

### Миний мэдээлэл авах (Get Me)

```graphql
query GetMe {
  me {
    id
    email
    fullName
    role
    department {
      name
      code
    }
  }
}
```

### Миний бүтээлүүд (My Works)

```graphql
query MyWorks {
  myWorks(page: 1, size: 10) {
    data {
      id
      title
      type
      journalIndex
      year
      status
      authors {
        authorName
        contributionPercent
      }
    }
    total
  }
}
```

### Миний кредитүүд (My Credits)

```graphql
query MyCredits {
  myCredits(page: 1, size: 50) {
    data {
      id
      creditValue
      calculatedAt
      work {
        title
        year
      }
    }
    total
  }
}
```

### Миний нийт кредит (My Total Credits)

```graphql
query MyTotalCredits {
  myTotalCredits(year: 2025)
}
```

### Тайлан (Credits Breakdown)

```graphql
query MyReport {
  myCreditsBreakdown(year: 2025) {
    totalCredits
    byType
    byIndex
    credits {
      creditValue
      calculatedAt
      work {
        title
      }
    }
  }
}
```

### Хайлт (Search Works)

```graphql
query SearchWorks {
  searchWorks(
    input: { query: "machine learning" }
    page: 1
    size: 10
  ) {
    data {
      id
      title
      abstract
      type
      journalIndex
      year
      authors {
        authorName
      }
    }
    total
  }
}
```

### Баталгаажуулалт - Хүлээгдэж буй бүтээлүүд (ESH/ADMIN)

```graphql
query PendingVerifications {
  pendingVerifications(page: 1, size: 20) {
    data {
      id
      title
      type
      journalName
      journalIndex
      year
      status
      creator {
        fullName
        department {
          name
        }
      }
      authors {
        authorName
        contributionPercent
      }
    }
    total
  }
}
```

### Бүтээл батлах (ESH/ADMIN)

```graphql
mutation ApproveWork {
  approveWork(input: {
    workId: "WORK_ID_HERE"
    note: "Шалгаж батлагдлаа"
  }) {
    id
    status
  }
}
```

### Бүтээл татгалзах (ESH/ADMIN)

```graphql
mutation RejectWork {
  rejectWork(input: {
    workId: "WORK_ID_HERE"
    note: "Баримт бичиг дутуу байна"
  }) {
    id
    status
  }
}
```

---

## ✅ Шалгах чек-лист

### Frontend хуудсууд
- [ ] Login хуудас ажиллаж байна
- [ ] Dashboard харагдаж байна
- [ ] Works хуудас харагдаж байна
- [ ] Works/new хуудас харагдаж байна
- [ ] Credits хуудас харагдаж байна
- [ ] Reports хуудас харагдаж байна
- [ ] Verification хуудас харагдаж байна (ESH/ADMIN)
- [ ] Search хуудас харагдаж байна
- [ ] Гарах товч ажиллаж байна

### Функцүүд
- [ ] Нэвтрэх/Гарах ажиллаж байна
- [ ] Бүтээл жагсаалт харагдаж байна
- [ ] Кредит тооцоо харагдаж байна
- [ ] Тайлан үүсч байна
- [ ] Хайлт ажиллаж байна
- [ ] Баталгаажуулалт ажиллаж байна (ESH/ADMIN)
- [ ] Navigation холбоосууд ажиллаж байна
- [ ] Эрх шалгалт ажиллаж байна (PROFESSOR баталгаажуулалт хуудас үзэхгүй)

### GraphQL API
- [ ] Login mutation ажиллаж байна
- [ ] Me query ажиллаж байна
- [ ] MyWorks query ажиллаж байна
- [ ] MyCredits query ажиллаж байна
- [ ] MyTotalCredits query ажиллаж байна
- [ ] MyCreditsBreakdown query ажиллаж байна
- [ ] SearchWorks query ажиллаж байна
- [ ] PendingVerifications query ажиллаж байна
- [ ] ApproveWork mutation ажиллаж байна
- [ ] RejectWork mutation ажиллаж байна

---

## 🎯 Бизнес процесс тест

### Scenario 1: Professor бүтээл оруулна → ESH батална → Кредит тооцогдоно

1. **Professor-р нэвтэрнэ** (`dorj.professor@university.edu` / `Prof123!`)
2. **Шинэ бүтээл үүсгэнэ** (GraphQL эсвэл /works/new хуудас)
3. **SUBMITTED төлөвт оруулна** (submitWorkForVerification mutation)
4. **Гарна**

5. **ESH-р нэвтэрнэ** (`esh@university.edu` / `Esh123!`)
6. **/verification хуудас руу орно**
7. **Шинэ бүтээлийг харна**
8. **"Батлах" товч дарна**
9. **Confirm → Note оруулна → Батлана**

10. **Professor-р дахин нэвтэрнэ**
11. **Dashboard эсвэл /credits хуудас руу орно**
12. **Шинэ кредит бичлэг үүссэнийг харна** ✅

### Scenario 2: Тайлан үүсгэх

1. **Professor-р нэвтэрнэ**
2. **/reports хуудас руу орно**
3. **2025 он сонгоно**
4. **Нийт кредит, SCI, SCOPUS, LOCAL тоо харагдана**
5. **Дэлгэрэнгүй жагсаалт харагдана**
6. **Өөр он сонгож харьцуулна** ✅

### Scenario 3: Хайлт хийх

1. **Аль ч эрхээр нэвтэрнэ**
2. **/search хуудас руу орно**
3. **"machine learning" гэж хайна**
4. **Холбогдох бүтээлүүд гарч ирнэ**
5. **Бүтээл дээр дарахад дэлгэрэнгүй харагдана** ✅

---

## 🚀 Хурдан шалгалт (Quick Test)

### 1 минутын тест:
```bash
1. http://localhost:3000 нээнэ
2. dorj.professor@university.edu / Prof123! - Нэвтрэх
3. Dashboard харна → ✅ 2 бүтээл харагдах ёстой
4. "Миний бүтээлүүд" → ✅ 2 бүтээл жагсаалт
5. "Кредитүүд" → ✅ Кредит харагдах ёстой
6. "Тайлан" → ✅ 2025 оны тайлан харагдах ёстой
7. "Хайх" → "machine" гэж хайх → ✅ Үр дүн гарах ёстой
8. Гарах → ✅ Login хуудас руу буцна
9. esh@university.edu / Esh123! - Нэвтрэх
10. "Баталгаажуулалт" → ✅ Хуудас харагдана (бүтээл байхгүй ч болно)
11. ✅ АМЖИЛТТАЙ!
```

---

## 📊 Seed өгөгдлийн мэдээлэл

### Үүссэн хэрэглэгчид:
- **Admin**: admin@university.edu (ADMIN эрх)
- **ESH**: esh@university.edu (ESH эрх)
- **Профессор Доржийн Болд**: dorj.professor@university.edu (PROFESSOR эрх)
- **Дэд профессор Болдын Батаа**: bold.professor@university.edu (PROFESSOR эрх)
- **Багш**: lecturer@university.edu (PROFESSOR эрх)

### Үүссэн бүтээлүүд (Доржийн Болд):
1. **"Machine Learning Applications in Medical Diagnosis"**
   - Төрөл: ARTICLE
   - Индекс: SCI
   - Он: 2024
   - Статус: VERIFIED
   - Кредит: Тооцогдсон

2. **"Quantum Computing Fundamentals"**
   - Төрөл: ARTICLE
   - Индекс: SCOPUS
   - Он: 2025
   - Статус: PUBLISHED
   - Кредит: Тооцогдсон

---

## ❗ Анхааруулга

- **Backend**: http://localhost:4000 root endpoint дээр 404 гарна - энэ **ХЭВИЙН!**
- **GraphQL Playground**: http://localhost:4000/graphql ашиглана
- **Token**: Login хийсний дараа accessToken-г HTTP Headers дээр оруулах хэрэгтэй:
  ```json
  {
    "Authorization": "Bearer YOUR_TOKEN_HERE"
  }
  ```

---

## 📞 Тусламж

Хэрэв ямар нэг хуудас эсвэл функц ажиллахгүй бол:

1. Browser Console-г нээж алдаа шалгана (F12)
2. Backend terminal дээр алдаа харна
3. Frontend terminal дээр алдаа харна
4. Database холболт ажиллаж байгааг шалгана

**Системийг дахин эхлүүлэх:**
```bash
# Бүх процесс зогсоох
taskkill /F /IM node.exe

# Backend эхлүүлэх
cd backend
npm start

# Frontend эхлүүлэх (шинэ terminal)
cd frontend
npm run dev
```

---

## ✅ Бүгд бэлэн! Туршиж эхлээрэй! 🚀

