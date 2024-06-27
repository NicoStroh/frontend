import React from "react";
import { Card, ListGroup } from "react-bootstrap";

interface Props {
  className?: string;
}

const ShortBartleTestExplanation: React.FC<Props> = ({ className }) => (
  <Card className={className}>
    <Card.Body>
      <Card.Text>
        The Bartle Test of Gamer Psychology, based on a paper by Richard Bartle,
        classifies players of multiplayer online games into four types:
        Achievers, Explorers, Socializers, and Killers. This test helps
        determine your player type, which can provide insights into your gaming
        preferences.
      </Card.Text>
      <ListGroup>
        <ListGroup.Item>
          <strong>Achievers:</strong> Focused on gaining points, levels,
          equipment, and other concrete measurements of success in a game. They
          strive to achieve and complete the game.
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>Explorers:</strong> Enjoy discovering new areas, creating
          maps, and learning about hidden places. They love to find out as much
          as possible about the virtual world.
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>Socializers:</strong> Value interacting with other players.
          Their enjoyment comes from the social aspects of the game, such as
          chatting, making friends, and cooperating.
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>Killers:</strong> Thrive on competition with other players.
          They enjoy the player-vs-player aspects of the game and seek to
          dominate and win against other gamers.
        </ListGroup.Item>
      </ListGroup>
    </Card.Body>
  </Card>
);

export default ShortBartleTestExplanation;
