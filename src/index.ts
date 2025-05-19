import express from "express";
import { PrismaClient } from "../generated/prisma";
import { Request, Response } from "express";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT;
app.use(express.json())

app.post("/appeal", async (req: Request, res: Response) => {
  const { topic, text } = req.body;
  if (!topic || !text) {
    return res.status(400).json({ error: "Topic and text are required" });
  }

  try {
    const appeal = await prisma.appeal.create({
      data: {
        topic,
        text,
      },
    });
    res.status(201).json(appeal);
  } catch (error) {
    res.status(500).json({ error: "Failed to create appeal" });
  }
});

app.listen(port, () => {
  console.log(`Efeective app listening on port ${port}`);
});
