# Contributing

Thanks for helping with MERUN. This page covers how to set up, how a change
gets from your machine into `main`, and what to check first. The project rules
live in [AGENTS.md](AGENTS.md); this guide does not repeat them.

## Setup

Requires Node.js and npm.

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL` and
   `SUPABASE_SECRET_KEY` from your Supabase project. `.env.local` is ignored by
   git. Never commit it, and never share the secret key.
3. `npm run dev`

## Workflow

Nothing is committed on `main`. Every change goes through a branch and a pull
request.

1. Start from an up-to-date `main`: `git switch main && git pull`.
2. Create a branch named after the change type: `feat/log-run-form`,
   `fix/feed-empty-state`, `docs/...`, `chore/...`, `test/...`.
3. Work in small steps. One idea per commit, using Conventional Commits
   (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).
4. Push the branch and open a pull request into `main`.
5. The owner reviews and merges. Pull requests are squash merged, so the pull
   request title becomes the commit on `main`: write it as a Conventional
   Commit.
6. Delete the branch after the merge.

## Before you open a pull request

All three must pass with no warnings:

- `npm run build`
- `npm run lint`
- `npm test`

Also:

- Update the docs the change touches, and add an entry to
  [docs/CHANGELOG.md](docs/CHANGELOG.md).
- For UI changes, go through [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md).

## What a pull request should say

What changed, which files, and why. Mention anything you did not test, and
anything you noticed but left alone.

## Project rules in short

Read [AGENTS.md](AGENTS.md) before changing code. The ones that most often
matter in review: accessibility from the start, functions that do not trust
their input, plain co-located CSS, and the feature boundaries that
`npm run lint` enforces.

## AI agents

[AGENTS.md](AGENTS.md) is the entry point. In particular: make one small
change, stop and report it, and wait for the go-ahead. Do not push or open a
pull request without asking.
