import { $Enums } from "../generated/prisma";

export type FilteredAppealsType = {
    id: number;
    topic: string;
    text: string;
    status: $Enums.AppealStatus;
    solution: string | null;
    cancelReason: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];