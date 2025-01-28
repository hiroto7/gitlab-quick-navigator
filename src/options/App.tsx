import { Button, Listbox, ListboxItem } from "@heroui/react";
import { useChromeStorage } from "../hooks";

const App: React.FC = () => {
  const { items: storedData, set } = useChromeStorage<{
    origins?: Record<string, { token?: string }>;
  }>("local", true);

  if (storedData === undefined) return undefined;

  const options = storedData.origins ?? {};
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
                    void set({
                      origins: Object.fromEntries(
                        Object.entries(options).filter(
                          ([key]) => key !== origin,
                        ),
                      ),
                    });
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
