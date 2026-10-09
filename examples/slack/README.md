# Banner UI examples

These JSON snapshots show the bot's two Slack modal forms. They contain sample
request data and require no Slack or Jira API credentials to generate.

| File | Preview |
| --- | --- |
| [banner-form-layout.json](banner-form-layout.json) | Banner request form before entering values |
| [banner-form-with-output.json](banner-form-with-output.json) | The same form filled with the example request and generated JSON |
| [banner-pasted-formatter.json](banner-pasted-formatter.json) | Separate pasted-request formatter with sample input, metadata and JSON |

Open [Slack Block Kit Builder](https://app.slack.com/block-kit-builder/), copy an
example file's entire contents into its JSON editor, and select the Modal surface
if prompted. Slack sign-in may be required. The builder previews the layout;
buttons do not run the bot's handlers there.

The pasted formatter opens from **Format pasted request** in the banner form.
Its **Back** button returns to the request form. Formatting or previewing does
not submit a banner request; the request form's **Submit** button does.

Regenerate the snapshots after changing the modal builders or JSON conversion:

```bash
npm run examples:banner
```

The generator calls the actual form builders in `src/messages.js` and JSON
conversion in `src/bannerConfiguration.js`. Dates are fixed to the maintenance
example so regeneration is deterministic. Commit the regenerated JSON with UI
changes so reviewers can preview the updated layouts.
