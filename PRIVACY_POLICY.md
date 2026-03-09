# Privacy Policy — Threads to Obsidian

**Last updated**: 2026-03-09

Threads to Obsidian is a Chrome extension that saves individual Threads posts as Markdown files to your local Obsidian vault. This policy explains what data the extension accesses, how it is used, and where it is stored.

## Data the Extension Accesses

When you click "Save", the extension reads the following from the currently open Threads post page:

- Post text, author username, publication date, and permalink URL
- Author's consecutive replies (self-thread)
- Image URLs embedded in the post and replies
- External link URLs visible in the post

The extension only reads data from the page you explicitly choose to save. It does **not** scrape, crawl, or collect data in the background.

## Where Data Is Stored

| Data | Location | Retention |
|---|---|---|
| Extension settings (filename pattern, folder preference) | `chrome.storage.local` on your device | Until you change settings or uninstall the extension |
| Recent save history (last 10 entries) | `chrome.storage.local` on your device | Until you clear history or uninstall the extension |
| Saved Markdown files and images | Local folder you selected via File System Access API, or Downloads folder (ZIP) | Managed by you |

All data stays on your device. The extension does **not** transmit any data to external servers, analytics services, or third parties.

## Network Requests

The extension makes the following network requests, **all initiated only when you press Save**:

- **Threads pages** (`threads.com`, `threads.net`): Content script reads the already-loaded page DOM. No additional network requests to Threads servers.
- **Image CDNs** (`cdninstagram.com`, `fbcdn.net`): When "Save images" is enabled, the extension fetches image files from Meta's CDNs to save them locally. Only the image binary is downloaded; no cookies, tokens, or user identifiers are sent. If image download fails, the extension falls back to embedding the remote URL in the Markdown file.

No other network requests are made. The extension contains no analytics, telemetry, advertising, or tracking code.

## Permissions Explained

| Permission | Purpose |
|---|---|
| `storage` | Save extension settings and recent save history locally |
| `downloads` | Download ZIP file when direct save is unavailable |
| `tabs` | Check if the active tab is a supported Threads permalink page |
| `scripting` | Re-inject the content script if the page loaded before the extension |
| Host: `threads.com`, `threads.net` | Run the content script on Threads post pages |
| Optional host: `cdninstagram.com`, `fbcdn.net` | Fetch post images for local saving (granted only when needed) |

## User Control

- **Clear history**: Remove all recent save records from the popup menu.
- **Disconnect folder**: Revoke the File System Access permission from the options page.
- **Uninstall**: Removing the extension deletes all `chrome.storage.local` data automatically. Saved files in your vault remain under your control.

## Changes to This Policy

If this policy changes, the updated version will be published in the extension's repository with an updated date.

## Contact

For questions about this policy, open an issue in the project's GitHub repository.
