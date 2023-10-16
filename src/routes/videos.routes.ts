import { Router } from "express";

// Controllers
import * as videosController from '../controllers/videos.controller';

const router = Router();
const path = '/api';

router.get(`${path}/videos`, videosController.getVideos);
router.get(`${path}/videos/:id`, videosController.getVideo);
router.post(`${path}/videos`, videosController.createVideo);
router.delete(`${path}/videos/:id`, videosController.deleteVideo);
router.put(`${path}/videos/:id`, videosController.updateVideo);

export default router;
