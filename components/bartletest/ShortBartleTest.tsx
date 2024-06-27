import React, { useEffect, useState } from "react";
import { ListGroup, Button, Container, Row, Col } from "react-bootstrap";
import Question from "./Question";
import ShortBartleTestResult from "./ShortBartleTestResult";
import ShortBartleTestExplanation from "./ShortBartleTestExplanation";
import { EvaluationData } from "./types";

interface QuestionType {
  id: number;
  text: string;
  option0: string;
  option1: string;
  answer: boolean | null;
}

interface ShortBartleTestProps {
  onBackToStart: () => void;
}

const sampleQuestions: QuestionType[] = [
  {
    id: 1,
    text: "Do you enjoy exploring?",
    option0: "Yes",
    option1: "No",
    answer: null,
  },
  {
    id: 2,
    text: "Do you enjoy competing?",
    option0: "Yes",
    option1: "No",
    answer: null,
  },
  // Add more sample questions as needed
];

const sampleEvaluationData: EvaluationData = {
  achieverPercentage: 25,
  explorerPercentage: 25,
  socializerPercentage: 25,
  killerPercentage: 25,
};

export default function ShortBartleTest({
  onBackToStart,
}: ShortBartleTestProps) {
  const [questions, setQuestions] = useState<QuestionType[]>(sampleQuestions);
  const [allQuestionsAnswered, setAllQuestionsAnswered] =
    useState<boolean>(false);
  const [evaluationVisible, setEvaluationVisible] = useState<boolean>(false);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(
    null
  );

  useEffect(() => {
    const answered = questions.every((q) => q.answer !== null);
    setAllQuestionsAnswered(answered);
  }, [questions]);

  const handleOptionChange = (questionId: number, answer: boolean) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === questionId ? { ...q, answer } : q))
    );
  };

  const handleEvaluate = () => {
    setEvaluationData(sampleEvaluationData);
    setEvaluationVisible(true);
  };

  return (
    <Container className="mt-4 mb-4">
      <Row>
        <Col>
          <h2>Short Bartle Test</h2>
          <ShortBartleTestExplanation className="mt-3" />
          <ListGroup className="mt-3">
            {questions.map((question) => (
              <ListGroup.Item key={question.id}>
                <Question
                  key={question.id}
                  question={question}
                  onOptionChange={handleOptionChange}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Button
            variant="outline-primary"
            size="lg"
            onClick={handleEvaluate}
            disabled={!allQuestionsAnswered}
            className="mt-3 mb-3 w-100"
          >
            Evaluate Test
          </Button>
          {evaluationVisible && evaluationData && (
            <div>
              <ShortBartleTestResult
                className="mb-3"
                evaluationData={evaluationData}
              />
              <Button
                variant="outline-primary"
                className="mt-3"
                onClick={onBackToStart}
              >
                Back to Dashboard
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
