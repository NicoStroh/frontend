"use client";

import { studentContentDownloadButtonFragment$key } from "@/__generated__/studentContentDownloadButtonFragment.graphql";
import { studentContentMediaDisplayFragment$key } from "@/__generated__/studentContentMediaDisplayFragment.graphql";
import { studentFixRecordUrlFragment$key } from "@/__generated__/studentFixRecordUrlFragment.graphql";
import { studentMediaLogProgressMutation } from "@/__generated__/studentMediaLogProgressMutation.graphql";
import { studentMediaQuery } from "@/__generated__/studentMediaQuery.graphql";
import { MediaContent } from "@/components/Content";
import { Heading } from "@/components/Heading";
import { PdfViewer } from "@/components/PdfViewer";
import { Download } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { first } from "lodash";
import Error from "next/error";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import ReactPlayer from "react-player";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";

export default function StudentMediaPage() {
  const { mediaId } = useParams();
  const searchParams = useSearchParams();
  const media = useLazyLoadQuery<studentMediaQuery>(
    graphql`
      query studentMediaQuery($mediaId: UUID!) {
        contentsByIds(ids: [$mediaId]) {
          metadata {
            name
            type
          }
          ... on MediaContent {
            mediaRecords {
              id
              name
              ...studentContentMediaDisplayFragment
              ...studentContentDownloadButtonFragment
              ...studentFixRecordUrlFragment
            }
          }

          ...ContentMediaFragment
        }
      }
    `,
    { mediaId }
  );

  const recordId = searchParams.get("recordId");

  const content = media.contentsByIds[0];

  const mainRecord = recordId
    ? content?.mediaRecords?.find((record) => record.id === recordId)
    : first(content?.mediaRecords ?? []);

  const [mediaRecordWorkedOn] =
    useMutation<studentMediaLogProgressMutation>(graphql`
      mutation studentMediaLogProgressMutation($id: UUID!) {
        logMediaRecordWorkedOn(mediaRecordId: $id) {
          id
        }
      }
    `);

  useEffect(() => {
    if (mainRecord) {
      const timeout = setTimeout(() => {
        mediaRecordWorkedOn({ variables: { id: mainRecord.id } });
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [mainRecord, mediaRecordWorkedOn]);

  if (media.contentsByIds.length == 0) {
    return <Error statusCode={404} />;
  }

  if (content.metadata.type !== "MEDIA") {
    return <Error statusCode={400} />;
  }
  if (!content.mediaRecords || content.mediaRecords.length == 0) {
    return <Error statusCode={404} />;
  }

  if (mainRecord == null) {
    return <Error statusCode={404} />;
  }

  const relatedRecords = content.mediaRecords.filter(
    (record) => record.id !== mainRecord.id
  );
  return (
    <main className="flex flex-col h-full">
      <Heading
        title={mainRecord.name}
        overline={content.metadata.name}
        action={<DownloadButton _record={mainRecord} />}
        backButton
      />
      <div className="my-8 grow">
        <ContentMediaDisplay _record={mainRecord} />
      </div>
      {relatedRecords.length > 0 && (
        <>
          <Typography variant="h2">Related media</Typography>
          <div className="mt-4">
            {relatedRecords.map((record) => (
              <MediaContent
                key={record.id}
                _media={content}
                recordId={record.id}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function useDownloadUrl(_record: studentFixRecordUrlFragment$key) {
  const mediaRecord = useFragment(
    graphql`
      fragment studentFixRecordUrlFragment on MediaRecord {
        downloadUrl
      }
    `,
    _record
  );

  const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL ?? "http://localhost:9000";
  const downloadUrl = new URL(mediaRecord.downloadUrl);
  const url = `${baseUrl}${downloadUrl.pathname}${downloadUrl.search}`;

  return url;
}

function ContentMediaDisplay({
  _record,
}: {
  _record: studentContentMediaDisplayFragment$key;
}) {
  const mediaRecord = useFragment(
    graphql`
      fragment studentContentMediaDisplayFragment on MediaRecord {
        ...studentFixRecordUrlFragment
        type
      }
    `,
    _record
  );

  const url = useDownloadUrl(mediaRecord);

  switch (mediaRecord.type) {
    case "VIDEO":
      return <ReactPlayer url={url} width="100%" height="auto" controls />;
    case "PRESENTATION":
    case "DOCUMENT":
      return <PdfViewer url={url} />;
    default:
      return <>Unsupported media type</>;
  }
}

function DownloadButton({
  _record,
}: {
  _record: studentContentDownloadButtonFragment$key;
}) {
  const mediaRecord = useFragment(
    graphql`
      fragment studentContentDownloadButtonFragment on MediaRecord {
        ...studentFixRecordUrlFragment
        name
      }
    `,
    _record
  );

  const url = useDownloadUrl(mediaRecord);
  return (
    <Button
      href={url}
      target="_blank"
      download={mediaRecord.name}
      sx={{ color: "text.secondary" }}
      startIcon={<Download />}
    >
      Download
    </Button>
  );
}
