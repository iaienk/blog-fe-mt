import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import './TiptapEditor.scss';

export default function TiptapEditor({ value, onChange }) {
    const editor = useEditor({
    extensions: [
        StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        }),
        ListItem,
        BulletList,
        OrderedList,
    ],
    content: value,
    onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
    },
    });

  useEffect(() => {
    return () => {
      if (editor) editor.destroy();
    };
  }, [editor]);

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'active' : ''}
            type="button"
            >
            B
        </button>
        <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'active' : ''}
            type="button"
            >
            I
        </button>
        <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'active' : ''}
            type="button"
            >
            U
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor?.isActive('heading', { level: 1 }) ? 'active' : ''}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive('heading', { level: 2 }) ? 'active' : ''}>H2</button>
        <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'active' : ''}
            type="button"
            >
            • Lista
        </button>
        <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'active' : ''}
            type="button"
            >
            1. Lista
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
