import { Button, Listbox, ListboxItem } from "@heroui/react";
import { useChromeStorage } from "../hooks";
import { StoredData } from "../lib";

const App: React.FC = () => {
  const { items: storedData, set } = useChromeStorage<StoredData>(
    "local",
    true,
  );

  if (storedData === undefined) return undefined;

  const options = storedData.origins ?? {};
  return (
    <Listbox
      shouldHighlightOnFocus={false}
      className="mx-auto max-w-xl"
      topContent="GitLab Quick Navigatorを有効化したサイト"
    >
      {Object.entries(options).map(([origin, siteOptions]) => {
        const host = new URL(origin).host;

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
                      `${host} でGitLab Quick Navigatorを無効化してもよろしいですか？無効化すると設定済みのアクセストークンが削除されます。`,
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
