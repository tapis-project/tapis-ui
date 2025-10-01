import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertTitle, TextField, Stack } from "@mui/material";
import { Button } from "reactstrap";
import {
  GenericModal,
  TextCopyField,
  SubmitWrapper,
} from "@tapis/tapisui-common";
import { ToolbarModalProps } from "../Toolbar";
import { Files as Hooks } from "@tapis/tapisui-hooks";
import { useFilesSelect } from "../../FilesContext";

const DEFAULT_ALLOWED_USES = 1;
const DEFAULT_VALID_SECONDS = 3600; // 1 hour

const ShareModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = "",
  path = "/",
}) => {
  const { selectedFiles, unselect } = useFilesSelect();
  const { create, isLoading, isError, error, isSuccess, data, reset } =
    Hooks.PostIts.useCreate();

  const [allowedUses, setAllowedUses] = useState<number>(DEFAULT_ALLOWED_USES);
  const [validSeconds, setValidSeconds] = useState<number>(
    DEFAULT_VALID_SECONDS
  );
  const [redeemUrl, setRedeemUrl] = useState<string>("");

  const selected = selectedFiles[0];
  const isDir = selected?.type === "dir";
  const isMultipleSelection = selectedFiles.length > 1;

  const description = useMemo(() => {
    if (!selected) return "";
    const kind = isDir ? "folder" : "file";
    return `You are creating a shareable link for the ${kind} "${selected.name}" at ${selected.path}.`;
  }, [selected, isDir]);

  useEffect(() => {
    if (data?.result?.redeemUrl) {
      setRedeemUrl(data.result.redeemUrl);
    }
  }, [data]);

  const onGenerate = useCallback(() => {
    if (!selected) return;
    setRedeemUrl("");
    create(
      {
        systemId,
        path: selected.path!,
        createPostItRequest: {
          allowedUses,
          validSeconds,
        },
      },
      {
        onSuccess: (resp) => {
          setRedeemUrl(resp.result?.redeemUrl || "");
        },
      }
    );
  }, [create, systemId, selected, allowedUses, validSeconds]);

  const onClose = useCallback(() => {
    reset();
    setRedeemUrl("");
    unselect(selectedFiles);
    toggle();
  }, [reset, toggle, unselect, selectedFiles]);

  return (
    <GenericModal
      size="lg"
      toggle={onClose}
      title={"Share via PostIt"}
      body={
        <div>
          {isError && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error creating link</AlertTitle>
              {error.message}
            </Alert>
          )}
          {isMultipleSelection && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Multiple files selected</AlertTitle>
              You have selected {selectedFiles.length} items. Only the first
              item "{selected?.name}" will be shared. To share multiple files,
              select them one at a time or create a folder containing all files.
            </Alert>
          )}
          <p>{description}</p>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Allowed Uses"
              type="number"
              size="small"
              value={allowedUses}
              onChange={(e) =>
                setAllowedUses(Math.max(1, Number(e.target.value)))
              }
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Valid Seconds"
              type="number"
              size="small"
              value={validSeconds}
              onChange={(e) =>
                setValidSeconds(Math.max(1, Number(e.target.value)))
              }
              inputProps={{ min: 1 }}
            />
          </Stack>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <SubmitWrapper
              isLoading={isLoading}
              error={null}
              success={redeemUrl ? "Link created" : undefined}
            >
              <Button
                color="primary"
                onClick={onGenerate}
                disabled={!selected || isMultipleSelection}
              >
                Generate Link
              </Button>
            </SubmitWrapper>
            <div style={{ flex: 1 }}>
              <TextCopyField
                value={redeemUrl}
                placeholder="Shareable link will appear here"
              />
            </div>
          </div>
          {isSuccess && redeemUrl && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Link created. You can share this URL with users without
              authentication.
            </Alert>
          )}
        </div>
      }
    />
  );
};

export default ShareModal;
