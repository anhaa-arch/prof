import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GraphQL', () => {
    it('should return GraphQL playground in development', () => {
      return request(app.getHttpServer())
        .get('/graphql')
        .expect(200);
    });
  });

  describe('Auth', () => {
    let accessToken: string;

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(input: { email: "admin@university.edu", password: "Admin123!" }) {
                accessToken
                user {
                  email
                  role
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.login).toBeDefined();
          expect(res.body.data.login.accessToken).toBeDefined();
          accessToken = res.body.data.login.accessToken;
        });
    });

    it('should fail login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(input: { email: "admin@university.edu", password: "wrongpassword" }) {
                accessToken
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
        });
    });
  });
});

