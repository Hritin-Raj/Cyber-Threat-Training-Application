import { Router } from "express";
import {
  getSimulations,
  getSimulation,
  submitSimulation,
  getLevelProgress,
} from "../controllers/simulationController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getSimulations);
router.get("/level-progress", protect, getLevelProgress);
router.get("/:id", protect, getSimulation);
router.post("/:id/submit", protect, submitSimulation);

export default router;
