import jwt from 'jsonwebtoken'
import User from "../models/users.models.js";
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from "bcrypt";
import fs from "fs";

// Clodinary Config

cloudinary.config({ 
    cloud_name: 'dipbzyc4m', 
    api_key: '435397383731781', 
    api_secret: 'sgcmnEftZHg3eRuJarN421EJrbQ'
});

// Upload an image Cloudinary Function

const uploadImageToCloudinary = async (localpath) => {
    try {
        const uploadResult = await cloudinary.uploader.upload(localpath, {
        resource_type: "auto"
        });
        
        fs.unlinkSync(localpath);
        return uploadResult.url;
    } catch (error) {
        console.log(error);
        fs.unlinkSync(localpath);
        return null;
    };

};

 


// GENERATE ACCESS AND REFRESH TOKEN

const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.ACCESS_JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.REFRESH_JWT_SECRET, { expiresIn: "7d" });
};



// register user


const registerUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(409).json({ message: "User already exists" }); // Use 409 for conflicts
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "User registered successfully",
            data: newUser,
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// login user


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No user found" });

        console.log("Hashed password in DB:", user.password);
        console.log("Entered password:", password);


        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            message: "User logged in successfully",
            accessToken,
            data: { id: user._id, email: user.email },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



// logout user

const logoutUser = async (req , res) => {
    res.clearCookie("refreshToken");
    res.json({
    message: "User LogOut SuccessFully"
    });
};


// refreshtoken
const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken;
        if (!token) {
            return res.status(401).json({
                message: "No Refresh Token Found!",
            });
        }
        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findOne({ _id: decodedToken.id });
        if (!user) {
            return res.status(404).json({
                message: "Invalid Token",
            });
        }

        const newAccessToken = generateAccessToken(user._id);

        res.json({
            message: "Access Token Generated",
            accessToken: newAccessToken,
        });
    } catch (error) {
        console.error("Error refreshing token:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(403).json({ message: "Refresh token expired" });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        res.status(500).json({
            message: "Internal server error",
        });
    }
};


// UPLOAD IMAGE MAIN FUNCTION

const uploadImage = async (req , res) => {
    if(!req.file) 
        return res.status(400).json({
    message: "No Image File Uploaded"
    });

    try {

        const uploadResult = await uploadImageToCloudinary(req.file.path);

        if(!uploadResult)
            return res.status(500).json({
        message: "No image Found while uploading"
        });

        res.json({
           message: "Image Uploaded Successfully" ,
           url: uploadResult,
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "No image Found while uploading"
        });
    };

};



export {registerUser , loginUser , logoutUser , refreshToken , uploadImage };