# Rastaroots Life Fresh Website

Static website for GitHub Pages.

## Files
- `index.html`
- `style.css`
- `script.js`
- `/assets` images

## GitHub Pages setup
1. Create a new GitHub repository.
2. Upload all files in this folder, not the parent folder.
3. Go to Settings > Pages.
4. Source: Deploy from a branch.
5. Branch: `main`, folder: `/root`.
6. Save.
7. Wait 1-3 minutes for GitHub Pages to publish.

## Cloudflare domain
Point `rastarootslife.com` to your GitHub Pages site:
- Add CNAME record:
  - Name: `www`
  - Target: `YOUR-GITHUB-USERNAME.github.io`
  - Proxy: DNS only at first
- Add GitHub custom domain:
  - `www.rastarootslife.com`
- Redirect root domain to `www` in Cloudflare if needed.

## Mailchimp
Replace this form line in `index.html`:

`<form class="subscribe-form" action="#" method="post">`

with your Mailchimp embedded form action URL.
