import { StoredData } from "./lib";

const updateActionBehavior = async (actionBehavior: "popup" | "side_panel") => {
  switch (actionBehavior) {
    case "side_panel":
      await chrome.action.setPopup({ popup: "" });
      await chrome.sidePanel.setOptions({ enabled: true });
      break;

    case "popup":
      await chrome.action.setPopup({ popup: "index.html" });
      await chrome.sidePanel.setOptions({ enabled: false });
      break;
  }
};

chrome.storage.local.onChanged.addListener((changes) => {
  if ("actionBehavior" in changes)
    void updateActionBehavior(
      changes["actionBehavior"].newValue as "popup" | "side_panel",
    );
});

void (async () => {
  const { actionBehavior = "side_panel" }: StoredData =
    await chrome.storage.local.get("actionBehavior");
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  await updateActionBehavior(actionBehavior);
})();
