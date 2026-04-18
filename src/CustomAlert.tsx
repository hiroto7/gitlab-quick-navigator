import { Alert, Button } from "@heroui/react";
import React, { useState } from "react";
import ChevronDownIcon from "./icons/ChevronDownIcon";
import ChevronUpIcon from "./icons/ChevronUpIcon";

const CustomAlert: React.FC<{
  color: "primary" | "warning";
  title: string;
  description?: React.ReactNode;
  endContent?: React.ReactNode;
  isCollapsible: boolean;
}> = ({ color, title, description, endContent, isCollapsible }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowDetail = !isCollapsible || isExpanded;
  const status = color === "primary" ? "accent" : color;

  return (
    <Alert status={status} className="flex flex-col items-stretch gap-2">
      <div className="flex w-full items-start justify-between gap-x-1">
        <Alert.Content className="w-full">
          <Alert.Title>{title}</Alert.Title>
          {shouldShowDetail && description && (
            <Alert.Description className="pl-0">
              {description}
            </Alert.Description>
          )}
        </Alert.Content>
        {isCollapsible && (
          <Button
            size="sm"
            variant="tertiary"
            isIconOnly
            onPress={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        )}
      </div>
      {shouldShowDetail && endContent}
    </Alert>
  );
};

export default CustomAlert;
