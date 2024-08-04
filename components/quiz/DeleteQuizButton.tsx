import { DeleteQuizButtonMutation } from "@/__generated__/DeleteQuizButtonMutation.graphql";
import { Delete } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { graphql, useMutation } from "react-relay";
import { DeleteQuizButtonDeleteBadgesAndQuestOfQuizMutation } from "@/__generated__/DeleteQuizButtonDeleteBadgesAndQuestOfQuizMutation.graphql";

export function DeleteQuizButton({
  chapterId,
  contentId,
  courseId,
  onError,
  onCompleted,
}: {
  chapterId: string;
  contentId: string;
  courseId: string;
  onError: (e: any) => void;
  onCompleted: () => void;
}) {
  const [deleteQuiz, deleting] = useMutation<DeleteQuizButtonMutation>(graphql`
    mutation DeleteQuizButtonMutation($id: UUID!) {
      mutateContent(contentId: $id) {
        deleteContent
      }
    }
  `);

  const [deleteBadgesAndQuest, deletingBadgesAndQuest] =
    useMutation<DeleteQuizButtonDeleteBadgesAndQuestOfQuizMutation>(graphql`
      mutation DeleteQuizButtonDeleteBadgesAndQuestOfQuizMutation(
        $quizUUID: UUID!
        $courseUUID: UUID!
      ) {
        deleteBadgesAndQuestOfQuiz(quizUUID: $quizUUID, courseUUID: $courseUUID)
      }
    `);

  return (
    <Button
      sx={{ color: "text.secondary" }}
      startIcon={
        deleting || deletingBadgesAndQuest ? (
          <CircularProgress size={16} />
        ) : (
          <Delete />
        )
      }
      onClick={() => {
        if (
          confirm(
            "Do you really want to delete this quiz? This can't be undone."
          )
        ) {
          deleteQuiz({
            variables: { id: contentId },
            onCompleted() {
              deleteBadgesAndQuest({
                variables: { quizUUID: contentId, courseUUID: courseId },
                onCompleted,
                onError,
              });
            },
            onError,
            updater(store) {
              store.get(contentId)?.invalidateRecord();
            },
          });
        }
      }}
    >
      Delete
    </Button>
  );
}
