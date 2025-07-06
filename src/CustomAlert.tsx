import { Alert, Button } from "@heroui/react";
import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";

const CustomAlert: React.FC<{
  color: "primary" | "warning";
  title: string;
  description?: React.ReactNode;
  endContent?: React.ReactNode;
  isCollapsible: boolean;
}> = ({ color, title, description, endContent, isCollapsible }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowDetail = !isCollapsible || isExpanded;

  return (
    <Alert
      hideIcon
      variant="faded"
      color={color}
      title={
        <div className="flex items-center justify-between gap-x-1">
          {title}
          {isCollapsible && (
            <Button
              size="sm"
              color={color}
              variant="light"
              isIconOnly
              onPress={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          )}
        </div>
      }
      description={shouldShowDetail && description}
      classNames={{
        base: "flex flex-col items-stretch gap-2",
        mainWrapper: "ms-0",
        description: "pl-0",
      }}
      endContent={shouldShowDetail && endContent}
    />
  );
};

export default CustomAlert;
