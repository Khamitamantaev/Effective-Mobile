import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const app = express();

const port = process.env.PORT

app.get('/', (req, res) => {
  res.send('Hello from Khammerson!')
})

app.listen(port, () => {
  console.log(`Efeective app listening on port ${port}`)
})