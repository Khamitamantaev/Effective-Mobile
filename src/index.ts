import express from "express";
import { PrismaClient } from "../generated/prisma";
import { Request, Response } from "express";
import { FilteredAppealsType } from "./types";
import morgan from 'morgan'

const app = express();
app.use(morgan('tiny'))
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
  const { solution } = req.body;
  try {
    const appeal = await prisma.appeal.update({
      where: { id: parseInt(data.id) },
      data: { status: "COMPLETED", solution },
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
  const { cancelReason } = req.body;
  try {
    const appeal = await prisma.appeal.update({
      where: { id: parseInt(data.id) },
      data: { status: "CANCELED", cancelReason },
    });

    if (!appeal) {
      return res.status(404).json({ error: "Appeal not found" });
    }

    res.json(appeal);
  } catch (error) {
    res.status(500).json({ error: "Failed to start cancel appeal" });
  }
});

app.get("/appeals/all", async (req: Request, res: Response) => {
  try {
    const appeals = await prisma.appeal.findMany({});

    if (appeals.length === 0) {
      return res.status(404).json({ error: "Appeal not found" });
    }

    res.json(appeals);
  } catch (error) {
    res.status(500).json({ error: "Failed to start cancel appeal" });
  }
});

app.get("/appeals/filter", async (req: Request, res: Response) => {
  const { date, startDate, endDate } = req.query;

  let filteredAppealsCurrent: FilteredAppealsType = [];
  let filteredAppealsDiapazon: FilteredAppealsType = [];
  if (date) {
    const targetDate = new Date(date as string);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    filteredAppealsCurrent = await prisma.appeal.findMany({
      where: {
        createdAt: {
          gt: targetDate,
          lt: nextDay,
        },
      },
    });
  }

  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    end.setDate(end.getDate() + 1);

    filteredAppealsDiapazon = await prisma.appeal.findMany({
      where: {
        createdAt: {
          gt: start,
          lt: end,
        },
      },
    });
  }

  try {
    res.json({
      current: filteredAppealsCurrent,
      diapazon: filteredAppealsDiapazon,
    });
  } catch (error) {
    res.status(500).json({ error: "Somethong wrong" });
  }
});


app.patch('/appeals/cancel-in-progress', async (req: Request, res: Response) => {
  const { cancelReason } = req.body;

  if (!cancelReason) {
    return res.status(400).json({ error: 'Cancel reason is required' });
  }

  try {
    const result = await prisma.appeal.updateMany({
      where: { status: 'IN_PROGRESS' },
      data: { 
        status: 'CANCELED',
        cancelReason,
      },
    });

    res.json({
      message: `Canceled ${result.count} appeals`,
      count: result.count,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel in-progress appeals' });
  }
});

app.listen(port, () => {
  console.log(`Efeective app listening on port ${port}`);
});
