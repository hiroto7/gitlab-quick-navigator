import {
  Button,
  Checkbox,
  Description,
  Label,
  ListBox,
  Radio,
  RadioGroup,
} from "@heroui/react";
import { useChromeLocalStorage } from "../contexts/ChromeStorageContext";

const App: React.FC = () => {
  const { items: storedData, set } = useChromeLocalStorage();

  const {
    origins = {},
    actionBehavior = "side_panel",
    autoTabSwitch = false,
  } = storedData;
  return (
    <div className="prose dark:prose-invert mx-auto max-w-xl p-4">
      <h1>GitLab Quick Navigatorの設定</h1>

      <h2>アイコンクリック時の動作</h2>
      <RadioGroup
        name="action-behavior"
        value={actionBehavior}
        onChange={(value) => {
          void set({ actionBehavior: value as "popup" | "side_panel" });
        }}
      >
        <Radio value="side_panel">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>サイドパネルで開く</Label>
            <Description>
              ページを移動したりタブを切り替えたりしても、サイドパネルは開いたままになります
            </Description>
          </Radio.Content>
        </Radio>
        <Radio value="popup">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>ポップアップで開く</Label>
            <Description>
              ページを移動したりタブを切り替えたりすると、ポップアップは自動的に閉じます
            </Description>
          </Radio.Content>
        </Radio>
      </RadioGroup>

      <h2>アイテム選択時の動作</h2>
      <Checkbox
        id="auto-tab-switch"
        isSelected={autoTabSwitch}
        onChange={(isSelected) => void set({ autoTabSwitch: isSelected })}
      >
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label htmlFor="auto-tab-switch">
            アイテム選択時に自動でタブを切り替える
          </Label>
        </Checkbox.Content>
      </Checkbox>

      <h2>有効化済みのサイト</h2>
      <ListBox className="not-prose">
        {Object.entries(origins).map(([origin, siteOptions]) => {
          const host = new URL(origin).host;

          return (
            <ListBox.Item
              key={origin}
              id={origin}
              textValue={origin}
              className="flex items-center gap-2"
            >
              <span className="min-w-0 flex-1">
                <Label className="block truncate">{origin}</Label>
                {siteOptions.token !== undefined && (
                  <Description>アクセストークン設定済み</Description>
                )}
              </span>
              <span>
                <Button
                  size="sm"
                  variant="danger"
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
                  className="shrink-0"
                >
                  無効にする
                </Button>
              </span>
            </ListBox.Item>
          );
        })}
      </ListBox>
    </div>
  );
};

export default App;
