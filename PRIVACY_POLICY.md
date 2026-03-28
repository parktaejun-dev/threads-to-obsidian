# Privacy Policy — Threads Saver

**Last updated**: 2026-03-23

Threads Saver is a Chrome extension that saves individual Threads posts to Obsidian, ZIP files, or Notion. This policy explains what data the extension accesses, how it is used, where it is stored, and which network requests are made.

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
| Extension settings, including save target, filename pattern, image-save preference, optional Notion token/page settings, and optional AI endpoint/model/key/prompt settings | `chrome.storage.local` on your device | Until you change settings or uninstall the extension |
| Recent save history (last 10 saved post records, including permalink URLs and, for Notion saves, the created page URL) | `chrome.storage.local` on your device | Until you clear history or uninstall the extension |
| Connected folder handle metadata for direct save (`FileSystemDirectoryHandle`, folder label, save timestamp) | IndexedDB on your device | Until you disconnect the folder or uninstall the extension |
| Pro license key, activation status, and device metadata | `chrome.storage.local` on your device | Until you clear the license or uninstall the extension |
| Saved Markdown files and images | Local folder you selected via File System Access API, or Downloads folder (ZIP) | Managed by you |
| Saved Notion pages | Your Notion workspace | Managed by you inside Notion |

Persistent data is stored locally in your browser profile, in files you chose to save, or in the Notion workspace you explicitly connected. The extension does **not** send saved post content, settings, or analytics to the developer except for the limited Pro activation requests described below. If you enable AI organization, the extension sends the content you explicitly save directly to the AI endpoint you configure, using your own API key or local endpoint settings.

## Network Requests

The extension makes the following network requests only when you use a related feature:

- **Threads pages** (`threads.com`, `threads.net`): The content script reads the already-loaded page DOM from the tab you chose to save. The extension does not upload extracted post content back to Threads or to the developer.
- **Image CDNs** (`cdninstagram.com`, `fbcdn.net`): When "Save images" is enabled for local archives, the browser requests public image or video files from Meta's CDNs so they can be written into the local archive.
- **Optional AI endpoint** (user-selected OpenAI-compatible endpoint): When AI organization is enabled, the extension sends the post text and visible metadata of the content you explicitly save directly to the endpoint you configured. This is used to generate optional summaries, tags, and extra frontmatter.
- **Developer backend** (`threads-archive.dahanda.dev`): When you activate, validate, or release a Pro key, or when you use Notion OAuth saving, the extension sends the Pro token, a generated device ID, and a device label such as `Chrome on macOS` to the developer-controlled backend. For Notion saves, the extension also sends the explicitly saved Threads post content and any locally generated AI summary/tag output so the backend can create a page in your connected Notion workspace. The backend stores the user's Notion OAuth tokens server-side so the browser does not need to store them locally.

The extension contains no analytics, telemetry, advertising, or tracking code.

## Permissions Explained

| Permission | Purpose |
|---|---|
| `storage` | Save extension settings, recent save history, and Pro activation status locally |
| `downloads` | Download a ZIP file when direct folder save is unavailable |
| `tabs` | Check the active tab URL so the extension only runs on supported Threads permalink pages |
| `scripting` | Re-inject the content script if the page loaded before the extension |
| Host: `threads.com`, `threads.net` | Run the content script on Threads post pages |
| Host: `threads-archive.dahanda.dev` | Reach the Pro activation API and Notion save backend |
| Optional host: `cdninstagram.com`, `fbcdn.net` | Fetch post media for local saving when you approve the optional permission |
| Optional host: user-selected AI endpoint | Call the OpenAI-compatible LLM endpoint you configure when AI organization is enabled |

## User Control

- **Clear history**: Remove all recent save records from the popup menu.
- **Disconnect folder**: Remove the saved folder handle from the options page.
- **Change save target**: Switch between Obsidian and Notion in the options page at any time.
- **Clear Pro license**: Remove the locally stored Pro key and activation record from the options page.
- **Uninstall**: Removing the extension deletes the extension's browser-managed local storage, including `chrome.storage.local` data and the saved folder-handle record in IndexedDB. Saved local files and created Notion pages remain under your control.

## Changes to This Policy

If this policy changes, the updated version will be published in the repository with an updated date.

## Contact

For questions about this policy, open an issue in the project's GitHub repository.
