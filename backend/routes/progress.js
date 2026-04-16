import { Router } from "express";
import { getUserProgress, getSimulationProgress } from "../controllers/progressController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getUserProgress);
router.get("/:simulationId", protect, getSimulationProgress);

export default router;
