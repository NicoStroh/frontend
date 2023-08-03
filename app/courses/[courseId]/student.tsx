"use client";
import { studentCourseIdQuery } from "@/__generated__/studentCourseIdQuery.graphql";
import {
  Alert,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { chain, orderBy } from "lodash";
import Error from "next/error";
import { useParams, useRouter } from "next/navigation";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { studentCourseLeaveMutation } from "@/__generated__/studentCourseLeaveMutation.graphql";
import { ChapterContent } from "@/components/ChapterContent";
import { ChapterHeader } from "@/components/ChapterHeader";
import { ContentLink } from "@/components/Content";
import { RewardScores } from "@/components/RewardScores";
import { Info } from "@mui/icons-material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import dayjs from "dayjs";
import Link from "next/link";
import { useState } from "react";
import { Section, SectionContent } from "@/components/Section";
import { Stage } from "@/components/Stage";

interface Data {
  name: string;
  power: number;
}

function createData(name: string, power: number) {
  return { name, power };
}

export default function StudentCoursePage() {
  // Get course id from url
  const params = useParams();
  const id = params.courseId;

  const router = useRouter();
  // Info dialog
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [error, setError] = useState<any>(null);

  // Fetch course data
  const {
    coursesById,
    scoreboard,
    currentUserInfo: { id: userId },
  } = useLazyLoadQuery<studentCourseIdQuery>(
    graphql`
      query studentCourseIdQuery($id: UUID!) {
        scoreboard(courseId: $id) {
          user {
            userName
          }
          powerScore
        }
        currentUserInfo {
          id
        }

        coursesById(ids: [$id]) {
          id
          title
          description
          rewardScores {
            ...RewardScoresFragment
          }
          chapters {
            elements {
              id
              title
              number
              startDate
              endDate
              suggestedStartDate
              suggestedEndDate
              contents {
                ...ContentLinkFragment

                userProgressData {
                  nextLearnDate
                  lastLearnDate
                }

                id
                metadata {
                  type
                }
              }
            }
          }
        }
      }
    `,
    { id }
  );

  const [leave] = useMutation<studentCourseLeaveMutation>(graphql`
    mutation studentCourseLeaveMutation($input: CourseMembershipInput!) {
      deleteMembership(input: $input) {
        courseId
        role
      }
    }
  `);

  // Show 404 error page if id was not found
  if (coursesById.length == 0) {
    return <Error statusCode={404} title="Course could not be found." />;
  }

  // Extract scoreboard
  const rows: Data[] = scoreboard
    .slice(0, 3)
    .map((element) => createData(element.user.userName, element.powerScore));

  // Extract course
  const course = coursesById[0];

  const nextFlashcard = chain(course.chapters.elements)
    .flatMap((x) => x.contents)
    .filter((x) => x.metadata.type === "FLASHCARDS")
    .minBy((x) => new Date(x.userProgressData.nextLearnDate))
    .value();
  const nextQuiz = chain(course.chapters.elements)
    .flatMap((x) => x.contents)
    .filter((x) => x.metadata.type === "QUIZ")
    .minBy((x) => new Date(x.userProgressData.nextLearnDate))
    .value();
  const nextVideo = chain(course.chapters.elements)
    .flatMap((x) => x.contents)
    .filter((x) => x.metadata.type === "MEDIA")
    .minBy((x) => new Date(x.userProgressData.nextLearnDate))
    .value();

  return (
    <main>
      {error?.source.errors.map((err: any, i: number) => (
        <Alert
          key={i}
          severity="error"
          sx={{ minWidth: 400, maxWidth: 800, width: "fit-content" }}
          onClose={() => setError(null)}
        >
          {err.message}
        </Alert>
      ))}
      <div className="flex gap-4 items-center">
        <Typography variant="h1">{course.title}</Typography>
        <IconButton onClick={() => setInfoDialogOpen(true)}>
          <Info />
        </IconButton>

        <div className="flex-1"></div>

        <Button
          color="inherit"
          size="small"
          variant="text"
          onClick={() => {
            if (
              confirm(
                "Do you really want to leave this course? You might loose the progress you've already made"
              )
            ) {
              leave({
                variables: {
                  input: { courseId: id, role: "STUDENT", userId },
                },
                onError: setError,

                updater(store) {
                  const userRecord = store.get(userId)!;
                  const records =
                    userRecord.getLinkedRecords("courseMemberships")!;

                  userRecord.setLinkedRecords(
                    records.filter((x) => x.getValue("courseId") !== id),
                    "courseMemberships"
                  );
                },
                onCompleted() {
                  router.push("/courses");
                },
              });
            }
          }}
        >
          Leave course
        </Button>
      </div>
      <InfoDialog
        open={infoDialogOpen}
        title={course.title}
        description={course.description}
        onClose={() => setInfoDialogOpen(false)}
      />
      <div className="grid grid-cols-2 items-start">
        <div className="w-fit my-12">
          <div className="pl-8 pr-10 py-6 border-4 border-slate-200 rounded-3xl">
            <RewardScores _scores={course.rewardScores} courseId={course.id} />
          </div>
          <Button
            className="!mt-2 !ml-8"
            endIcon={<NavigateNextIcon />}
            onClick={() => router.push(`/courses/${id}/statistics`)}
          >
            Full history
          </Button>
        </div>
        <div>
          <TableContainer component={Paper} className="mt-12 mb-2">
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell align="right">Power</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.power}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Link href={{ pathname: `${id}/scoreboard` }}>
            <Button variant="text" endIcon={<NavigateNextIcon />}>
              Full Scoreboard
            </Button>
          </Link>
        </div>
      </div>

      <section className="mt-8 mb-20">
        <Typography variant="h2">Up next</Typography>
        <div className="mt-8 gap-8 grid gap-x-12 gap-y-4 grid-cols-[max-content] xl:grid-cols-[repeat(2,max-content)] 2xl:grid-cols-[repeat(3,max-content)]">
          {nextFlashcard && <ContentLink _content={nextFlashcard} />}
          {nextQuiz && <ContentLink _content={nextQuiz} />}
          {nextVideo && <ContentLink _content={nextVideo} />}
        </div>
      </section>

      {orderBy(course.chapters.elements, (x) => x.number).map((chapter) => {
        const chapterProgress =
          chapter.contents.length > 0
            ? (100 *
                chapter.contents.filter(
                  (content) => content.userProgressData.lastLearnDate != null
                ).length) /
              chapter.contents.length
            : 0;

        return (
          <section key={chapter.id} className="mt-6">
            <ChapterHeader
              title={chapter.title}
              subtitle={`${dayjs(
                chapter.suggestedStartDate ?? chapter.startDate
              ).format("D. MMMM")} – ${dayjs(
                chapter.suggestedEndDate ?? chapter.endDate
              ).format("D. MMMM")}`}
              progress={chapterProgress}
            />
            <ChapterContent>
              <Section done={chapterProgress == 100}>
                <SectionContent>
                  <Stage progress={chapterProgress}>
                    {chapter.contents.map((content) => (
                      <ContentLink key={content.id} _content={content} />
                    ))}
                  </Stage>
                </SectionContent>
              </Section>
            </ChapterContent>
          </section>
        );
      })}
    </main>
  );
}

function InfoDialog({
  title,
  description,
  open,
  onClose,
}: {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <Typography variant="body1" sx={{ padding: 3, paddingTop: 0 }}>
        {description}
      </Typography>
    </Dialog>
  );
}
