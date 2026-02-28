export const requireOrganizer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "User missing" });
  }

  if (req.user.role !== "ORGANIZER") {
    return res.status(403).json({
      message: "Only organizers allowed"
    });
  }

  next();
};