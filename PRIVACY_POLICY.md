# Privacy Policy — Threads to Obsidian

**Last updated**: 2026-03-22

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
| Extension settings (filename pattern, image-save preference, optional AI endpoint/model/key/prompt settings) | `chrome.storage.local` on your device | Until you change settings or uninstall the extension |
| Recent save history (last 10 saved post records, including permalink URLs) | `chrome.storage.local` on your device | Until you clear history or uninstall the extension |
| Connected folder handle metadata for direct save (`FileSystemDirectoryHandle`, folder label, save timestamp) | IndexedDB on your device | Until you disconnect the folder or uninstall the extension |
| Saved Markdown files and images | Local folder you selected via File System Access API, or Downloads folder (ZIP) | Managed by you |

All persistent data is stored locally in your browser profile or in files you choose to save. The extension does **not** send saved post content, settings, or usage analytics to the developer or to any developer-controlled server. If you enable optional AI organization, the extension sends the content you explicitly save directly to the AI endpoint you configure, using your own API key or local endpoint settings.

## Network Requests

The extension makes the following network requests, **all initiated only when you press Save**:

- **Threads pages** (`threads.com`, `threads.net`): The content script reads the already-loaded page DOM from the tab you chose to save. The extension does not upload the extracted post content anywhere.
- **Image CDNs** (`cdninstagram.com`, `fbcdn.net`): When "Save images" is enabled, the browser requests public image files from Meta's CDNs so they can be written into your local archive. These requests go directly from your browser to Meta's infrastructure. The extension does not add analytics, tracking parameters, or send the generated Markdown content to any external service. If image download fails, the extension falls back to embedding the remote URL in the Markdown file.
- **Optional AI endpoint** (user-selected OpenAI-compatible endpoint): When AI organization is enabled, the extension sends the post text and visible metadata of the content you explicitly save directly to the endpoint you configured. This is used to generate optional summaries, tags, and extra frontmatter. These requests go directly from your browser to the endpoint you selected, not to the developer.

No other network requests are made. The extension contains no analytics, telemetry, advertising, or tracking code.

## Permissions Explained

| Permission | Purpose |
|---|---|
| `storage` | Save extension settings and recent save history locally |
| `downloads` | Download ZIP file when direct save is unavailable |
| `tabs` | Check the active tab URL so the extension only runs on supported Threads permalink pages |
| `scripting` | Re-inject the content script if the page loaded before the extension |
| `permissions` | Request optional host access for image CDNs or for the user-selected AI endpoint |
| Host: `threads.com`, `threads.net` | Run the content script on Threads post pages |
| Optional host: `cdninstagram.com`, `fbcdn.net` | Fetch post images for local saving when you enable image downloads and approve the optional permission |
| Optional host: user-selected AI endpoint | Call the OpenAI-compatible LLM endpoint you configure when AI organization is enabled |

## User Control

- **Clear history**: Remove all recent save records from the popup menu.
- **Disconnect folder**: Remove the saved folder handle from local storage from the options page.
- **Uninstall**: Removing the extension deletes the extension's browser-managed local storage, including `chrome.storage.local` data and the saved folder-handle record in IndexedDB. Saved files in your vault remain under your control.

## Changes to This Policy

If this policy changes, the updated version will be published in the extension's repository with an updated date.

## Contact

For questions about this policy, open an issue in the project's GitHub repository.
