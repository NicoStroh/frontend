import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";

import { AddFlashcardSetModalFragment$key } from "@/__generated__/AddFlashcardSetModalFragment.graphql";
import { AddFlashcardSetModalCreateFlashCardSetMutation } from "@/__generated__/AddFlashcardSetModalCreateFlashCardSetMutation.graphql";
import {
  AddFlashcardSetModalMutation,
  ContentType,
  SkillType,
} from "@/__generated__/AddFlashcardSetModalMutation.graphql";
import {
  AssessmentMetadataFormSection,
  AssessmentMetadataPayload,
} from "./AssessmentMetadataFormSection";
import {
  ContentMetadataFormSection,
  ContentMetadataPayload,
} from "./ContentMetadataFormSection";
import { Form } from "./Form";
import { useParams } from "next/navigation";

export function AddFlashcardSetModal({
  onClose,
  _chapter,
}: {
  onClose: () => void;
  _chapter: AddFlashcardSetModalFragment$key;
}) {
  const [metadata, setMetadata] = useState<ContentMetadataPayload | null>(null);
  const [assessmentMetadata, setAssessmentMetadata] =
    useState<AssessmentMetadataPayload | null>(null);
  const [error, setError] = useState<any>(null);
  const [isCreatingFlashcardSet, setIsCreatingFlashcardSet] = useState(false);
  const [createBadgesLoading, setCreateBadgesLoading] = useState(false);
  const valid = metadata != null && assessmentMetadata != null;

  const { courseId } = useParams();

  const chapter = useFragment(
    graphql`
      fragment AddFlashcardSetModalFragment on Chapter {
        id
        __id
      }
    `,
    _chapter
  );

  const [createFlashcardSet] =
    useMutation<AddFlashcardSetModalMutation>(graphql`
      mutation AddFlashcardSetModalMutation(
        $assessmentInput: CreateAssessmentInput!
      ) {
        createFlashcardSetAssessment(
          assessmentInput: $assessmentInput
          flashcardSetInput: { flashcards: [] }
        ) {
          __id
          __typename
          ...ContentLinkFragment
          id
          userProgressData {
            nextLearnDate
          }
        }
      }
    `);

  const [createFlashCardSet] =
    useMutation<AddFlashcardSetModalCreateFlashCardSetMutation>(
      graphql`
        mutation AddFlashcardSetModalCreateFlashCardSetMutation(
          $flashCardSetUUID: UUID!
          $name: String!
          $courseUUID: UUID!
        ) {
          createFlashCardSet(
            flashCardSetUUID: $flashCardSetUUID
            name: $name
            courseUUID: $courseUUID
          )
        }
      `
    );

  function handleSubmit() {
    if (!valid) return;

    setIsCreatingFlashcardSet(true);

    createFlashcardSet({
      variables: {
        assessmentInput: {
          metadata: {
            ...metadata!,
            chapterId: chapter.id,
            type: "FLASHCARDS" as ContentType,
          },
          assessmentMetadata: {
            ...assessmentMetadata!,
            skillTypes: assessmentMetadata!.skillTypes as SkillType[],
            initialLearningInterval: assessmentMetadata!
              .initialLearningInterval as number,
          },
        },
      },
      onError: (err) => {
        setError(err);
        setIsCreatingFlashcardSet(false);
      },
      onCompleted(response) {
        const flashCardSetUUID = response!.createFlashcardSetAssessment!.id;
        setCreateBadgesLoading(true);
        createFlashCardSet({
          variables: {
            flashCardSetUUID,
            name: metadata!.name,
            courseUUID: courseId,
          },
          onError: (err) => {
            setError(err);
            setCreateBadgesLoading(false);
          },
          onCompleted() {
            setIsCreatingFlashcardSet(false);
            setCreateBadgesLoading(false);
            onClose();
          },
        });
      },
      updater(store, response) {
        // Get record of chapter and of the new assignment
        const chapterRecord = store.get(chapter.__id);
        const newRecord = store.get(
          response!.createFlashcardSetAssessment!.__id
        );
        if (!chapterRecord || !newRecord) return;

        // Update the linked records of the chapter contents
        const contentRecords = chapterRecord.getLinkedRecords("contents") ?? [];
        chapterRecord.setLinkedRecords(
          [...contentRecords, newRecord],
          "contents"
        );
      },
    });
  }

  return (
    <>
      <Dialog maxWidth="md" open onClose={onClose}>
        <DialogTitle>Add flashcard set</DialogTitle>
        <DialogContent>
          {error?.source.errors.map((err: any, i: number) => (
            <Alert key={i} severity="error" onClose={() => setError(null)}>
              {err.message}
            </Alert>
          ))}
          <Form>
            <ContentMetadataFormSection onChange={setMetadata} />
            <AssessmentMetadataFormSection onChange={setAssessmentMetadata} />
          </Form>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            disabled={!valid || isCreatingFlashcardSet}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop
        open={isCreatingFlashcardSet || createBadgesLoading}
        sx={{ zIndex: "modal" }}
      >
        <CircularProgress />
      </Backdrop>
    </>
  );
}
