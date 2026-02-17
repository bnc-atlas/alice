# 🌐 Browser Extension for Second Brain

This guide explains how to create a browser extension that allows you to save content to your Second Brain with a single click.

## Overview

The browser extension adds a button to your browser toolbar. When clicked on any webpage, it saves the current page to your Second Brain, automatically extracting metadata.

## Features

- 🚀 One-click save from any webpage
- 📝 Auto-fill title, description, and thumbnail
- 🏷️ Quick tag and folder selection
- ⌨️ Keyboard shortcuts (Ctrl+Shift+S)
- 🎨 Matches your Second Brain theme
- 📱 Syncs instantly with your account

## Setup Guide

### 1. Create Extension Files

Create a new directory `browser-extension/` with these files:

#### manifest.json
```json
{
  "manifest_version": 3,
  "name": "Second Brain Saver",
  "version": "1.0.0",
  "description": "Save content to your Second Brain with one click",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+S",
        "mac": "Command+Shift+S"
      }
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

#### popup.html
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: 400px;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a;
      color: #f1f5f9;
    }
    
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .icon {
      font-size: 24px;
    }
    
    h1 {
      font-size: 18px;
      font-weight: 600;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 6px;
      color: #94a3b8;
    }
    
    input, select, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #334155;
      border-radius: 8px;
      background: #1e293b;
      color: #f1f5f9;
      font-size: 14px;
    }
    
    textarea {
      resize: vertical;
      min-height: 60px;
    }
    
    .tag-input {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px;
      border: 1px solid #334155;
      border-radius: 8px;
      background: #1e293b;
      min-height: 44px;
    }
    
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: #6366f1;
      color: white;
      border-radius: 6px;
      font-size: 12px;
    }
    
    .tag button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0;
      font-size: 14px;
    }
    
    button.primary {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    button.primary:hover {
      transform: translateY(-1px);
    }
    
    button.primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .success {
      padding: 12px;
      background: #10b981;
      color: white;
      border-radius: 8px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
    }
    
    .error {
      padding: 12px;
      background: #ef4444;
      color: white;
      border-radius: 8px;
      text-align: center;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="icon">🧠</span>
    <h1>Save to Second Brain</h1>
  </div>
  
  <div id="form">
    <div class="form-group">
      <label>Title</label>
      <input type="text" id="title" placeholder="Page title">
    </div>
    
    <div class="form-group">
      <label>Description</label>
      <textarea id="description" placeholder="Brief description..."></textarea>
    </div>
    
    <div class="form-group">
      <label>Type</label>
      <select id="type">
        <option value="article">Article</option>
        <option value="video">Video</option>
        <option value="book">Book</option>
        <option value="podcast">Podcast</option>
        <option value="other">Other</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>Folder</label>
      <select id="folder">
        <option value="">No folder</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>Tags</label>
      <div class="tag-input" id="tagContainer">
        <input type="text" id="tagInput" placeholder="Add tag..." style="border: none; background: none; flex: 1;">
      </div>
    </div>
    
    <button class="primary" id="saveBtn">Save to Brain</button>
  </div>
  
  <div id="success" style="display: none;" class="success">
    ✓ Saved to your Second Brain!
  </div>
  
  <div id="error" style="display: none;" class="error">
    Failed to save. Please try again.
  </div>
  
  <script src="popup.js"></script>
</body>
</html>
```

