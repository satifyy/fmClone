import { z } from "zod";

export const tacticInstructionsSchema = z.object({
  mentality: z.enum(["very-defensive", "defensive", "balanced", "positive", "attacking"]),
  pressingIntensity: z.number().int().min(0).max(100),
  tempo: z.number().int().min(0).max(100),
  width: z.number().int().min(0).max(100),
  defensiveLine: z.number().int().min(0).max(100),
  directness: z.number().int().min(0).max(100),
  timeWasting: z.number().int().min(0).max(100)
});

export const tacticalProfileSchema = z.object({
  formation: z.string().min(3),
  instructions: tacticInstructionsSchema,
  roles: z.array(
    z.object({
      slot: z.string(),
      playerId: z.string(),
      position: z.enum(["GK", "RB", "CB", "LB", "DM", "CM", "AM", "RW", "LW", "ST"]),
      role: z.string()
    })
  )
});

