"use client";
import { pageStudentId0Query } from "@/__generated__/pageStudentId0Query.graphql";
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
import { pageUserQuestChainQuery } from "@/__generated__/pageUserQuestChainQuery.graphql";

export default function QuestsPage() {
  const { courseId } = useParams();
  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }
  return <_QuestsPage />;
}

function _QuestsPage() {
  const { courseId } = useParams();

  const { currentUserInfo } = useLazyLoadQuery<pageStudentId0Query>(
    graphql`
      query pageStudentId0Query {
        currentUserInfo {
          id
        }
      }
    `,
    {}
  );

  const { getUserQuestChain } = useLazyLoadQuery<pageUserQuestChainQuery>(
    graphql`
      query pageUserQuestChainQuery($userUUID: UUID!, $courseUUID: UUID!) {
        getUserQuestChain(userUUID: $userUUID, courseUUID: $courseUUID) {
          quests {
            questUUID
            finished
            description
            level
          }
          userLevel
          finished
        }
      }
    `,
    { courseUUID: courseId, userUUID: currentUserInfo.id },
    { fetchPolicy: "network-only" }
  );

  if (!getUserQuestChain) {
    return <PageError message="No quest chain found." />;
  }

  return (
    <div>
      <Heading title={"Quests"} backButton />
      <TableContainer sx={{ maxHeight: "100%" }} className="mt-4">
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Level</TableCell>
              <TableCell>Quest</TableCell>
              <TableCell>Finished</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getUserQuestChain.quests.map((quest) => (
              <TableRow key={quest.questUUID}>
                <TableCell>{quest.level}</TableCell>
                <TableCell>
                  {quest.level > getUserQuestChain.userLevel
                    ? "Finish the quests above to see this quest!"
                    : quest.description}
                </TableCell>
                <TableCell>
                  {quest.finished ? <span>✔️</span> : <span>❌</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
