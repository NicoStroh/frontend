import { Autocomplete, Chip, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FormSection } from "./Form";

export type ContentMetadataPayload = {
  name: string;
  suggestedDate: string;
  rewardPoints: number;
  tagNames: readonly string[];
};

export function ContentMetadataFormSection({
  onChange,
  metadata,
}: {
  onChange: (side: ContentMetadataPayload | null) => void;
  metadata?: ContentMetadataPayload | null;
}) {
  const [name, setName] = useState(metadata?.name ?? "");
  const [suggestedDate, setSuggestedDate] = useState(
    metadata ? dayjs(metadata.suggestedDate) : null
  );
  const [rewardPointsStr, setRewardPointsStr] = useState(
    metadata?.rewardPoints.toString() ?? "0"
  );
  const [tags, setTags] = useState<string[]>([...(metadata?.tagNames ?? [])]);

  const rewardPoints = parseInt(rewardPointsStr);

  const valid =
    name.trim() != "" &&
    suggestedDate != null &&
    suggestedDate.isValid() &&
    rewardPoints.toString() === rewardPointsStr &&
    rewardPoints >= 0;

  useEffect(() => {
    onChange(
      valid
        ? {
            name,
            suggestedDate: suggestedDate.toISOString(),
            rewardPoints,
            tagNames: tags,
          }
        : null
    );
  }, [name, suggestedDate, rewardPointsStr, tags, rewardPoints, valid]);

  return (
    <FormSection title="Content details">
      <TextField
        className="w-96"
        label="Name"
        variant="outlined"
        value={name}
        error={!!metadata && name.trim() == ""}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <DatePicker
        label="Suggested start date"
        value={suggestedDate}
        onChange={setSuggestedDate}
        slotProps={{
          textField: {
            required: true,
            error:
              (metadata != null && suggestedDate == null) ||
              (suggestedDate != null && !suggestedDate.isValid()),
          },
        }}
      />
      <TextField
        className="w-96"
        label="Reward Points"
        variant="outlined"
        type="number"
        value={rewardPointsStr}
        error={
          (!(metadata == null && rewardPointsStr.trim() == "") &&
            rewardPoints.toString() !== rewardPointsStr) ||
          (rewardPoints ?? 0) < 0
        }
        helperText={
          (rewardPoints ?? 0) < 0 ? "Please enter a positive value" : undefined
        }
        onChange={(e) => setRewardPointsStr(e.target.value)}
        multiline
        required
      />

      <Autocomplete
        multiple
        options={[]}
        defaultValue={[]}
        freeSolo
        value={tags}
        className="w-96"
        onChange={(_, newValue: string[]) => {
          setTags(newValue);
        }}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => (
            // the key gets set by "getTagProps"
            // eslint-disable-next-line react/jsx-key
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => <TextField {...params} label="Tags" />}
      />
    </FormSection>
  );
}
