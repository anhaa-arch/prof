# API Examples

This document provides examples of GraphQL queries and mutations for the University Research & Credit Management System.

## Authentication

### Login

```graphql
mutation Login {
  login(input: {
    email: "admin@university.edu"
    password: "Admin123!"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      fullName
      role
      department {
        id
        name
      }
    }
  }
}
```

### Get Current User

```graphql
query Me {
  me {
    id
    email
    fullName
    role
    department {
      id
      name
      code
    }
    createdAt
    lastLogin
  }
}
```

## Works

### Get All My Works

```graphql
query MyWorks {
  myWorks(page: 1, size: 10) {
    data {
      id
      title
      abstract
      type
      journalName
      journalIndex
      doi
      year
      status
      creditBase
      createdAt
      authors {
        id
        authorName
        contributionPercent
        order
        isCorresponding
      }
    }
    total
    page
    totalPages
  }
}
```

### Get Work by ID

```graphql
query GetWork {
  work(id: "work-id-here") {
    id
    title
    abstract
    language
    type
    journalName
    journalIndex
    doi
    issn
    volume
    issue
    pages
    year
    publishedDate
    status
    creditBase
    creator {
      id
      fullName
    }
    authors {
      id
      authorName
      contributionPercent
      order
      isCorresponding
      user {
        id
        fullName
      }
    }
    files {
      id
      fileName
      size
      uploadedAt
    }
  }
}
```

### Create Work

```graphql
mutation CreateWork {
  createWork(input: {
    title: "Machine Learning in Research Management"
    abstract: "This paper explores ML applications..."
    language: "en"
    type: JOURNAL_ARTICLE
    journalName: "Journal of Academic Computing"
    journalIndex: SCOPUS
    doi: "10.1234/jac.2024.001"
    issn: "1234-5678"
    volume: "15"
    issue: "3"
    pages: "45-67"
    year: 2024
    authors: [
      {
        userId: "user-id-1"
        authorName: "Доржийн Бат"
        contributionPercent: 60
        order: 1
        isCorresponding: true
      },
      {
        userId: "user-id-2"
        authorName: "Болдын Сайхан"
        contributionPercent: 40
        order: 2
        isCorresponding: false
      }
    ]
  }) {
    id
    title
    status
    creditBase
  }
}
```

### Update Work

```graphql
mutation UpdateWork {
  updateWork(
    id: "work-id-here"
    input: {
      title: "Updated Title"
      abstract: "Updated abstract..."
      doi: "10.1234/updated"
    }
  ) {
    id
    title
    status
  }
}
```

### Submit Work for Verification

```graphql
mutation SubmitWork {
  submitWorkForVerification(id: "work-id-here") {
    id
    status
  }
}
```

### Search Works

```graphql
query SearchWorks {
  searchWorks(
    input: {
      query: "machine learning"
      filters: {
        journalIndex: SCOPUS
        year: 2024
      }
    }
    page: 1
    size: 20
  ) {
    data {
      id
      title
      abstract
      journalName
      year
      authors {
        authorName
      }
    }
    total
    totalPages
  }
}
```

## Verification (ESH/Admin only)

