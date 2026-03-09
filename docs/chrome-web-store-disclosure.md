# Chrome Web Store — Privacy Practices Disclosure

이 문서는 Chrome Web Store 제출 시 **Privacy practices** 탭에 입력할 내용을 정리한 것입니다.

---

## Single Purpose Description

> Save individual Threads posts as Obsidian-ready Markdown files, either directly to a local folder or as a ZIP download.

---

## Permission Justifications

| Permission | Justification |
|---|---|
| `storage` | Stores user preferences (filename pattern, include images toggle) and recent save history (up to 10 entries) in `chrome.storage.local`. No data leaves the device. |
| `downloads` | Used to trigger a ZIP file download when direct save to the user's Obsidian vault is not available. |
| `tabs` | Checks the active tab's URL to determine if it is a supported Threads permalink page before enabling the save action. |
| `scripting` | Re-injects the content script into the active Threads tab if the page loaded before the extension was installed or enabled. |
| Host permission: `threads.com`, `threads.net` | Required for the content script to run on Threads post pages and extract post content from the DOM. |
| Optional host permission: `cdninstagram.com`, `fbcdn.net` | Used only when the user has "Save images" enabled. Fetches image binaries from Meta's CDNs for local storage. No cookies or user data are sent. Granted only when the user initiates a save with images. |

---

## Data Use Certification

### Does your extension collect or transmit user data?

**No.** All data processed by the extension stays on the user's local device. No data is transmitted to any external server, analytics service, or third party.

### Specific data use disclosures

| Category | Collected? | Details |
|---|---|---|
| Personally identifiable information | No | — |
| Health information | No | — |
| Financial and payment information | No | — |
| Authentication information | No | — |
| Personal communications | No | — |
| Location | No | — |
| Web history | No | — |
| User activity | No | — |
| Website content | Yes (locally only) | Post text, author name, image URLs from the Threads page the user explicitly saves. Stored only on the user's device. Never transmitted externally. |

### Remote code

The extension does **not** execute remote code. All JavaScript is bundled at build time.

---

## Privacy Policy URL

Link to `PRIVACY_POLICY.md` in the project repository, or host it at a public URL for submission.

---

## Store Listing — Short Description (132 chars)

> Save Threads posts to your Obsidian vault as Markdown. Direct save to local folders or ZIP download fallback.

## Store Listing — Detailed Description

> **Threads to Obsidian** saves individual Threads posts as clean, Obsidian-ready Markdown files — directly into your vault folder.
>
> **How it works:**
> 1. Connect your Obsidian vault folder in the extension options (one-time setup).
> 2. Open any Threads post permalink in Chrome.
> 3. Click the extension icon and hit Save.
> 4. The post is saved as `archive-name/archive-name.md` with optional images in `assets/`.
> 5. If direct save isn't available, a ZIP file is downloaded instead.
>
> **Features:**
> - Frontmatter with tags, author, dates, and shortcode for Dataview queries
> - Author's self-thread replies preserved together
> - Images saved locally with alt text for accessibility
> - External links restored to full URLs when visible
> - Customizable filename patterns
> - Keyboard shortcut support (Alt+Shift+S)
> - Recent save history in the popup
>
> **Privacy-first:** All data stays on your device. No analytics, no tracking, no external servers. See our privacy policy for details.
>
> **Requirements:** Desktop Chrome/Chromium. Only public Threads permalink pages are supported.
