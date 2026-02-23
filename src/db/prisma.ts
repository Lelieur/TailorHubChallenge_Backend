import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

export const prisma = new PrismaClient({
  accelerateUrl:
    process.env.DATABASE_URL ??
    'prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza192RVRvYUhxMTB2VXczZU01Wk8yWG4iLCJhcGlfa2V5IjoiMDFLSjVSMzc2QkMwQloyUFFSQVJXN0RXVjYiLCJ0ZW5hbnRfaWQiOiIyMGIyMmI5YjI2MjY0ZDRjMGVjNzgxOWM2Mjk3NzRhMWM3YTBlZDE0YjU0NmE1ZDZhYTkxMTViMjMyOTQ4ZDA2IiwiaW50ZXJuYWxfc2VjcmV0IjoiYjA1YzZkODQtMTFmYi00MGU2LTgzN2ItYTYxYTBiZGEwNmUyIn0.BrH1HGZ44GMWNCNild9YOLtnRWSbLyQ1ZPiVeB1N79o',
}).$extends(withAccelerate());
