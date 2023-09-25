"use client";

import { studentQuestionFragment$key } from "@/__generated__/studentQuestionFragment.graphql";
import { studentQuizQuery } from "@/__generated__/studentQuizQuery.graphql";
import {
  QuestionCompletedInput,
  studentQuizTrackCompletedMutation,
  studentQuizTrackCompletedMutation$data,
} from "@/__generated__/studentQuizTrackCompletedMutation.graphql";
import { ContentTags } from "@/components/ContentTags";
import { FormErrors } from "@/components/FormErrors";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { AssociationQuestion } from "@/components/quiz/AssociationQuestion";
import { ClozeQuestion } from "@/components/quiz/ClozeQuestion";
import { MultipleChoiceQuestion } from "@/components/quiz/MultipleChoiceQuestion";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";

export default function StudentQuiz() {
  // Get course id from url
  const { quizId, courseId } = useParams();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [checkAnswers, setCheckAnswers] = useState(false);
  const [error, setError] = useState<any>(null);

  const [usedHint, setUsedHint] = useState(false);
  const [correct, setCorrect] = useState(false);

  useEffect(() => {
    // Reset user answers when the currentIndex changes
    setCorrect(false);
    setUsedHint(false);
  }, [currentIndex]);

  const [trackCompleted, loading] =
    useMutation<studentQuizTrackCompletedMutation>(
      graphql`
        mutation studentQuizTrackCompletedMutation(
          $input: QuizCompletedInput!
        ) {
          logQuizCompleted(input: $input) {
            correctness
            hintsUsed
            success
          }
        }
      `
    );

  const [completedInput, setCompletedInput] = useState<
    QuestionCompletedInput[]
  >([]);

  const [feedback, setFeedback] =
    useState<studentQuizTrackCompletedMutation$data["logQuizCompleted"]>();

  // Fetch quiz data
  const { contentsByIds } = useLazyLoadQuery<studentQuizQuery>(
    graphql`
      query studentQuizQuery($id: [UUID!]!) {
        contentsByIds(ids: $id) {
          id
          metadata {
            name
            ...ContentTags
          }
          ... on QuizAssessment {
            quiz {
              selectedQuestions {
                id
                ...studentQuestionFragment
              }
            }
          }
        }
      }
    `,
    { id: [quizId] }
  );

  if (contentsByIds.length == 0) {
    return <PageError message="No quiz found with given id." />;
  }

  const quiz = contentsByIds[0].quiz;
  if (quiz == null) {
    return (
      <PageError
        title={contentsByIds[0].metadata.name}
        message="Content not of type quiz."
      />
    );
  }

  const currentQuestion = quiz.selectedQuestions[currentIndex];
  if (!currentQuestion) {
    return (
      <PageError title={contentsByIds[0].metadata.name} message="Empty quiz." />
    );
  }

  const nextQuestion = () => {
    // Enable feedback mode
    if (!checkAnswers) {
      setCheckAnswers(true);
      return;
    }

    const currentAnswer = {
      questionId: currentQuestion.id,
      usedHint,
      correct,
    };

    if (currentIndex + 1 < (quiz.selectedQuestions.length ?? 0)) {
      // Questions left, display next one
      setCheckAnswers(false);
      setCompletedInput((oldValue) => [...oldValue, currentAnswer]);
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more questions, submit result and go to course page
      trackCompleted({
        variables: {
          input: {
            quizId: contentsByIds[0].id,
            completedQuestions: [...completedInput, currentAnswer],
          },
        },
        onCompleted(response) {
          setFeedback(response.logQuizCompleted);
        },
      });
    }
  };

  return (
    <main>
      <FormErrors error={error} onClose={() => setError(null)} />
      <Heading title={contentsByIds[0].metadata.name} backButton />
      <ContentTags metadata={contentsByIds[0].metadata} />

      {/* Horizontal line with current question number */}
      <div className="w-full my-6 flex items-center">
        <div className="border-b border-b-gray-300 grow"></div>
        <div className="px-3 text-xs text-gray-600">
          {currentIndex + 1}/{quiz?.selectedQuestions.length ?? 0}
        </div>
        <div className="border-b border-b-gray-300 grow"></div>
      </div>

      <Question
        _question={currentQuestion}
        feedbackMode={checkAnswers}
        onChange={setCorrect}
        onHint={() => setUsedHint(true)}
      />

      <div className="mt-6 w-full flex flex-col items-center">
        {checkAnswers && (
          <div className="mb-4">
            {correct ? (
              <span className="text-green-600">Correct answer</span>
            ) : (
              <span className="text-red-600">Oops, wrong answer</span>
            )}
          </div>
        )}
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={nextQuestion}
          className="mb-6"
        >
          {!checkAnswers
            ? "Check"
            : currentIndex + 1 < (quiz?.selectedQuestions.length ?? 0)
            ? "Next"
            : "Finish"}
        </Button>
      </div>
      {feedback && <Feedback courseId={courseId} feedback={feedback} />}
    </main>
  );
}

function Question({
  _question,
  onHint,
  onChange,
  feedbackMode,
}: {
  _question: studentQuestionFragment$key;
  feedbackMode: boolean;
  onHint: () => void;
  onChange: (correct: boolean) => void;
}) {
  const question = useFragment(
    graphql`
      fragment studentQuestionFragment on Question {
        type
        ...MultipleChoiceQuestionFragment
        ...ClozeQuestionFragment
        ...AssociationQuestionFragment
      }
    `,
    _question
  );

  switch (question.type) {
    case "MULTIPLE_CHOICE":
      return (
        <MultipleChoiceQuestion
          _question={question}
          feedbackMode={feedbackMode}
          onHint={onHint}
          onChange={onChange}
        />
      );
    case "CLOZE":
      return (
        <ClozeQuestion
          _question={question}
          feedbackMode={feedbackMode}
          onHint={onHint}
          onChange={onChange}
        />
      );
    case "ASSOCIATION":
      return (
        <AssociationQuestion
          _question={question}
          feedbackMode={feedbackMode}
          onHint={onHint}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

function Feedback({
  feedback: { success, correctness, hintsUsed },
  courseId,
}: {
  feedback: studentQuizTrackCompletedMutation$data["logQuizCompleted"];
  courseId: string;
}) {
  const router = useRouter();
  return (
    <Dialog open>
      {success && <Confetti />}
      <DialogTitle style={{ color: success ? "green" : "red" }}>
        {success ? "Congratulations!" : "Better luck next time!"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" component="div">
          <CircularProgress variant="determinate" value={correctness * 100} />
          <strong>{`You've scored `}</strong>
          <span style={{ color: success ? "green" : "red" }}>{`${Math.round(
            correctness * 100
          )}%`}</span>
        </Typography>
        <Typography variant="body1">
          <strong>{`Hints used: `}</strong>
          {hintsUsed}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          onClick={() => router.push(`/courses/${courseId}`)}
        >
          Back to Course
        </Button>
      </DialogActions>
    </Dialog>
  );
}
