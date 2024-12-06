import express from "express";
import { loginUser , logoutUser, refreshToken, registerUser, uploadImage} from "../controllers/users.controllers.js";
import { upload } from "../../uploads/middleware/multer.middleware.js";
const router = express.Router();

// REGISTER USER

router.post("/register" , registerUser);
router.post("/login" , loginUser);
router.post("/logout" , logoutUser);
router.post("/refreshtoken" , refreshToken);
router.post("/uploadimage" , upload.single("image") , uploadImage);


export default router;