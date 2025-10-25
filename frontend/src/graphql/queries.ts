import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
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
`;

export const GET_ME = gql`
  query GetMe {
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
    }
  }
`;

export const GET_MY_WORKS = gql`
  query GetMyWorks($page: Int, $size: Int) {
    myWorks(page: $page, size: $size) {
      data {
        id
        title
        abstract
        type
        journalName
        journalIndex
        year
        status
        creditBase
        createdAt
        authors {
          id
          authorName
          contributionPercent
          order
        }
      }
      total
      page
      size
      totalPages
    }
  }
`;

export const GET_WORK = gql`
  query GetWork($id: ID!) {
    work(id: $id) {
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
      createdAt
      updatedAt
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
        contentType
        size
        uploadedAt
      }
    }
  }
`;

export const CREATE_WORK = gql`
  mutation CreateWork($input: CreateWorkInput!) {
    createWork(input: $input) {
      id
      title
      status
    }
  }
`;

export const UPDATE_WORK = gql`
  mutation UpdateWork($id: ID!, $input: UpdateWorkInput!) {
    updateWork(id: $id, input: $input) {
      id
      title
      status
    }
  }
`;

export const SUBMIT_WORK = gql`
  mutation SubmitWork($id: ID!) {
    submitWorkForVerification(id: $id) {
      id
      status
    }
  }
`;

export const GET_MY_CREDITS = gql`
  query GetMyCredits($year: Int, $page: Int, $size: Int) {
    myCredits(year: $year, page: $page, size: $size) {
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
`;

export const GET_MY_TOTAL_CREDITS = gql`
  query GetMyTotalCredits($year: Int) {
    myTotalCredits(year: $year)
  }
`;

export const GET_MY_CREDITS_BREAKDOWN = gql`
  query GetMyCreditsBreakdown($year: Int) {
    myCreditsBreakdown(year: $year) {
      totalCredits
      byType
      byIndex
      byYear
      credits {
        id
        creditValue
        calculatedAt
        work {
          id
          title
          year
        }
      }
    }
  }
`;

export const GET_PENDING_VERIFICATIONS = gql`
  query GetPendingVerifications($page: Int, $size: Int) {
    pendingVerifications(page: $page, size: $size) {
      data {
        id
        title
        type
        journalName
        journalIndex
        year
        createdAt
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
`;

export const APPROVE_WORK = gql`
  mutation ApproveWork($workId: ID!, $note: String) {
    approveWork(input: { workId: $workId, note: $note }) {
      id
      status
    }
  }
`;

export const REJECT_WORK = gql`
  mutation RejectWork($workId: ID!, $note: String) {
    rejectWork(input: { workId: $workId, note: $note }) {
      id
      status
    }
  }
`;

export const GET_MY_ANNUAL_REPORT = gql`
  query GetMyAnnualReport($year: Int!) {
    myAnnualReport(year: $year) {
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
`;

export const GENERATE_MY_ANNUAL_REPORT = gql`
  mutation GenerateMyAnnualReport($year: Int!) {
    generateMyAnnualReport(year: $year) {
      id
      year
      totalCredits
    }
  }
`;

export const SEARCH_WORKS = gql`
  query SearchWorks($query: String!, $page: Int, $size: Int) {
    searchWorks(input: { query: $query }, page: $page, size: $size) {
      data {
        id
        title
        abstract
        type
        journalName
        journalIndex
        year
        authors {
          authorName
        }
      }
      total
      totalPages
    }
  }
`;

