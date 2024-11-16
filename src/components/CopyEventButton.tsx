"use client";
import { useState } from "react";
import { Button, ButtonProps } from "./ui/button";
import { Copy, CopyCheck, CopyX } from "lucide-react";
type CopyState = "idle" | "copied" | "error";
const CopyEventButton = ({
  eventId,
  clerkUserId,
  ...buttonPops
}: Omit<ButtonProps, "children" | "onClick"> & {
  eventId: string;
  clerkUserId: string;
}) => {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const CopyIcon = getCopyIcon(copyState);
  return (
    <Button
      {...buttonPops}
      onClick={() => {
        navigator.clipboard
          .writeText(`${location.origin}/book/${clerkUserId}/${eventId}`)
          .then(() => {
            setCopyState("copied");
            setTimeout(() => {
              setCopyState("idle");
            }, 2000);
          })
          .catch(() => {
            setCopyState("error");
            setTimeout(() => {
              setCopyState("idle");
            }, 2000);
          });
      }}
    >
      <CopyIcon className="mr-4 size-6" />
      {getChildren(copyState)}
    </Button>
  );
};

export default CopyEventButton;

function getCopyIcon(copyState: CopyState) {
  switch (copyState) {
    case "idle":
      return Copy;
    case "copied":
      return CopyCheck;
    case "error":
      return CopyX;
  }
}
function getChildren(copyState: CopyState) {
  switch (copyState) {
    case "idle":
      return "Copy Link";
    case "copied":
      return "Copied!";
    case "error":
      return "Error copying event";
  }
}
