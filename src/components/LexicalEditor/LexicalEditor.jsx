import React from 'react';
import {
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import './LexicalEditor.scss';
import ToolbarPlugin from './ToolbarPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { $getRoot } from 'lexical'; 

const theme = {
  // puoi personalizzarlo se vuoi
};

const editorConfig = {
  theme,
  onError(error) {
    console.error(error);
  },
  namespace: 'PostEditor',
  nodes: [HeadingNode, ListNode, ListItemNode]
};

export default function LexicalEditor({ onChange }) {
  return (
    <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container">
            <ToolbarPlugin />
            <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<div className="editor-placeholder">Scrivi il contenuto...</div>}
            />
            <HistoryPlugin />
            <OnChangePlugin
            onChange={(editorState) => {
                editorState.read(() => {
                    const root = $getRoot(); // ✅ CORRETTO
                    const textContent = root.getTextContent();
                    onChange(textContent);
                });
            }}
            />
        </div>
    </LexicalComposer>
  );
}
