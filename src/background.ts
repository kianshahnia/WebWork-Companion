// background.ts (Manifest V3 style)
console.log('chrome object:', chrome);

chrome.runtime.onInstalled.addListener(() => {
  // Set a default value for autoClear
  chrome.storage.sync.set({ autoClear: false });
});

// Listen for when a tab updates (i.e., user navigates or reloads a page)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only act when the page is fully loaded and it's a WebWork page
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('webwork')) {
    chrome.storage.sync.get('autoClear', (data) => {
      if (data.autoClear) {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            // Attach an event listener in the capturing phase to all submit elements.
            // When any submit element is clicked, set a flag in sessionStorage.
            document.querySelectorAll('[type="submit"]').forEach((element) => {
              element.addEventListener(
                'click',
                () => {
                  sessionStorage.setItem('autoClearDisabled', 'true');
                  console.log('Auto-clear disabled due to submit click');
                },
                { capture: true }
              );
            });

            // Check if the auto-clear flag has been disabled by a submit click.
            if (sessionStorage.getItem('autoClearDisabled') === 'true') {
              console.log('Auto-clear is disabled; skipping clear.');
              return;
            }

            // Otherwise, perform auto-clear operations:
            // Clear text inputs containing "AnSwEr" in their ID
            document.querySelectorAll('input[id*="AnSwEr"]').forEach((input) => {
              (input as HTMLInputElement).value = '';
            });
            // Reset select elements containing "AnSwEr" in their ID
            document.querySelectorAll('select[id*="AnSwEr"]').forEach((select) => {
              (select as HTMLSelectElement).selectedIndex = 0;
            });
            // Uncheck radio buttons containing "AnSwEr" in their ID
            document.querySelectorAll('input[type="radio"][id*="AnSwEr"]').forEach((radio) => {
              (radio as HTMLInputElement).checked = false;
            });
            // Uncheck checkboxes containing "AnSwEr" in their ID
            document.querySelectorAll('input[type="checkbox"][id*="AnSwEr"]').forEach((checkbox) => {
              (checkbox as HTMLInputElement).checked = false;
            });
          },
        });
      }
    });
  }
});
export {};