### Get Pending Verifications

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
      creator {
        id
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
    totalPages
  }
}
```

### Approve Work

```graphql
mutation ApproveWork {
  approveWork(input: {
    workId: "work-id-here"
    note: "Approved. All documentation is correct."
  }) {
    id
    status
  }
}
```

### Reject Work

```graphql
mutation RejectWork {
  rejectWork(input: {
    workId: "work-id-here"
    note: "Missing required documentation."
  }) {
    id
    status
  }
}
```

## Credits

### Get My Total Credits

```graphql
query MyTotalCredits {
  myTotalCredits(year: 2024)
}
```

### Get My Credits Breakdown

```graphql
query MyCreditsBreakdown {
  myCreditsBreakdown(year: 2024) {
    total
    byType
    byIndex
    byYear
  }
}
```

### Get My Credits List

```graphql
query MyCredits {
  myCredits(year: 2024, page: 1, size: 50) {
    data {
      id
      creditValue
      calculatedAt
      calculationDetail
      work {
        id
        title
        journalIndex
        year
      }
    }
    total
    totalPages
  }
}
```

### Calculate Credits for Work (Admin/ESH only)

```graphql
mutation CalculateCredits {
  calculateCreditsForWork(workId: "work-id-here") {
    id
    creditValue
    calculationDetail
    user {
      fullName
    }
  }
}
```

## Reports

### Get My Annual Report

```graphql
query MyAnnualReport {
  myAnnualReport(year: 2024) {
    id
    year
    totalCredits
    researchCredits
    teachingCredits
    serviceCredits
    generatedAt
    reportData
  }
}
```

### Generate Annual Report

```graphql
mutation GenerateMyReport {
  generateMyAnnualReport(year: 2024) {
    id
    year
    totalCredits
    researchCredits
    teachingCredits
    serviceCredits
    reportData
  }
}
```

## Users (Admin only)

### Get All Users

```graphql
query Users {
  users(filter: {
    role: PROFESSOR
    departmentId: "dept-id"
  }) {
    id
    email
    fullName
    role
    department {
      name
    }
    isActive
  }
}
```

### Create User

```graphql
mutation CreateUser {
  createUser(input: {
    email: "newuser@university.edu"
    password: "SecurePassword123!"
    fullName: "Шинэ Хэрэглэгч"
    role: LECTURER
    departmentId: "dept-id"
  }) {
    id
    email
    fullName
    role
  }
}
```

## Departments

### Get All Departments

```graphql
query Departments {
  departments {
    id
    name
    code
    head {
      fullName
    }
  }
}
```

### Get Department by ID

```graphql
query Department {
  department(id: "dept-id") {
    id
    name
    code
    head {
      id
      fullName
      email
    }
    users {
      id
      fullName
      role
    }
  }
}
```

## File Upload (REST Endpoint)

### Upload File

```bash
curl -X POST \
  http://localhost:4000/files/upload/work-id-here \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -F 'file=@/path/to/document.pdf'
```

### Get File Download URL

```bash
curl -X GET \
  http://localhost:4000/files/file-id-here/url \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

### Delete File

```bash
curl -X DELETE \
  http://localhost:4000/files/file-id-here \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

## Complete Flow Example

### 1. Login

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
      role
    }
  }
}
```

### 2. Create a Work

```graphql
mutation {
  createWork(input: {
    title: "Research on AI Applications"
    abstract: "This study examines..."
    language: "en"
    type: JOURNAL_ARTICLE
    journalName: "AI Journal"
    journalIndex: SCOPUS
    year: 2024
    authors: [
      {
        userId: "my-user-id"
        authorName: "My Name"
        contributionPercent: 100
        order: 1
        isCorresponding: true
      }
    ]
  }) {
    id
  }
}
```

### 3. Submit for Verification

```graphql
mutation {
  submitWorkForVerification(id: "work-id") {
    id
    status
  }
}
```

### 4. ESH Approves (ESH user)

```graphql
mutation {
  approveWork(input: {
    workId: "work-id"
    note: "Approved"
  }) {
    id
    status
  }
}
```

### 5. Check Credits

```graphql
query {
  myCredits(year: 2024) {
    data {
      creditValue
      work {
        title
      }
    }
  }
  myTotalCredits(year: 2024)
}
```

### 6. Generate Annual Report

```graphql
mutation {
  generateMyAnnualReport(year: 2024) {
    id
    totalCredits
    reportData
  }
}
```

## Error Handling

All mutations and queries return standard GraphQL errors:

```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

Common error codes:
- `UNAUTHENTICATED` - Not logged in
- `FORBIDDEN` - Insufficient permissions
- `BAD_USER_INPUT` - Validation error
- `NOT_FOUND` - Resource not found
- `INTERNAL_SERVER_ERROR` - Server error

## Rate Limiting

API is rate limited to:
- 100 requests per minute per IP
- 1000 requests per hour per user

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

