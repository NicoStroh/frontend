"use client";

import { studentStudentQuery } from "@/__generated__/studentStudentQuery.graphql";
import { CourseCard, yearDivisionToStringShort } from "@/components/CourseCard";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { chain } from "lodash";
import Link from "next/link";
import { useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-modal";
import ShortBartleTest from "@/components/bartletest/ShortBartleTest";
import { ApolloProvider, InMemoryCache, ApolloClient } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:8080/graphql",
  cache: new InMemoryCache(),
});

function StudentPageContent() {
  const { currentUserInfo } = useLazyLoadQuery<studentStudentQuery>(
    graphql`
      query studentStudentQuery {
        currentUserInfo {
          id
          availableCourseMemberships {
            role
            course {
              id
              title
              startDate
              startYear
              yearDivision
              userProgress {
                progress
              }
              suggestions(amount: 3) {
                ...SuggestionFragment
              }
              ...CourseCardFragment
            }
          }
          unavailableCourseMemberships {
            role
            course {
              id
              title
              startDate
              startYear
              yearDivision
              ...CourseCardFragment
            }
          }
        }
      }
    `,
    {}
  );

  const courses = [
    ...currentUserInfo.availableCourseMemberships.map((m) => ({
      course: m.course,
      suggestions: m.course.suggestions,
      progress: m.course.userProgress.progress,
      available: true,
    })),
    ...currentUserInfo.unavailableCourseMemberships.map((m) => ({
      course: m.course,
      suggestions: [],
      progress: 0,
      available: false,
    })),
  ];

  const [sortby, setSortby] = useState<"yearDivision" | "title" | "startYear">(
    "yearDivision"
  );

  const courseSections = chain(courses)
    .groupBy((x) => {
      if (sortby === "startYear") {
        return x.course.startYear;
      } else if (sortby === "title") {
        return x.course.title[0];
      } else {
        return x.course.yearDivision
          ? yearDivisionToStringShort[x.course.yearDivision] +
              " " +
              dayjs(x.course.startDate).year()
          : dayjs(x.course.startDate).year();
      }
    })
    .entries()
    .orderBy(
      sortby === "yearDivision"
        ? [
            ([key, courses]) => courses[0].course.startYear,
            ([key, courses]) => courses[0].course.yearDivision,
          ]
        : ([key, _]) => key,

      sortby === "title" ? "asc" : "desc"
    )
    .map(([key, courses]) => {
      return (
        <>
          <Typography variant="h6" gutterBottom>
            {key}
          </Typography>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mt-8 mb-10">
            {courses.map((c) => (
              <CourseCard
                key={c.course.id}
                _course={c.course}
                _suggestions={c.suggestions}
                progress={c.progress}
                available={c.available}
              />
            ))}
          </div>
        </>
      );
    })

    .value();

  const [showTest, setShowTest] = useState(false);
  const [showPopup, setShowPopup] = useState(true); // Boolean to control the popup visibility

  const handleTakeTestClick = () => {
    setShowTest(true);
    setShowPopup(false);
  };

  const handleBackToStartClick = () => {
    setShowTest(false);
  };

  if (showTest) {
    return <ShortBartleTest onBackToStart={handleBackToStartClick} />;
  }

  return (
    <main>
      <div className="flex flex-wrap justify-between mb-10">
        <Typography variant="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button
          variant="outline-primary"
          style={{ marginLeft: "220px" }}
          onClick={handleTakeTestClick}
        >
          Find out my player type
        </Button>
        {/* Sort by Selection */}
        <Box sx={{ minWidth: 120, maxWidth: 150 }}>
          <FormControl fullWidth>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortby}
              onChange={(e) => setSortby(e.target.value as any)}
              label={"Sort By"}
            >
              <MenuItem value={"yearDivision"}>Semester</MenuItem>
              <MenuItem value={"title"}>Alphabetically</MenuItem>
              <MenuItem value={"startYear"}>Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </div>

      {courseSections}

      {courses.length === 0 && (
        <div className="text-center text-2xl text-slate-400 my-80">
          You have not joined any courses yet. Visit the{" "}
          <Link href="/courses" className="italic hover:text-sky-500">
            Course Catalog
          </Link>{" "}
          to join courses.
        </div>
      )}

      <Modal
        isOpen={showPopup}
        onRequestClose={() => setShowPopup(false)}
        contentLabel="Take the Test"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            textAlign: "center",
          },
        }}
      >
        <h2>You have not yet taken the player-type test</h2>
        <Button variant="outline-primary" onClick={handleTakeTestClick}>
          Find out my player type
        </Button>
      </Modal>
    </main>
  );
}

export default function StudentPage() {
  return (
    <ApolloProvider client={client}>
      <StudentPageContent />
    </ApolloProvider>
  );
}
