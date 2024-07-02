import React, { useEffect, useState } from "react";
import { ListGroup, Button, Container, Row, Col } from "react-bootstrap";
import Question from "./Question";
import ShortBartleTestResult from "./ShortBartleTestResult";
import ShortBartleTestExplanation from "./ShortBartleTestExplanation";
import { EvaluationData } from "./types";
import { useQuery, useMutation, gql } from "@apollo/client";

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

// Query for requesting questions of test
const TEST = gql`
  query Test {
    _internal_noauth_test {
      id
      text
      option0
      option1
    }
  }
`;

// Mutation for submitting an answer
const SUBMIT_ANSWER = gql`
  mutation SubmitAnswer($questionId: Int!, $answer: Boolean!) {
    submitAnswer(questionId: $questionId, answer: $answer)
  }
`;

// Query for evaluating the test result
const EVALUATE_TEST = gql`
  query EvaluateTest {
    _internal_noauth_evaluateTest {
      achieverPercentage
      explorerPercentage
      socializerPercentage
      killerPercentage
    }
  }
`;

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
  const { loading, error, data } = useQuery<{ test: QuestionType[] }>(TEST);
  const [submitAnswer] = useMutation(SUBMIT_ANSWER);
  const { data: evaluationData, refetch: evaluateTest } = useQuery<{
    evaluateTest: EvaluationData;
  }>(EVALUATE_TEST, {
    skip: true, // Skip the query initially
  });

  const [questions, setQuestions] = useState<QuestionType[]>(sampleQuestions);
  const [allQuestionsAnswered, setAllQuestionsAnswered] =
    useState<boolean>(false);
  const [evaluationVisible, setEvaluationVisible] = useState<boolean>(false);
  const [evaluationDataState, setEvaluationDataState] =
    useState<EvaluationData | null>(null);

  // Load test questions and initialize answers to null
  useEffect(() => {
    if (data) {
      setQuestions(data.test.map((q) => ({ ...q, answer: null })));
    }
  }, [data]);

  // Check if all questions are answered
  useEffect(() => {
    const answered = questions.every((q) => q.answer !== null);
    setAllQuestionsAnswered(answered);
  }, [questions]);

  const handleOptionChange = (questionId: number, answer: boolean) => {
    submitAnswer({ variables: { questionId, answer } });
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === questionId ? { ...q, answer } : q))
    );
  };

  const handleEvaluate = () => {
    evaluateTest().then(({ data }) => {
      setEvaluationDataState(data.evaluateTest);
      setEvaluationVisible(true);
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <p>
        Error: {error.message}. Ensure that the API is configured to allow
        unauthenticated access to the test.
      </p>
    );
  }

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
          {evaluationVisible && evaluationDataState && (
            <div>
              <ShortBartleTestResult
                className="mb-3"
                evaluationData={evaluationDataState}
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
