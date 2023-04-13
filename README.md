![](/banner.png)

<h1 align="center">tighten/laravel-deploy-preview</h1>

<p align="center">
    <strong>A GitHub Action to create on-demand preview environments for Laravel apps.</strong>
</p>

<p align="center">
    <!-- TODO test status -->
    <a href="https://github.com/tighten/laravel-deploy-preview/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-darkcyan.svg" alt="MIT License"></a>
</p>

## About

`tighten/laravel-deploy-preview` is a GitHub Action to automatically deploy new Laravel app instances to Laravel Forge (current) or Vapor (planned). It's perfect for creating PR preview environments that are isolated, publicly accessible (or privately, depending on your server's settings), and closely resemble your production environment, to preview and test your changes.

When you open a PR and this action runs for the first time, it will:

- Create a new site on Forge with a unique subdomain and install your Laravel app into it.
- Create a new database for the site and configure your app to use it.
- Create and install an SSL certificate and comment on your PR with a link to the site.
- Set up a scheduled job in Forge to run your site's scheduler.
- Enable [Quick Deploy](https://forge.laravel.com/docs/1.0/sites/deployments.html#quick-deploy) on the site so that it updates automatically when you push new code.

## Requirements

Before adding this action to your workflows, make sure you have:

- A Laravel Forge [app server](https://forge.laravel.com/docs/1.0/servers/types.html#app-servers).
- A [wildcard subdomain DNS record](https://en.wikipedia.org/wiki/Wildcard_DNS_record) pointing to your Forge server.
- A Forge [API token](https://forge.laravel.com/docs/1.0/accounts/api.html#create-api-token).

## Usage

> **Warning**: This action has direct access to your Laravel Forge account and should only be used in trusted contexts. Anyone who can push to a GitHub repository using this action will be able to execute code on the connected Forge servers.

Add your Forge API token as an [Actions Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) in your GitHub repository. Then, use `tighten/laravel-deploy-preview` inside any workflow.

For the action to be able to clean up preview sites and other resources after a PR is merged, it has to be triggered on the pull request "closed" event. By default, GitHub's `pull_request` event does _not_ trigger a workflow run when its activity type is `closed`, so you may need to place this action in its own workflow file that specifies that event type:

```yaml
# deploy-preview.yml
on:
  pull_request:
    types: [opened, closed]
jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: tighten/laravel-deploy-preview@v1
        with:
          forge-token: ${{ secrets.FORGE_TOKEN }}
          servers: |
            qa-1.acme.dev 60041
```

### Inputs

#### `forge-token` (required)

The `forge-token` input parameter accepts your Forge API token, which the action uses to communicate with Laravel Forge to create sites and other resources. **Store this value in an encrypted secret; do not paste it directly into your workflow file.**

Example:

```yaml
- uses: tighten/laravel-deploy-preview@v1
  with:
    forge-token: ${{ secrets.FORGE_TOKEN }}
    servers: |
      qa-1.acme.dev 60041
```

#### `servers` (required)

The `servers` input parameter accepts a list of Forge servers to deploy to.

Each server must include both a domain name and a server ID, separated by a space. The domain name should be the wildcard subdomain pointing at that server (without the wildcard part). For example, if your wildcard subdomain is `*.qa-1.acme.dev` and your Forge server ID is `60041`, set this input parameter to `qa-1.acme.dev 60041`.

If this input parameter contains multiple lines, each line will be treated as a different Forge server. We plan to support deploying to whichever server has the fewest sites already running on it, but the action currently only deploys to one server; if you list multiple servers, it will use the first one.

Example:

```yaml
- uses: tighten/laravel-deploy-preview@v1
  with:
    forge-token: ${{ secrets.FORGE_TOKEN }}
    servers: |
      qa-1.acme.dev 60041
      qa-2.acme.dev 60043
```

#### `after-deploy`

The `after-deploy` input parameter allows you to append additional commands to be run after the Forge deploy script.

Example:

```yaml
- uses: tighten/laravel-deploy-preview@v1
  with:
    forge-token: ${{ secrets.FORGE_TOKEN }}
    servers: |
      qa-1.acme.dev 60041
    after-deploy: npm ci && npm run build
```

#### `env-file`

The `env-file` input paramater allows you to define the path of an env file to be merged with the project's environment.

Example:

```yaml
- uses: tighten/laravel-deploy-preview@v1
  with:
    forge-token: ${{ secrets.FORGE_TOKEN }}
    servers: |
      qa-1.acme.dev 60041
    after-deploy: npm ci && npm run build
    env-file: $HOME/.env
```

## Development

This action is loosely based on GitHub's [hello-world-javascript-action](https://github.com/actions/hello-world-javascript-action) and [typescript-action](https://github.com/actions/typescript-action) templates. It's written in TypeScript and compiled with [`ncc`](https://github.com/vercel/ncc) into a single JavaScript file.

Run `npm run build` to compile a new version of the action for distribution.

To run the action locally, create a `.env` file and add your Forge API token to it, then edit `src/debug.ts` to manually set the input values you want to use, and finally run `npm run debug`.

When releasing a new version of the action, update the major version tag to point to the same commit as the latest patch release. This is what allows users to use `tighten/laravel-deploy-preview@v1` in their workflows instead of `tighten/laravel-deploy-preview@v1.0.2`. For example, after tagging and releasing `v1.0.2`, delete the `v1` tag locally, create it again pointing to the same commit as `v1.0.2`, and force push your tags with `git push -f --tags`.
