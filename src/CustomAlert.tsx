import { Alert } from "@heroui/react";
import React from "react";

const CustomAlert: React.FC<{
  color: "primary" | "warning";
  title: string;
  description: string;
  endContent?: React.ReactNode;
}> = ({ color, title, description, endContent }) => (
  <Alert
    color={color}
    title={title}
    description={description}
    classNames={{
      base: "flex flex-col items-stretch gap-2",
      mainWrapper: "ms-0",
      description: "pl-0 text-tiny",
    }}
    endContent={endContent}
  />
);

export default CustomAlert;

export const CustomAlertFooter: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="flex justify-end gap-2">{children}</div>;
