import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function TinyMCEEditor({ value, onChange }) {
  return (
    <Editor
      apiKey="vw88rfc3g91hfomsic7ap4nvvx76wadyoscf085yputczqco"
       value={value}
      onEditorChange={content => onChange?.(content)}
      init={{
        height: 300,
        menubar: false,             // se vuoi mostrare il menù, metti true
        plugins: [
          'lists',                  // elenchi puntati e numerati
          'link',                   // inserimento/gestione link
          'code',                   // view/edit HTML sorgente
          'help'                    // pulsante di help
        ],
        toolbar: [
          'undo redo |',            // annulla/ripristina
          'bold italic underline |',
          'bullist numlist |',      // puntata e numerata
          'link |',                 // inserisci/modifica link
          'code |',                 // sorgente HTML
          'help'                    // pulsante help
        ].join(' '),
        branding: false,
        content_style: `
          body { font-family:Helvetica,Arial,sans-serif; font-size:14px }
        `,
      }}
    />
  );
}
