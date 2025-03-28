import express from "express";
import {
  isAuthenticated,
  isAuthenticatedLineant,
} from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import { createClub } from "../controllers/club.controller.js";
import Club from "../models/club.model.js";

const router = express.Router();

// Fetch all clubs
router.get("/", isAuthenticatedLineant, async (req, res) => {
  try {
    const user=req.user;
    const clubs = await Club.find();
    res.render("clubs", {
      title: "Clubs List",
      clubs,
      user,
      isAuthenticated: req.isAuthenticated,
    });
  } catch (err) {
    res.status(500).send("Error fetching clubs");
  }
});

// Create a new club (Admin only)
// Admin check should be placed here.
router.get("/add", isAuthenticated, isAdmin, (req, res) => {
  const user = req.user;
  res.render("add-club", {
    title: "Add Club",
    isAuthenticated: req.isAuthenticated,
    user,
  });
});
router.post("/add", isAuthenticated, isAdmin, createClub);

export default router;
