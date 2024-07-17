import React, { useEffect, useState } from "react";
import { ListGroup, Button, Container, Row, Col } from "react-bootstrap";
import Question from "./Question";
import ShortBartleTestResult from "./ShortBartleTestResult";
import ShortBartleTestExplanation from "./ShortBartleTestExplanation";
import { EvaluationData, QuestionType } from "./types";
import { useLazyLoadQuery } from "react-relay";
import { graphql, commitMutation, Environment } from "relay-runtime";
import { useRelayEnvironment } from "react-relay/hooks";
import {
  ShortBartleTestTestQuery,
  ShortBartleTestTestQuery$data,
} from "@/__generated__/ShortBartleTestTestQuery.graphql";

const submitAnswerMutation = graphql`
  mutation ShortBartleTestSubmitAnswerMutation(
    $questionId: Int!
    $answer: Boolean!
  ) {
    submitAnswer(questionId: $questionId, answer: $answer)
  }
`;

const evaluateTestMutation = graphql`
  mutation ShortBartleTestEvaluateTestMutation($uuid: UUID!) {
    evaluateTest(userUUID: $uuid) {
      achieverPercentage
      explorerPercentage
      socializerPercentage
      killerPercentage
    }
  }
`;

const createOrUpdatePlayerTypeMutation = graphql`
  mutation ShortBartleTestCreateOrUpdatePlayerTypeMutation(
    $userUUID: UUID!
    $achieverPercentage: Int!
    $explorerPercentage: Int!
    $socializerPercentage: Int!
    $killerPercentage: Int!
  ) {
    createOrUpdatePlayerType(
      userUUID: $userUUID
      achieverPercentage: $achieverPercentage
      explorerPercentage: $explorerPercentage
      socializerPercentage: $socializerPercentage
      killerPercentage: $killerPercentage
    ) {
      userUUID
      achieverPercentage
      explorerPercentage
      socializerPercentage
      killerPercentage
    }
  }
`;

function submitAnswer(
  environment: Environment,
  questionId: number,
  answer: boolean,
  onCompleted: (response: any) => void,
  onError: (error: Error) => void
) {
  const variables = {
    questionId,
    answer,
  };

  commitMutation(environment, {
    mutation: submitAnswerMutation,
    variables,
    onCompleted,
    onError,
  });
}

function evaluateTest(
  environment: Environment,
  uuid: string,
  onCompleted: (response: any) => void,
  onError: (error: Error) => void
) {
  const variables = {
    uuid,
  };

  commitMutation(environment, {
    mutation: evaluateTestMutation,
    variables,
    onCompleted,
    onError,
  });
}

function createOrUpdatePlayerType(
  environment: Environment,
  userUUID: string,
  evaluationData: EvaluationData,
  onCompleted: (response: any) => void,
  onError: (error: Error) => void
) {
  if (!userUUID) {
    console.error("currentUserId is missing");
    return;
  } else {
    console.log(userUUID);
  }

  const variables = {
    userUUID: userUUID,
    achieverPercentage: evaluationData.achieverPercentage,
    explorerPercentage: evaluationData.explorerPercentage,
    socializerPercentage: evaluationData.socializerPercentage,
    killerPercentage: evaluationData.killerPercentage,
  };

  commitMutation(environment, {
    mutation: createOrUpdatePlayerTypeMutation,
    variables,
    onCompleted,
    onError,
  });
}

interface ShortBartleTestProps {
  onBackToStart: () => void;
  currentUserId: string;
}

function mapQueryDataToQuestions(
  data: ShortBartleTestTestQuery$data
): QuestionType[] {
  return data.test.map((question) => ({
    id: Number(question.id),
    text: question.text,
    option0: question.option0,
    option1: question.option1,
    answer: null,
  }));
}

export default function ShortBartleTest({
  onBackToStart,
  currentUserId,
}: ShortBartleTestProps) {
  const environment = useRelayEnvironment();

  const testData = useLazyLoadQuery<ShortBartleTestTestQuery>(
    graphql`
      query ShortBartleTestTestQuery {
        test {
          id
          text
          option0
          option1
        }
      }
    `,
    {}
  );

  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [allQuestionsAnswered, setAllQuestionsAnswered] =
    useState<boolean>(false);
  const [evaluationVisible, setEvaluationVisible] = useState<boolean>(false);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(
    null
  );

  useEffect(() => {
    if (testData) {
      console.log("Fetched test");
      const mappedQuestions = mapQueryDataToQuestions(testData);
      setQuestions(mappedQuestions);
    }
  }, [testData]);

  useEffect(() => {
    const answered = questions.every((q) => q.answer !== null);
    setAllQuestionsAnswered(answered);
  }, [questions]);

  const handleOptionChange = (questionId: number, answer: boolean) => {
    submitAnswer(
      environment,
      questionId,
      answer,
      (response) => {
        console.log("Submitted answer:", response);
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) => (q.id === questionId ? { ...q, answer } : q))
        );
      },
      (error) => {
        console.error("Error submitting answer:", error);
      }
    );
  };

  const handleEvaluate = () => {
    if (!currentUserId) {
      console.error("currentUserId is missing");
      return;
    }

    evaluateTest(
      environment,
      currentUserId,
      (response) => {
        const result = response.evaluateTest;
        const evaluationResult = {
          achieverPercentage: result.achieverPercentage,
          explorerPercentage: result.explorerPercentage,
          socializerPercentage: result.socializerPercentage,
          killerPercentage: result.killerPercentage,
        };
        setEvaluationData(evaluationResult);
        setEvaluationVisible(true);
        console.log("Evaluated test");

        // Save the evaluation result
        createOrUpdatePlayerType(
          environment,
          currentUserId,
          evaluationResult,
          (response) => {
            console.log("Saved player type:", response);
          },
          (error) => {
            console.error("Error saving player type:", error);
          }
        );
      },
      (error) => {
        console.error("Error evaluating test:", error);
      }
    );
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
