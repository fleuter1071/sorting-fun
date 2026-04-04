# Sorting Fun

Sorting Fun is a React + Vite prototype for visually triaging incoming requests into four piles:
- Top priority
- High priority
- Medium priority
- Low priority

The current prototype focuses on interaction feel. You can grab a request note, move it across the screen, and drop it into the correct priority pile.

## Local development

### Install dependencies
```bash
npm install
```

### Start the dev server
```bash
npm run dev
```

### Create a production build
```bash
npm run build
```

## Render deployment

This repo includes a Render Blueprint file at `render.yaml`.

Render is configured to:
- install dependencies with `npm install`
- build the app with `npm run build`
- publish the built output from `dist`
- rewrite all routes to `index.html`

### Deploy with the Blueprint
1. Open Render.
2. Click `New +`.
3. Choose `Blueprint`.
4. Connect this GitHub repo.
5. Render should detect `render.yaml` and prefill the deployment settings.

## Product note

This app is static today, which makes it easy to deploy. The React + Vite setup also gives it a cleaner path to grow later if you want to add saved requests, accounts, or a backend.
