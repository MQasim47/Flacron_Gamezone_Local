import { Router } from 'express';
import { deepDataController } from '../controllers/deepData.controller.js';
import { requireAuth, requirePremium } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

// All deep data endpoints require a premium subscription
// Per-endpoint routes — all keyed off the internal DB match ID
router.get('/:id/lineups', asyncHandler(deepDataController.getLineups));
router.get('/:id/stats', asyncHandler(deepDataController.getStats));
router.get('/:id/incidents', asyncHandler(deepDataController.getIncidents));
router.get('/:id/shotmap', asyncHandler(deepDataController.getShotmap));
router.get('/:id/odds', asyncHandler(deepDataController.getOdds));
router.get('/:id/votes', asyncHandler(deepDataController.getVotes));
router.get('/:id/h2h', asyncHandler(deepDataController.getH2H));
router.get(
   '/:id/last-matches',
   asyncHandler(deepDataController.getLastMatches)
);
router.get('/:id/standing', asyncHandler(deepDataController.getStanding));
router.get('/:id/graph', asyncHandler(deepDataController.getGraph));
router.get('/:id/highlights', asyncHandler(deepDataController.getHighlights));

// One-shot: all deep data in a single request (useful for match detail page)
router.get('/:id/all', asyncHandler(deepDataController.getAll));

export default router;
