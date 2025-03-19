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
            // Set up variables to track what kind of navigation occurred
            let shouldClearFields = true;

            // Get form submit status from session storage
            const wasFormSubmitted = sessionStorage.getItem('webwork_submitted') === 'true';

            // If a form was just submitted, don't clear fields
            if (wasFormSubmitted) {
              console.log('Detected post-submission state, skipping auto-clear');
              shouldClearFields = false;
              // Reset the submission flag
              sessionStorage.removeItem('webwork_submitted');
            }

            // If we should clear fields, do it
            if (shouldClearFields) {
              console.log('Auto-clearing WebWork answer fields');

              // Clear text inputs containing "AnSwEr" in their ID
              document.querySelectorAll('input[id*="AnSwEr"]').forEach((input) => {
                (input as HTMLInputElement).value = '';
              });
              // Clear text areas containing "AnSwEr" in their ID
              const webWorkTextAreas = document.querySelectorAll('textarea[id*="AnSwEr"]');
              webWorkTextAreas.forEach((textarea) => {
                (textarea as HTMLInputElement).value = "";
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
            }

            // Add listeners to all submit buttons to handle future submissions
            document.querySelectorAll('input[type="submit"], button[type="submit"]').forEach((submitBtn) => {
              if (!submitBtn.hasAttribute('data-ww-listener')) {
                submitBtn.setAttribute('data-ww-listener', 'true');
                submitBtn.addEventListener('click', () => {
                  // Set a flag to indicate this is a submission
                  sessionStorage.setItem('webwork_submitted', 'true');
                  console.log('WebWork submission registered');
                });
              }
            });

            // Also handle form submissions directly
            document.querySelectorAll('form').forEach((form) => {
              if (!form.hasAttribute('data-ww-form-listener')) {
                form.setAttribute('data-ww-form-listener', 'true');
                form.addEventListener('submit', () => {
                  sessionStorage.setItem('webwork_submitted', 'true');
                  console.log('WebWork form submission registered');
                });
              }
            });
          },
        });
      }
    });
  }
});

export { };