import { StudentFlashcard$key } from "@/__generated__/StudentFlashcard.graphql";
import { StudentFlashcardSetLogProgressMutation } from "@/__generated__/StudentFlashcardSetLogProgressMutation.graphql";
import { StudentFlashcardSetFinishFlashCardSetMutation } from "@/__generated__/StudentFlashcardSetFinishFlashCardSetMutation.graphql";
import { Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { DisplayError } from "./PageError";
import { StudentFlashcard } from "./StudentFlashcard";
import { StudentFlashcardSetUserIdQuery } from "@/__generated__/StudentFlashcardSetUserIdQuery.graphql";

export type FlashcardData = {
  id: string;
  _flashcard: StudentFlashcard$key;
};

export function StudentFlashcardSet({
  flashcards,
  emptyMessage,
  onError = () => {},
  onComplete = () => {},
  courseId,
  flashcardSetId,
}: {
  flashcards: FlashcardData[];
  emptyMessage: string;
  onError?: (error: any) => void;
  onComplete?: () => void;
  courseId: string;
  flashcardSetId: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knew, setKnew] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const { currentUserInfo } = useLazyLoadQuery<StudentFlashcardSetUserIdQuery>(
    graphql`
      query StudentFlashcardSetUserIdQuery {
        currentUserInfo {
          id
        }
      }
    `,
    {}
  );

  const [setFlashcardLearned, logging] =
    useMutation<StudentFlashcardSetLogProgressMutation>(graphql`
      mutation StudentFlashcardSetLogProgressMutation(
        $input: LogFlashcardLearnedInput!
      ) {
        logFlashcardLearned(input: $input) {
          success
        }
      }
    `);

  const [finishFlashCardSet] =
    useMutation<StudentFlashcardSetFinishFlashCardSetMutation>(graphql`
      mutation StudentFlashcardSetFinishFlashCardSetMutation(
        $userUUID: UUID!
        $courseUUID: UUID!
        $flashCardSetUUID: UUID!
        $correctAnswers: Int!
        $totalAnswers: Int!
      ) {
        finishFlashCardSet(
          userUUID: $userUUID
          courseUUID: $courseUUID
          flashCardSetUUID: $flashCardSetUUID
          correctAnswers: $correctAnswers
          totalAnswers: $totalAnswers
        )
      }
    `);

  if (flashcards.length === 0) {
    return <DisplayError message={emptyMessage} />;
  }

  const currentFlashcard = flashcards[currentIndex];
  const nextCard = async () => {
    setFlashcardLearned({
      variables: {
        input: {
          flashcardId: currentFlashcard.id,
          successful: knew,
        },
      },
      onCompleted() {
        if (knew) {
          setCorrectAnswers((prev) => prev + 1);
        }

        if (currentIndex + 1 < flashcards.length) {
          setCurrentIndex(currentIndex + 1);
          setKnew(false);
        } else {
          finishFlashCardSet({
            variables: {
              userUUID: currentUserInfo.id,
              courseUUID: courseId,
              flashCardSetUUID: flashcardSetId,
              correctAnswers: correctAnswers + (knew ? 1 : 0),
              totalAnswers: flashcards.length,
            },
            onCompleted() {
              onComplete();
            },
            onError,
          });
        }
      },
      onError,
    });
  };

  return (
    <div>
      <StudentFlashcard
        key={currentFlashcard.id}
        _flashcard={currentFlashcard._flashcard}
        label={`${currentIndex + 1}/${flashcards.length}`}
        onChange={(correctness) => setKnew(correctness === 1)}
      />

      <div className="mt-6 w-full flex justify-center">
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={nextCard}
          className="mb-6"
        >
          {logging ? (
            <CircularProgress size={16}></CircularProgress>
          ) : currentIndex + 1 < flashcards.length ? (
            "Next"
          ) : (
            "Finish"
          )}
        </Button>
      </div>
    </div>
  );
}
