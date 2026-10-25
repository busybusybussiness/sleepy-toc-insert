# TOC Insert

Insert or refresh a table of contents in the current note, as clickable heading links.

## What it does

Run the command **Insert or update table of contents** from the command palette.

- Adds a block of links to every H2–H4 heading in the note, as `[[#Heading|Heading]]` links.
- The block sits between two HTML comment markers (`<!-- toc:start -->` and `<!-- toc:end -->`).
- Running the command again refreshes that block in place. Text outside the markers is never changed.
- Headings inside fenced code blocks and YAML frontmatter are ignored.
- Nested headings are indented by level.

## Install (manual)

1. Download `main.js` and `manifest.json` from the latest release.
2. Copy them into `<your vault>/.obsidian/plugins/sleepy-toc-insert/`.
3. Enable **TOC Insert** under Settings → Community plugins.

## Privacy and network use

- No network requests. No telemetry. No accounts. No payment.
- Reads and writes only the note you run the command in.

## Limits

- Does not number headings.
- Does not support a custom heading range yet (fixed at H2–H4).

## Development

```
bun test      # 6 unit tests for the markdown logic (src/toc.js)
bun build src/main.js --target=browser --format=cjs --external obsidian --outfile main.js
```

## Licence

MIT. See LICENSE.

## AI disclosure

The code was written with AI assistance. The unit tests in `test/` were run and pass (`bun test`). The plugin has not yet been run inside the Obsidian desktop app.
