import React from "react";
import { LinearProgress, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

interface BloomLevelProps {
  level: number;
  expForCurrentLevel: number;
  requiredExpForCurrentLevel: number;
}

export function BloomLevel({
  level,
  expForCurrentLevel,
  requiredExpForCurrentLevel,
}: BloomLevelProps) {
  const progress = (expForCurrentLevel / requiredExpForCurrentLevel) * 100;

  return (
    <div className="flex items-center gap-2">
      <StarIcon style={{ color: "blue" }} />
      <Typography variant="h6">Level {level}</Typography>
      <div className="flex-1">
        <LinearProgress
          variant="determinate"
          value={progress}
          style={{ height: 8, borderRadius: 5 }}
        />
        <Typography variant="body2" color="textSecondary">
          {expForCurrentLevel}/{requiredExpForCurrentLevel} XP
        </Typography>
      </div>
    </div>
  );
}
