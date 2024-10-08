import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";

import { EditCourseModalDeleteMutation } from "@/__generated__/EditCourseModalDeleteMutation.graphql";
import { EditCourseModalFragment$key } from "@/__generated__/EditCourseModalFragment.graphql";
import { EditCourseModalMutation } from "@/__generated__/EditCourseModalMutation.graphql";
import { EditCourseModalDeleteBadgesAndQuestsOfCourseMutation } from "@/__generated__/EditCourseModalDeleteBadgesAndQuestsOfCourseMutation.graphql";
import { Form, FormSection } from "./Form";

export function EditCourseModal({
  _course,
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
  _course: EditCourseModalFragment$key;
}) {
  const router = useRouter();

  const course = useFragment(
    graphql`
      fragment EditCourseModalFragment on Course {
        id
        title
        description
        startDate
        endDate
        published
      }
    `,
    _course
  );

  const [updateCourse, isUpdating] =
    useMutation<EditCourseModalMutation>(graphql`
      mutation EditCourseModalMutation($course: UpdateCourseInput!) {
        updateCourse(input: $course) {
          id
          ...EditCourseModalFragment
        }
      }
    `);

  const [deleteCourse] = useMutation<EditCourseModalDeleteMutation>(graphql`
    mutation EditCourseModalDeleteMutation($id: UUID!) {
      deleteCourse(id: $id)
    }
  `);

  const [deleteBadgesAndQuests, deletingBadgesAndQuests] =
    useMutation<EditCourseModalDeleteBadgesAndQuestsOfCourseMutation>(graphql`
      mutation EditCourseModalDeleteBadgesAndQuestsOfCourseMutation(
        $courseUUID: UUID!
      ) {
        deleteBadgesAndQuestsOfCourse(courseUUID: $courseUUID)
      }
    `);

  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs(course.startDate)
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs(course.endDate));
  const [publish, setPublish] = useState(course.published);

  const [error, setError] = useState<any>(null);
  const valid =
    title !== "" &&
    startDate != null &&
    startDate.isValid() &&
    endDate != null &&
    endDate.isValid();

  function handleSubmit() {
    updateCourse({
      variables: {
        course: {
          id: course.id,
          title,
          description,
          startDate: startDate!.toISOString(),
          endDate: endDate!.toISOString(),
          published: publish,
        },
      },
      onError(error) {
        setError(error);
      },
      onCompleted() {
        onClose();
      },
    });
  }

  function handleReset() {
    setTitle(course.title);
    setDescription(course.description);
    setStartDate(dayjs(course.startDate));
    setEndDate(dayjs(course.endDate));
    setPublish(course.published);
    setError(null);
  }

  function handleDelete() {
    deleteCourse({
      variables: { id: course.id },
      onError(error) {
        setError(error);
      },
      onCompleted() {
        deleteBadgesAndQuests({
          variables: { courseUUID: course.id },
          onCompleted() {
            router.push("/");
          },
          onError(error) {
            setError(error);
          },
        });
      },
      updater(store) {
        try {
          store.get(course.id)?.invalidateRecord();
        } catch (err) {
          console.error(err);
        }
      },
    });
  }

  return (
    <>
      <Dialog maxWidth="lg" onClose={onClose} open={open}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
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
          <Form>
            <FormSection title="Course details">
              <TextField
                className="w-96"
                label="Title"
                variant="outlined"
                value={title}
                error={title === ""}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <TextField
                className="w-96"
                label="Description"
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
              />
            </FormSection>

            <FormSection
              title="Start and end"
              subtitle="The chapter will be hidden before and after this date"
            >
              <DatePicker
                label="Start date"
                value={startDate}
                maxDate={endDate ?? undefined}
                onChange={setStartDate}
                slotProps={{
                  textField: {
                    required: true,
                    error: startDate == null || !startDate.isValid(),
                  },
                }}
              />
              <DatePicker
                label="End date"
                value={endDate}
                minDate={startDate ?? undefined}
                defaultCalendarMonth={startDate ?? undefined}
                onChange={setEndDate}
                slotProps={{
                  textField: {
                    required: true,
                    error: endDate == null || !endDate.isValid(),
                  },
                }}
              />
            </FormSection>

            <FormSection title="Published">
              <Switch
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
              />
            </FormSection>
          </Form>
          <Backdrop
            open={isUpdating || deletingBadgesAndQuests}
            sx={{ zIndex: "modal" }}
          >
            <CircularProgress />
          </Backdrop>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
          <Button onClick={handleReset} variant="outlined">
            Reset
          </Button>
          <Button disabled={!valid} variant="contained" onClick={handleSubmit}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
