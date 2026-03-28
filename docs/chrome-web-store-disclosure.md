# Chrome Web Store — Privacy Practices Disclosure

이 문서는 Chrome Web Store 제출 시 **Privacy practices** 탭에 입력할 내용을 정리한 것입니다.

---

## Single Purpose Description

> Save individual Threads posts to personal knowledge tools such as Obsidian or Notion, either as local Markdown archives or as Notion pages.

---

## Permission Justifications

| Permission | Justification |
|---|---|
| `storage` | Stores user preferences, recent save history, and Pro activation status in `chrome.storage.local`. |
| `downloads` | Triggers ZIP downloads when direct local save is unavailable. |
| `tabs` | Checks the active tab's URL to determine whether it is a supported Threads permalink page. |
| `scripting` | Re-injects the content script into the active Threads tab if the page loaded before the extension was installed or enabled. |
| Host permission: `threads.com`, `threads.net` | Required for the content script to run on Threads post pages and extract post content from the DOM. |
| Host permission: `ss-threads.dahanda.dev` | Required for Pro license activation, status checks, seat release, Notion OAuth connection status, destination lookup, and Notion save requests through the developer-controlled backend. |
| Optional host permission: `cdninstagram.com`, `fbcdn.net` | Used only when the user has image saving enabled. Fetches public media binaries from Meta's CDNs for local storage. |
| Optional host permission: custom AI endpoint (`https://*/*`, `http://*/*` requested per-origin) | Used only when the user enables AI organization and saves settings for a specific OpenAI-compatible endpoint. Allows the extension to call the user-selected LLM API directly from the browser with the user's own key. |

---

## Data Use Certification

### Does your extension collect or transmit user data?

Use wording that matches the implementation exactly:

> The extension primarily processes saved Threads content locally on the user's device. When the user enables Notion OAuth saving in Pro mode, the extension sends the explicitly saved post content to the developer-controlled backend, which stores the user's Notion OAuth tokens server-side and creates pages in the user's connected Notion workspace. When the user enables AI organization, the extension sends the explicitly saved post content directly to the user-selected LLM endpoint using the user's own API key or local endpoint configuration. When the user activates or validates a Pro key, the extension sends the Pro token and device activation metadata to the developer-controlled backend. The extension does not send analytics or browsing telemetry to the developer.

### Specific data use disclosures

| Category | Collected? | Details |
|---|---|---|
| Personally identifiable information | No, unless embedded by the user in an external service | The extension itself does not require name, email, or account registration to save posts. If a user connects Notion or enters an AI API key or Pro key, that value is handled only for the selected feature. |
| Health information | No | — |
| Financial and payment information | No | — |
| Authentication information | User-configured only | AI API keys and Pro license keys may be stored locally in `chrome.storage.local`. Notion OAuth tokens are stored server-side by the developer-controlled backend after the user explicitly connects a Notion workspace. |
| Personal communications | No | — |
| Location | No | — |
| Web history / browsing activity | Limited local handling only | The extension checks the active tab URL to confirm a supported Threads permalink and stores the permalink URL of posts the user explicitly saves in local recent-save history. |
| User activity | Limited feature operations only | The extension records local recent-save history and Pro activation status to support user-triggered saves and license management. |
| Website content | Yes | Post text, author name, permalink URL, reply content, visible external links, and media URLs from the Threads page the user explicitly saves. Stored locally, written to the user's local files, sent to the optional AI endpoint when enabled, or sent to the developer-controlled backend when the user uses Pro Notion OAuth saving. |

### Remote code

The extension does **not** execute remote code. All JavaScript is bundled at build time.

---

## Privacy Policy URL

Use the public GitHub URL:

> `https://github.com/parktaejun-dev/threads-to-obsidian/blob/main/PRIVACY_POLICY.md`

## Store Assets

- Small promo tile (`440x280`): `docs/store-assets/cws-small-promo-tile-440x280.png`
- Screenshot candidates: `src/web/assets/screenshots/popup-preview.png`, `src/web/assets/screenshots/options-preview.png`

---

## Store Listing — Short Description (132 chars)

> Save Threads posts to Obsidian or Notion from Chrome. Direct folder save, Notion page save, and ZIP fallback in one extension.

## Store Listing — Detailed Description

> **Threads Saver** saves individual Threads posts as clean notes for Obsidian or Notion on desktop Chrome.
>
> **How it works:**
> 1. Open any public Threads post permalink in Chrome.
> 2. Choose your default save target in the extension settings.
> 3. For Obsidian, connect a local vault folder once. For Notion, connect your workspace with OAuth and choose a default page or data source. 
> 4. Click the extension icon and save the current post.
> 5. The post is written either to your local archive, to a ZIP download, or to your Notion workspace.
>
> **Features:**
> - Obsidian direct save with optional local image downloads
> - ZIP fallback when direct local save is unavailable
> - Free Notion save to a parent page
> - Pro Notion save to a data source with property mapping
> - Pro upload of images and videos into Notion-managed storage
> - Automatic mapping of common Notion fields such as title, source URL, author, dates, tags, and reply count when supported
> - Optional Pro AI organization using the user's own LLM key for summaries, tags, and extra metadata
> - Author's self-thread replies preserved together
> - Customizable filename and save-path patterns
> - Keyboard shortcut support (`Alt+Shift+S`)
> - Recent save history in the popup
>
> **Privacy-first:** The extension works locally by default. Saved post content is sent out only when you explicitly use Notion saving or AI organization. In Pro mode, Notion media upload also sends related media files to your Notion workspace. Pro activation requests send only licensing metadata, not saved post content. See the privacy policy for details.
>
> **Requirements:** Desktop Chrome/Chromium. Only public Threads permalink pages are supported.
