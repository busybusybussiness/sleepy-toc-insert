import { Plugin, Notice } from 'obsidian';
import { applyToc } from './toc.js';

// Command: insert or refresh a table of contents (H2–H4) in the active note.
export default class TocInsertPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: 'insert-or-update-toc',
      name: 'Insert or update table of contents',
      editorCallback: (editor) => {
        const before = editor.getValue();
        const after = applyToc(before, { minLevel: 2, maxLevel: 4 });
        if (after !== before) {
          // Note: setValue resets the cursor position to the start of the note.
          editor.setValue(after);
        }
        new Notice('Table of contents updated');
      },
    });
  }
}
