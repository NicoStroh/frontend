import React from "react";
import { ListGroup, Card } from "react-bootstrap";
import { EvaluationData } from "./types";

interface ShortBartleTestResultProps {
  evaluationData: EvaluationData;
  className?: string;
}

const ShortBartleTestResult: React.FC<ShortBartleTestResultProps> = ({
  evaluationData,
  className,
}) => {
  const {
    achieverPercentage,
    explorerPercentage,
    socializerPercentage,
    killerPercentage,
  } = evaluationData;

  const dominantType = () => {
    const percentages: { [key: string]: number } = {
      Achiever: achieverPercentage,
      Explorer: explorerPercentage,
      Socializer: socializerPercentage,
      Killer: killerPercentage,
    };
    return Object.keys(percentages).reduce((a, b) =>
      percentages[a as keyof typeof percentages] >
      percentages[b as keyof typeof percentages]
        ? a
        : b
    ) as keyof typeof percentages;
  };

  const dominantTypeDescription = () => {
    switch (dominantType()) {
      case "Achiever":
        return (
          "You are an Achiever, focused on gaining points, levels, equipment, " +
          "and other concrete measurements of success in a game. You can see badges now."
        );
      case "Explorer":
        return (
          "You are an Explorer, enjoying discovering new areas, creating maps, " +
          "and learning about hidden places in the game. You can see quets now."
        );
      case "Socializer":
        return (
          "You are a Socializer, valuing interaction with other players and " +
          "enjoying the social aspects of the game. You can see badges now."
        );
      case "Killer":
        return (
          "You are a Killer, thriving on competition with other players and " +
          "enjoying the player-vs-player aspects of the game. You can see the scoreboard now."
        );
      default:
        return "";
    }
  };

  return (
    <div className={className}>
      <ListGroup>
        <ListGroup.Item>
          Achiever Percentage: {achieverPercentage}
        </ListGroup.Item>
        <ListGroup.Item>
          Explorer Percentage: {explorerPercentage}
        </ListGroup.Item>
        <ListGroup.Item>
          Socializer Percentage: {socializerPercentage}
        </ListGroup.Item>
        <ListGroup.Item>Killer Percentage: {killerPercentage}</ListGroup.Item>
      </ListGroup>
      <Card>
        <Card.Body>
          <Card.Title>Dominant Type: {dominantType()}</Card.Title>
          <Card.Text>{dominantTypeDescription()}</Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ShortBartleTestResult;
