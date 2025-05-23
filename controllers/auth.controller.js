import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../configs/nodemailer.js";
import crypto from "crypto";

export const getLoginUser = (req, res, next) => {
  try {
    if (req.isAuthenticated) {
      return res.redirect(`/user/${req.user.username}`);
    }
    res.render("login");
  } catch (err) {
    next(err);
  }
};

export const getRegisterUser = (req, res, next) => {
  try {
    if (req.isAuthenticated) {
      return res.redirect(`/user/${req.user.username}`);
    }
    res.render("signup");
  } catch (err) {
    next(err);
  }
};

export const getForgotPass = (req, res, next) => {
  try {
    if (req.isAuthenticated) {
      return res.redirect(`/user/${req.user.username}`);
    }
    res.render("forgot-password");
  } catch (err) {
    next(err);
  }
};

export const getResetPass = (req, res, next) => {
  try {
    if (req.isAuthenticated) {
      return res.redirect(`/user/${req.user.username}`);
    }
    res.render("reset-password", { token: req.params.token });
  } catch (err) {
    next(err);
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user but don't activate it yet
    const newUser = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      isVerified: false, // User is not verified yet
    });

    // Generate a verification token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Create a verification link
    const verificationUrl = `https://event-management-portal.onrender.com/auth/verify/${token}`;

    // Send the verification email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your Email",
      html: `
        <h4>Hello ${name},</h4>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
      `,
    });

    res.status(200).json({
      message:
        "Signup successful! Please check your email to verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: "Email not verified." });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 1000, // 1 day
    });
    res.status(200).redirect(`/user/${user.username}`);
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.status(200).redirect("/");
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  const { token } = req.params;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid token or user not found." });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified." });
    }

    // Verify the user
    user.isVerified = true;
    await user.save();

    res.status(200).send(`
      <h4>Email Verified Successfully!</h4>
      <p>You can now <a href="/auth/login">login</a> to your account.</p>
    `);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    8;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.expireToken = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    const resetUrl = `https://event-management-portal.onrender.com/auth/reset-password/${token}`;
    await transporter.sendMail({
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click the link below to reset your password:</p>
               <a href="${resetUrl}">Reset Password</a>`,
    });
    res.status(200).json({ message: "Reset password email sent." });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { token } = req.params;

    console.log(token);

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const user = await User.findOne({ resetToken: token });
    console.log("User found:", user);

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found or token invalid." });
    }

    if (user.expireToken < Date.now()) {
      return res.status(400).json({ message: "Token has expired." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.expireToken = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    next(error);
  }
};
