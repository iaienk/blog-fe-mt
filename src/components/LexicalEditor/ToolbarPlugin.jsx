import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
  ListItemNode
} from '@lexical/list';
import {
  $isHeadingNode,
  $createHeadingNode,
  HeadingNode
} from '@lexical/rich-text';
import './ToolbarPlugin.scss';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false
  });
  const [blockType, setBlockType] = useState('paragraph');

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setFormats({
            bold: selection.hasFormat('bold'),
            italic: selection.hasFormat('italic'),
            underline: selection.hasFormat('underline')
          });

          const anchorNode = selection.anchor.getNode();
          const topNode = anchorNode.getTopLevelElementOrThrow();

          if ($isHeadingNode(topNode)) {
            setBlockType(topNode.getTag());
          } else if ($isListNode(topNode)) {
            setBlockType('bullet');
          } else {
            setBlockType('paragraph');
          }
        }
      });
    });
  }, [editor]);

  const formatClass = (condition) => (condition ? 'active' : '');

  const applyHeading = (tag) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const heading = $createHeadingNode(tag);
        heading.append(...selection.getNodes());
        selection.insertNodes([heading]);
      }
    });
  };

  const toggleList = () => {
    editor.getEditorState().read(() => {
      editor.dispatchCommand(
        blockType === 'bullet' ? REMOVE_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
        undefined
      );
    });
  };

  return (
    <div className="toolbar">
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={formatClass(formats.bold)}
        aria-label="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={formatClass(formats.italic)}
        aria-label="Italic"
      >
        <em>I</em>
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className={formatClass(formats.underline)}
        aria-label="Underline"
      >
        <u>U</u>
      </button>

      <button
        onClick={() => applyHeading('h1')}
        className={formatClass(blockType === 'h1')}
      >
        H1
      </button>
      <button
        onClick={() => applyHeading('h2')}
        className={formatClass(blockType === 'h2')}
      >
        H2
      </button>

      <button
        onClick={toggleList}
        className={formatClass(blockType === 'bullet')}
      >
        • Lista
      </button>

      <button onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>↺ Undo</button>
      <button onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>↻ Redo</button>
    </div>
  );
}
