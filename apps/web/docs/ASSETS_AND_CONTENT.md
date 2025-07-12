# 📁 Assets and Content Configuration

This project separates **static assets** (e.g., images, videos) and **text content** (e.g., labels, messages) from the source code, using external configuration files. This makes it easy to:

- Hide sensitive assets from the repository
- Customize the app for different environments (dev, staging, prod)
- Switch assets and text without modifying the codebase

---

## 🗂️ Files

| File                              | Purpose                                 | Git tracking           |
| --------------------------------- | --------------------------------------- | ---------------------- |
| `src/config/assets.json`          | Defines image and video URLs/paths      | Ignored (`.gitignore`) |
| `src/config/assets.example.json`  | Example file for onboarding             | Committed              |
| `src/config/content.json`         | Defines app text (titles, descriptions) | Ignored (`.gitignore`) |
| `src/config/content.example.json` | Example content                         | Committed              |

---

## ⚙️ Local Development Setup

1. Copy the example files:

Setup commands (`make docker-setup-dev APP=web` OR `make setup-dev APP=web`) should handle the example files copy. But if not, you can do it on your own:

```bash
cp src/config/assets.example.json src/config/assets.json
cp src/config/content.example.json src/config/content.json
```

1. Edit `assets.json` to configure your local image/video paths or remote URLs:

   ```json
   {
     "logo": "./local-assets/logo.svg",
     "backgroundVideo": "https://example.com/background.mp4"
   }
   ```

2. Edit `content.json` to configure your app’s textual content:

   ```json
   {
     "welcomeTitle": "Welcome to My App",
     "onboardingSubtitle": "Powered by Open Source"
   }
   ```

---

## 🚀 CI/CD: Auto-download in GitHub Actions

On CI/CD pipelines (e.g., GitHub Actions), these files are **dynamically downloaded from an external API**, so sensitive assets and content are never stored in the repo.\
Example in GitHub Actions:

```yaml
curl -sSL ${{ secrets.APP_ASSETS_URL }} -o src/config/assets.json
curl -sSL ${{ secrets.APP_CONTENT_URL }} -o src/config/content.json
```

---

## 🛠️ Usage in the App

### ✅ Asset hook (`a()`)

Load an image/video from your assets:

```tsx
import { a } from 'src/interfaces/cms/useAssets'
;<img src={a('logo')} alt="Logo" />
```

The `a()` helper automatically:

- Loads from remote URLs if the value starts with `https://`.
- Resolves local file paths using your bundler (`import.meta.url`).

Example for a `<video>`:

```tsx
<video autoPlay muted loop>
  <source src={a('backgroundVideo')} type="video/mp4" />
</video>
```

---

### ✅ Content hook (`c()`)

Load text from your content file:

```tsx
import { c } from 'src/interfaces/cms/useCMS'

<h1>{c('welcomeTitle')}</h1>
<p>{c('onboardingSubtitle')}</p>
```

---

## 🔒 Security Note

- Do **not** include sensitive data like API keys in these files.
- Assets and content files are designed to hold only public resources and display text.
- For secrets, use `.env` files or your CI/CD secrets system.

---

## 📂 Example Structure

```
src/
 ├── config/
 │    ├── assets.json            # Ignored, contains real asset links
 │    ├── assets.example.json    # Committed example
 │    ├── content.json           # Ignored, contains real content
 │    └── content.example.json   # Committed example
 ├── interfaces/cms/
      ├── useAssets.ts           # a() hook
      └── useCMS.ts              # c() hook
```

---