#### popup.js
```javascript
let selectedTags = [];
let currentTab = null;

// Load current page data
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  currentTab = tabs[0];
  
  // Auto-fill from page metadata
  const title = currentTab.title;
  document.getElementById('title').value = title;
  
  // Try to get meta description
  chrome.scripting.executeScript({
    target: { tabId: currentTab.id },
    func: () => {
      const desc = document.querySelector('meta[name="description"]');
      return desc ? desc.content : '';
    }
  }, (results) => {
    if (results && results[0]) {
      document.getElementById('description').value = results[0].result;
    }
  });
  
  // Detect content type
  const url = currentTab.url;
  if (url.includes('youtube.com') || url.includes('vimeo.com')) {
    document.getElementById('type').value = 'video';
  } else if (url.includes('spotify.com') || url.includes('podcast')) {
    document.getElementById('type').value = 'podcast';
  }
});

// Load user's folders and tags
chrome.storage.sync.get(['apiKey', 'supabaseUrl'], async ({ apiKey, supabaseUrl }) => {
  if (!apiKey || !supabaseUrl) {
    document.getElementById('form').innerHTML = '<p>Please configure the extension in options.</p>';
    return;
  }
  
  try {
    // Fetch folders
    const foldersResponse = await fetch(`${supabaseUrl}/rest/v1/folders`, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const folders = await foldersResponse.json();
    
    const folderSelect = document.getElementById('folder');
    folders.forEach(folder => {
      const option = document.createElement('option');
      option.value = folder.id;
      option.textContent = folder.name;
      folderSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading data:', error);
  }
});

// Tag input handling
const tagInput = document.getElementById('tagInput');
const tagContainer = document.getElementById('tagContainer');

tagInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const tag = tagInput.value.trim();
    if (tag && !selectedTags.includes(tag)) {
      selectedTags.push(tag);
      addTagElement(tag);
      tagInput.value = '';
    }
  }
});

function addTagElement(tag) {
  const tagEl = document.createElement('div');
  tagEl.className = 'tag';
  tagEl.innerHTML = `
    ${tag}
    <button onclick="removeTag('${tag}')">×</button>
  `;
  tagContainer.insertBefore(tagEl, tagInput);
}

function removeTag(tag) {
  selectedTags = selectedTags.filter(t => t !== tag);
  const tags = tagContainer.querySelectorAll('.tag');
  tags.forEach(el => {
    if (el.textContent.includes(tag)) {
      el.remove();
    }
  });
}

// Save button
document.getElementById('saveBtn').addEventListener('click', async () => {
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  
  try {
    const { apiKey, supabaseUrl } = await chrome.storage.sync.get(['apiKey', 'supabaseUrl']);
    
    const contentData = {
      title: document.getElementById('title').value,
      url: currentTab.url,
      content_type: document.getElementById('type').value,
      description: document.getElementById('description').value,
      folder_id: document.getElementById('folder').value || null,
      status: 'to_read',
      progress_percentage: 0,
      added_via: 'extension'
    };
    
    // Create content item
    const response = await fetch(`${supabaseUrl}/rest/v1/content_items`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(contentData)
    });
    
    if (!response.ok) throw new Error('Failed to save');
    
    const content = await response.json();
    
    // Add tags if any
    if (selectedTags.length > 0) {
      // Implementation for adding tags...
    }
    
    // Show success
    document.getElementById('form').style.display = 'none';
    document.getElementById('success').style.display = 'block';
    
    setTimeout(() => window.close(), 2000);
    
  } catch (error) {
    console.error('Save error:', error);
    document.getElementById('error').style.display = 'block';
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save to Brain';
  }
});
```

### 2. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select your `browser-extension/` folder
5. The extension icon should appear in your toolbar

### 3. Configure Extension

1. Right-click the extension icon
2. Click "Options"
3. Enter your Supabase URL and API key
4. Click "Save"

### 4. Use the Extension

- Click the extension icon on any page
- Review auto-filled data
- Add tags and select folder
- Click "Save to Brain"
- Done! ✅

## Advanced Features

### Context Menu Integration
Add right-click menu option:

```javascript
chrome.contextMenus.create({
  id: "saveToBrain",
  title: "Save to Second Brain",
  contexts: ["page", "selection", "link"]
});
```

### Keyboard Shortcuts
Default: `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)

### Offline Support
Queue saves when offline, sync when back online.

### Quick Tags
Show suggested tags based on page content and user history.

## Publishing

To publish your extension:

1. Create icons (16px, 48px, 128px)
2. Zip the extension folder
3. Upload to Chrome Web Store
4. Submit for review

## Security Notes

- Store API keys securely using `chrome.storage.sync`
- Never commit keys to version control
- Use HTTPS for all API calls
- Validate user input before sending to API

## Troubleshooting

**Extension not saving?**
- Check API key is configured
- Verify internet connection
- Check console for errors

**Auto-fill not working?**
- Some sites block content scripts
- Check site permissions

**Tags not appearing?**
- Ensure tags are created in main app first
- Check API permissions
