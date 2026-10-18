# KRuins Prompt Building Companion (PBC)

A free ComfyUI custom node for creating prompts, managing wildcard files, and saving reusable prompt presets.

## Features

- **Keywords:** insert, create, and delete customizable keyword buttons.
- **Wild Cards:** browse, search by filename, create, edit, and delete TXT wildcards; create, rename, and delete folders; smart folder rename with reference updates; import TXT and ZIP wildcard packs; refresh change detection.
- **Prompting:** save, edit, delete, and import TXT prompt presets, with button labels up to 25 characters.
- Target selection, prompt insertion, Undo and Copy, and Prompt Ready / Edit Mode.

## Install manually

1. Download this repository as a ZIP and extract it.
2. Place the `KRuins-PBC` folder in `ComfyUI/custom_nodes/`.
3. Restart ComfyUI and refresh the browser.
4. Search for **KRuins - Prompt Building Companion** under the **KRuins** node category.

## Basic use

1. Add PBC to your workflow and select a compatible text target.
2. Use **Keywords**, **Wild Cards**, or **Prompting** to insert text into that target.
3. Click **Edit** to manage items. Use **Save Prompt** to save preset content or **Save Changes** to save wildcard content. The main **Save** exits Edit Mode.
4. Use **Refresh** in Wild Cards after changing files outside PBC.

## Compatibility

Designed especially for **KRuins Wildcard Batch** and **KRuins Show Text**. PBC can insert prompt text into other compatible text widgets; wildcard expansion requires a compatible wildcard resolver. Third-party compatibility depends on their widget and wildcard syntax.

## Important

- Back up wildcard files before deleting folders or changing paths.
- The `data/` folder stores user prompt presets; do not overwrite your existing installation without backing up your personal data and settings.
- A complete illustrated user guide is provided in the KRuins Civitai article (link to be added after publication).

## Licensing

A license has not yet been selected for this repository. Do not assume reuse or redistribution permissions until a license is added.

## License and attribution

MIT License. Copyright © 2026 KRuins. Please retain the copyright and license notice when redistributing or modifying the software. See [LICENSE](LICENSE).
