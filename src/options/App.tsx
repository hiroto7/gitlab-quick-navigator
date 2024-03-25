import { Button, Listbox, ListboxItem } from "@nextui-org/react";
import { useChromeStorage } from "../hooks";

const App: React.FC = () => {
  const tokens = useChromeStorage("local") as
    | Record<string, string>
    | undefined;

  if (tokens === undefined) return undefined;

  return (
    <Listbox
      shouldHighlightOnFocus={false}
      className="max-w-xl mx-auto"
      topContent="設定済みのアクセストークン"
    >
      {Object.keys(tokens).map((origin) => (
        <ListboxItem
          showDivider
          key={origin}
          shouldHighlightOnFocus={false}
          endContent={
            <Button
              size="sm"
              onPress={() => {
                if (
                  confirm(
                    `${origin} 用のアクセストークンを削除してもよろしいですか？`,
                  )
                )
                  chrome.storage.local.remove(origin);
              }}
            >
              削除
            </Button>
          }
        >
          {origin}
        </ListboxItem>
      ))}
    </Listbox>
  );
};

export default App;
