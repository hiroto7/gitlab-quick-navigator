import { Alert } from "@heroui/react";
import React from "react";

const CustomAlert: React.FC<{
  color: "primary" | "warning";
  title: string;
  description?: React.ReactNode;
  endContent?: React.ReactNode;
}> = ({ color, title, description, endContent }) => (
  <Alert
    hideIcon
    variant="faded"
    color={color}
    title={title}
    description={description}
    classNames={{
      base: "flex flex-col items-stretch gap-2",
      mainWrapper: "ms-0",
      description: "pl-0",
    }}
    endContent={endContent}
  />
);

export default CustomAlert;
