import { Button, Listbox, ListboxItem } from "@nextui-org/react";
import { useChromeStorage } from "../hooks";

const App: React.FC = () => {
  const options = useChromeStorage("local") as
    | Record<string, { token?: string }>
    | undefined;

  if (options === undefined) return undefined;

  return (
    <Listbox
      shouldHighlightOnFocus={false}
      className="mx-auto max-w-xl"
      topContent="GitLab Quick Navigatorを有効化したサイト"
    >
      {Object.entries(options).map(([origin, siteOptions]) => {
        return (
          <ListboxItem
            showDivider
            key={origin}
            description={
              siteOptions.token !== undefined
                ? "アクセストークン設定済み"
                : undefined
            }
            endContent={
              <Button
                size="sm"
                color="danger"
                onPress={() => {
                  if (
                    siteOptions.token === undefined ||
                    confirm(
                      `${origin} でGitLab Quick Navigatorを無効化すると、設定したアクセストークンも削除されます。`,
                    )
                  )
                    chrome.storage.local.remove(origin);
                }}
                className="flex-shrink-0"
              >
                無効にする
              </Button>
            }
          >
            {origin}
          </ListboxItem>
        );
      })}
    </Listbox>
  );
};

export default App;
