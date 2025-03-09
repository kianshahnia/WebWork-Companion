// src/popupIndex.tsx
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./Popup.css";

function PopupApp() {
  const [autoClear, setAutoClear] = useState(false);

  // On mount, retrieve the stored autoClear setting
  useEffect(() => {
    chrome.storage.sync.get("autoClear", (data) => {
      if (typeof data.autoClear === "boolean") {
        setAutoClear(data.autoClear);
      }
    });
  }, []);

  // Whenever the user toggles the checkbox, update storage
  const handleToggleAutoClear = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.checked;
    setAutoClear(newValue);
    chrome.storage.sync.set({ autoClear: newValue });
  };

  const clearAllWebWorkInputs = () => {
    // Query for the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id || !tab.url) return;

      // Only proceed if URL contains 'webwork' (adjust as needed)
      if (!tab.url.includes("webwork")) {
        console.log("Not on a WebWork page. No inputs were cleared.");
        return;
      }

      // Inject script to clear inputs with ID = "AnSwEr..."
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            // Select all input elements whose ID starts with 'AnSwEr'
            const webWorkInputs = document.querySelectorAll(
              'input[id*="AnSwEr"]'
            );
            webWorkInputs.forEach((input) => {
              (input as HTMLInputElement).value = "";
            });
          },
        },
        () => console.log("Cleared all WebWork answer fields!")
      );
    });
  };
  const resetAllWebWorkSelects = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id || !tab.url) return;

      // Only proceed if the current tab's URL contains 'webwork'
      if (!tab.url.includes("webwork")) {
        console.log("Not on a WebWork page. No select fields were reset.");
        return;
      }

      // Inject script to reset all select fields with ID starting with "AnSwEr" to the first option
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const webWorkSelects = document.querySelectorAll(
              'select[id^="AnSwEr"]'
            );
            webWorkSelects.forEach((select) => {
              (select as HTMLSelectElement).selectedIndex = 0;
            });
          },
        },
        () => console.log("Reset all WebWork select fields!")
      );
    });
  };
  const unselectAllWebWorkRadiosAndCheckboxes = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id || !tab.url) return;
      if (!tab.url.includes("webwork")) {
        console.log(
          "Not on a WebWork page. No radio/checkbox inputs were unselected."
        );
        return;
      }
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            // Uncheck radio inputs
            const radios = document.querySelectorAll(
              'input[type="radio"][id*="AnSwEr"]'
            );
            radios.forEach((radio) => {
              (radio as HTMLInputElement).checked = false;
            });
            // Uncheck checkbox inputs
            const checkboxes = document.querySelectorAll(
              'input[type="checkbox"][id*="AnSwEr"]'
            );
            checkboxes.forEach((checkbox) => {
              (checkbox as HTMLInputElement).checked = false;
            });
          },
        },
        () =>
          console.log(
            "All WebWork radio and checkbox inputs are now unselected!"
          )
      );
    });
  };

  const handleClearBoth = () => {
    clearAllWebWorkInputs();
    resetAllWebWorkSelects();
    unselectAllWebWorkRadiosAndCheckboxes();
  };

  return (
    <div className="popupContainer">
      <h1 className="title">WebWork Companion</h1>
      <p className="switch-text">Auto-Clear</p>
      <label className="cl-switch">
        <input
          checked={autoClear}
          onChange={handleToggleAutoClear}
          type="checkbox"
        ></input>
        <span></span>
      </label>
      <button onClick={handleClearBoth} className="button-4" role="button">
        Clear Answers
      </button>
    </div>
  );
}

const root = createRoot(document.body);
root.render(<PopupApp />);

export default PopupApp;
