"use client";

import { studentDueFlashcardsQuery } from "@/__generated__/studentDueFlashcardsQuery.graphql";
import { FormErrors } from "@/components/FormErrors";
import { Heading } from "@/components/Heading";
import { StudentFlashcardSet } from "@/components/StudentFlashcardSet";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { studentChapterIdQuery } from "@/__generated__/studentChapterIdQuery.graphql";

export default function StudentDueFlashcards() {
  // Get course id from url
  const { flashcardSetId, courseId } = useParams();
  const router = useRouter();
  const [error, setError] = useState<any>(null);

  // Fetch course data
  const { dueFlashcardsByCourseId } =
    useLazyLoadQuery<studentDueFlashcardsQuery>(
      graphql`
        query studentDueFlashcardsQuery($courseId: UUID!) {
          dueFlashcardsByCourseId(courseId: $courseId) {
            id
            ...StudentFlashcard
          }
        }
      `,
      { courseId }
    );

  const { findContentsByIds } = useLazyLoadQuery<studentChapterIdQuery>(
    graphql`
      query studentChapterIdQuery($id: [UUID!]!) {
        findContentsByIds(ids: $id) {
          metadata {
            chapterId
          }
        }
      }
    `,
    { id: [flashcardSetId] }
  );
  const chapterId = findContentsByIds[0]?.metadata.chapterId as string;

  return (
    <main className="flex flex-col h-full">
      <Heading title="Due flashcards" backButton />
      <FormErrors error={error} onClose={() => setError(null)} />

      <StudentFlashcardSet
        flashcards={dueFlashcardsByCourseId.map((x) => ({
          id: x.id,
          _flashcard: x,
        }))}
        emptyMessage="No flashcards to repeat."
        onComplete={() => router.push(`/courses/${courseId}`)}
        onError={setError}
        courseId={courseId}
        flashcardSetId={flashcardSetId}
        chapterId={chapterId}
      />
    </main>
  );
}
