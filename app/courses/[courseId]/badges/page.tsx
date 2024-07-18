"use client";
import { pageCoursesUserBadgesQuery } from "@/__generated__/pageCoursesUserBadgesQuery.graphql";
import { pageStudentIdQuery } from "@/__generated__/pageStudentIdQuery.graphql";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { isUUID } from "@/src/utils";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useParams } from "next/navigation";
import * as React from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

export default function BadgesPage() {
  const { courseId } = useParams();
  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }
  return <_BadgesPage />;
}

function _BadgesPage() {
  const { courseId } = useParams();

  const { currentUserInfo } = useLazyLoadQuery<pageStudentIdQuery>(
    graphql`
      query pageStudentIdQuery {
        currentUserInfo {
          id
        }
      }
    `,
    {}
  );

  const { getCoursesUserBadges } = useLazyLoadQuery<pageCoursesUserBadgesQuery>(
    graphql`
      query pageCoursesUserBadgesQuery($courseUUID: UUID!, $userUUID: UUID!) {
        getCoursesUserBadges(courseUUID: $courseUUID, userUUID: $userUUID) {
          userBadgeUUID
          achieved
          description
          passingPercentage
        }
      }
    `,
    { courseUUID: courseId, userUUID: currentUserInfo.id }
  );

  return (
    <div>
      <Heading title={"Badges"} backButton />
      <TableContainer sx={{ maxHeight: "100%" }} className="mt-4">
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Badge ID</TableCell>
              <TableCell>Achieved</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCoursesUserBadges.map((badge) => (
              <TableRow key={badge.userBadgeUUID}>
                <TableCell>{badge.userBadgeUUID}</TableCell>
                <TableCell>
                  {badge.achieved ? "Achieved" : "Not Achieved"}
                </TableCell>
                <TableCell>{badge.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
