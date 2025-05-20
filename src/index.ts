import express from "express";
import { PrismaClient } from "../generated/prisma";
import { Request, Response } from "express";
import { FilteredAppealsType } from "./types";
import morgan from "morgan";
import {
  APPEAL_NOT_FOUND,
  CANCELED,
  COMPLETED,
  FAILED_CANCEL,
  FAILED_COMPLETE,
  FAILED_CREATE,
  FAILED_PROCESS,
  FAILED_PROGRESS_TO_CANCEL,
  IN_PROGRESS,
  PORT,
} from "./constants";

const app = express();
app.use(morgan("tiny"));
const prisma = new PrismaClient();
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
    res.status(500).json({ error: FAILED_CREATE });
  }
});

app.patch("/appeal/progress/:id", async (req: Request, res: Response) => {
  const data = req.params;
  try {
    const appeal = await prisma.appeal.update({
      where: { id: parseInt(data.id) },
      data: { status: IN_PROGRESS },
    });

    if (!appeal) {
      return res.status(404).json({ error: APPEAL_NOT_FOUND });
    }

    res.json(appeal);
  } catch (error) {
    res.status(500).json({ error: FAILED_PROCESS });
  }
});

app.patch("/appeal/complete/:id", async (req: Request, res: Response) => {
  const data = req.params;
  const { solution } = req.body;
  try {
    const appeal = await prisma.appeal.update({
      where: { id: parseInt(data.id) },
      data: { status: COMPLETED, solution },
    });

    if (!appeal) {
      return res.status(404).json({ error: APPEAL_NOT_FOUND });
    }

    res.json(appeal);
  } catch (error) {
    res.status(500).json({ error: FAILED_COMPLETE });
  }
});

app.patch("/appeal/cancel/:id", async (req: Request, res: Response) => {
  const data = req.params;
  const { cancelReason } = req.body;
  try {
    const appeal = await prisma.appeal.update({
      where: { id: parseInt(data.id) },
      data: { status: CANCELED, cancelReason },
    });

    if (!appeal) {
      return res.status(404).json({ error: APPEAL_NOT_FOUND });
    }

    res.json(appeal);
  } catch (error) {
    res.status(500).json({ error: FAILED_CANCEL });
  }
});

app.get("/appeals/all", async (req: Request, res: Response) => {
  try {
    const appeals = await prisma.appeal.findMany({});

    if (appeals.length === 0) {
      return res.status(404).json({ error: APPEAL_NOT_FOUND });
    }

    res.json(appeals);
  } catch (error) {
    res.status(500).json({ error: FAILED_CANCEL });
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

app.patch(
  "/appeals/cancel-in-progress",
  async (req: Request, res: Response) => {
    const { cancelReason } = req.body;

    if (!cancelReason) {
      return res.status(400).json({ error: "Cancel reason is required" });
    }

    try {
      const result = await prisma.appeal.updateMany({
        where: { status: IN_PROGRESS },
        data: {
          status: CANCELED,
          cancelReason,
        },
      });

      res.json({
        message: `Canceled ${result.count} appeals`,
        count: result.count,
      });
    } catch (error) {
      res.status(500).json({ error: FAILED_PROGRESS_TO_CANCEL });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Effective app listening on port ${PORT}`);
});
