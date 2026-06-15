// Content Script for FALO Prompt Manager
// Listens for message from the sidepanel and fills the prompt into the active webpage's AI chat input box.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fillPrompt") {
    const success = fillInputText(request.text);
    sendResponse({ success: success });
  }
  return true;
});

function fillInputText(text) {
  const selectors = [
    'textarea.query-box-input', // NotebookLM main chat input
    '#prompt-textarea', // ChatGPT
    'div[contenteditable="true"][role="textbox"]', // Claude, Gemini, ChatGPT alternative
    'div[contenteditable="true"]',
    'textarea:not(.query-box-textarea)', // Exclude NotebookLM source search textarea
    'textarea',
    'input[type="text"]'
  ];

  let element = null;
  
  // Find the first visible element that matches our selectors
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        element = el;
        break;
      }
    }
    if (element) break;
  }

  if (!element) {
    // Try currently active element as absolute fallback if it's an input
    const active = document.activeElement;
    if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT' || active.getAttribute('contenteditable') === 'true')) {
      element = active;
    }
  }

  if (!element) return false;

  element.focus();

  if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
    element.value = text;
  } else if (element.getAttribute('contenteditable') === 'true') {
    // Handle rich-text inputs (Lexical, ProseMirror, DraftJS used by ChatGPT/Gemini/Claude)
    element.innerHTML = '';
    
    // Split text by lines to create paragraphs or text nodes
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      const p = document.createElement('p');
      p.innerText = line || ' '; // Keep empty lines
      element.appendChild(p);
    });
  }

  // Dispatch standard events so React/Vue/Svelte recognize the value change
  const eventOptions = { bubbles: true, cancelable: true };
  element.dispatchEvent(new Event('input', eventOptions));
  element.dispatchEvent(new Event('change', eventOptions));
  
  // Extra events for complex editors
  element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Process' }));
  element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Process' }));

  element.focus();
  return true;
}
