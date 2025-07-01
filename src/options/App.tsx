import {
  Button,
  Listbox,
  ListboxItem,
  Radio,
  RadioGroup,
  Checkbox,
} from "@heroui/react";
import { useChromeStorage } from "../hooks";
import { StoredData } from "../lib";

const App: React.FC = () => {
  const { items: storedData, set } = useChromeStorage<StoredData>(
    "local",
    true,
  );

  if (storedData === undefined) return undefined;

  const {
    origins = {},
    actionBehavior = "side_panel",
    autoTabSwitch = false,
  } = storedData;
  return (
    <div className="mx-auto max-w-xl space-y-8 p-4">
      <h1>GitLab Quick Navigatorの設定</h1>

      <div className="space-y-4">
        <RadioGroup
          label="アイコンクリック時の動作"
          value={actionBehavior}
          onValueChange={(value) => {
            void set({ actionBehavior: value as "popup" | "side_panel" });
          }}
        >
          <Radio value="side_panel">サイドパネルで開く</Radio>
          <Radio value="popup">ポップアップで開く</Radio>
        </RadioGroup>

        <Checkbox
          isSelected={autoTabSwitch}
          onValueChange={(isSelected) =>
            void set({ autoTabSwitch: isSelected })
          }
        >
          アイテム選択時に自動でタブを切り替える
        </Checkbox>
      </div>

      <Listbox
        shouldHighlightOnFocus={false}
        topContent="GitLab Quick Navigatorを有効化したサイト"
      >
        {Object.entries(origins).map(([origin, siteOptions]) => {
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
                          Object.entries(origins).filter(
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
    </div>
  );
};

export default App;
