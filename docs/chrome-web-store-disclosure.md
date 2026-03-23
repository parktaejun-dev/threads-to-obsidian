# Chrome Web Store — Privacy Practices Disclosure

이 문서는 Chrome Web Store 제출 시 **Privacy practices** 탭에 입력할 내용을 정리한 것입니다.

---

## Single Purpose Description

> Save individual Threads posts as Obsidian-ready Markdown files, either directly to a local folder or as a ZIP download.

---

## Permission Justifications

| Permission | Justification |
|---|---|
| `storage` | Stores user preferences (filename pattern, include images toggle) and recent save history (up to 10 entries) in `chrome.storage.local`. |
| `downloads` | Used to trigger a ZIP file download when direct save to the user's Obsidian vault is not available. |
| `tabs` | Checks the active tab's URL to determine if it is a supported Threads permalink page before enabling the save action. |
| `scripting` | Re-injects the content script into the active Threads tab if the page loaded before the extension was installed or enabled. |
| `permissions` | Requests optional host access only when the user enables image downloads from Meta CDNs or configures a custom AI endpoint for BYO LLM organization. |
| Host permission: `threads.com`, `threads.net` | Required for the content script to run on Threads post pages and extract post content from the DOM. |
| Optional host permission: `cdninstagram.com`, `fbcdn.net` | Used only when the user has "Save images" enabled. Fetches public image binaries from Meta's CDNs for local storage. Granted only when the user initiates a save with images. |
| Optional host permission: custom AI endpoint (`https://*/*`, `http://*/*` requested per-origin) | Used only when the user enables AI organization and saves settings for a specific OpenAI-compatible endpoint. Allows the extension to call the user-selected LLM API directly from the browser with the user's own key. |

---

## Data Use Certification

### Does your extension collect or transmit user data?

Use wording that matches the implementation exactly:

> The extension processes saved Threads content locally on the user's device. It does not send saved post content, settings, or analytics to the developer or to any developer-controlled server. When the user enables image saving, Chrome makes direct requests to Meta CDNs to download public image files to the user's device. When the user enables AI organization, the extension sends the saved post content directly to the user-selected LLM endpoint using the user's own API key or local endpoint configuration.

### Specific data use disclosures

| Category | Collected? | Details |
|---|---|---|
| Personally identifiable information | No | — |
| Health information | No | — |
| Financial and payment information | No | — |
| Authentication information | User-configured only | If the user enables AI organization, their own API key may be stored locally in `chrome.storage.local` and sent only to the user-selected LLM endpoint. It is not sent to the developer. |
| Personal communications | No | — |
| Location | No | — |
| Web history / browsing activity | Limited local handling only | The extension checks the active tab URL to confirm a supported Threads permalink and stores the permalink URL of posts the user explicitly saves in local recent-save history. This data stays on device. |
| User activity | No | — |
| Website content | Yes | Post text, author name, permalink URL, reply content, visible external links, and image URLs from the Threads page the user explicitly saves. Stored only on the user's device or written to the local folder/ZIP the user chose. If the user enables AI organization, the same saved content is also sent directly to the user-selected LLM endpoint. |

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

> Save Threads posts to your Obsidian vault as Markdown. Direct save to local folders or ZIP download fallback.

## Store Listing — Detailed Description

> **Threads to Obsidian** saves individual Threads posts as clean, Obsidian-ready Markdown files — directly into your vault folder.
>
> **How it works:**
> 1. Connect your Obsidian vault folder in the extension options (one-time setup).
> 2. Open any Threads post permalink in Chrome.
> 3. Click the extension icon and hit Save.
> 4. The post is saved as `archive-name/archive-name.md` with optional images next to the note as sibling files.
> 5. If direct save isn't available, a ZIP file is downloaded instead.
>
> **Features:**
> - Frontmatter with tags, author, dates, and shortcode for Dataview queries
> - Optional Pro AI organization using the user's own LLM key for summaries, tags, and extra frontmatter
> - Author's self-thread replies preserved together
> - Images saved locally with alt text for accessibility
> - External links restored to full URLs when visible
> - Customizable filename patterns
> - Keyboard shortcut support (Alt+Shift+S)
> - Recent save history in the popup
>
> **Privacy-first:** Saved content is processed locally on your device. No analytics, no tracking, and no developer-controlled servers. If you enable image saving, Chrome downloads the public image files directly from Meta's CDNs to your device. See our privacy policy for details.
>
> **Requirements:** Desktop Chrome/Chromium. Only public Threads permalink pages are supported.
