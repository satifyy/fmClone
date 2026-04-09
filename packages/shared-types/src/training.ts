export type TrainingPlan = {
  clubId: string;
  focus: "balanced" | "fitness" | "attacking" | "defending" | "youth";
  intensity: number;
};
