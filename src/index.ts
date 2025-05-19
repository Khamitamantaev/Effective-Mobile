import express from "express";
import { PrismaClient } from "../generated/prisma";
import { Request, Response } from "express";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT;
app.use(express.json());

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

app.patch("/appeal/progress/:id", async (req: Request, res: Response) => {
  const data = req.params;
  try {
    const appeal = await prisma.appeal.update({
      where: { id: parseInt(data.id) },
      data: { status: "IN_PROGRESS" },
    });

    if (!appeal) {
      return res.status(404).json({ error: "Appeal not found" });
    }

    res.json(appeal);
  } catch (error) {
    res.status(500).json({ error: "Failed to start processing appeal" });
  }
});

app.patch("/appeal/complete/:id", async (req: Request, res: Response) => {
  const data = req.params;
  try {
    const appeal = await prisma.appeal.update({
      where: { id: parseInt(data.id) },
      data: { status: "COMPLETED" },
    });

    if (!appeal) {
      return res.status(404).json({ error: "Appeal not found" });
    }

    res.json(appeal);
  } catch (error) {
    res.status(500).json({ error: "Failed to start complete appeal" });
  }
});

app.patch("/appeal/cancel/:id", async (req: Request, res: Response) => {
  const data = req.params;
  try {
    const appeal = await prisma.appeal.update({
      where: { id: parseInt(data.id) },
      data: { status: "CANCELED" },
    });

    if (!appeal) {
      return res.status(404).json({ error: "Appeal not found" });
    }

    res.json(appeal);
  } catch (error) {
    res.status(500).json({ error: "Failed to start cancel appeal" });
  }
});

app.listen(port, () => {
  console.log(`Efeective app listening on port ${port}`);
});
