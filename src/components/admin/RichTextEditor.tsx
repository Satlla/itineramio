'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { SlashCommand } from './SlashCommandExtension'
import { suggestion } from './SlashCommands'
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Palette
} from 'lucide-react'
import { useState } from 'react'
import 'tippy.js/dist/tippy.css'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = 'Empieza a escribir...' }: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        // Desactivar link porque lo configuramos por separado
        link: false
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-violet-600 hover:text-violet-700 underline cursor-pointer'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4'
        }
      }),
      Placeholder.configure({
        placeholder: placeholder + ' (escribe "/" para ver comandos)'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      TextStyle,
      Color,
      SlashCommand.configure({
        suggestion
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-violet max-w-none focus:outline-none p-6 min-h-[500px] prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-base prose-p:leading-7 prose-strong:font-bold prose-strong:text-gray-900 prose-a:text-violet-600 prose-a:underline prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4 prose-blockquote:border-l-4 prose-blockquote:border-violet-500 prose-blockquote:pl-4 prose-blockquote:italic'
      }
    },
    immediatelyRender: false
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setShowImageInput(false)
    }
  }

  const MenuButton = ({ onClick, active, disabled, children, title }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-violet-100 text-violet-700' : 'text-gray-700'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar estilo Notion */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50 sticky top-0 z-10">
        <style jsx global>{`
          .ProseMirror {
            outline: none;
          }
          .ProseMirror h1 {
            font-size: 2.25rem;
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            line-height: 1.2;
          }
          .ProseMirror h2 {
            font-size: 1.875rem;
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            line-height: 1.3;
          }
          .ProseMirror h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
            line-height: 1.4;
          }
          .ProseMirror p {
            margin-bottom: 1rem;
            line-height: 1.75;
          }
          .ProseMirror strong {
            font-weight: 700;
            color: #111827;
          }
          .ProseMirror em {
            font-style: italic;
          }
          .ProseMirror ul, .ProseMirror ol {
            padding-left: 1.5rem;
            margin-bottom: 1rem;
          }
          .ProseMirror ul {
            list-style-type: disc;
          }
          .ProseMirror ol {
            list-style-type: decimal;
          }
          .ProseMirror li {
            margin-bottom: 0.5rem;
          }
          .ProseMirror blockquote {
            border-left: 4px solid #8b5cf6;
            padding-left: 1rem;
            font-style: italic;
            color: #6b7280;
            margin: 1rem 0;
          }
          .ProseMirror a {
            color: #8b5cf6;
            text-decoration: underline;
          }
          .ProseMirror code {
            background-color: #f3f4f6;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-family: monospace;
            font-size: 0.875em;
          }
          .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 1rem 0;
          }
        `}</style>
        {/* Text formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Cmd+B)"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Cmd+I)"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Inline code"
          >
            <Code className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet list"
          >
            <List className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered list"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align left"
          >
            <AlignLeft className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Align center"
          >
            <AlignCenter className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Align right"
          >
            <AlignRight className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Link */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <MenuButton
            onClick={() => setShowLinkInput(!showLinkInput)}
            active={editor.isActive('link')}
            title="Add link"
          >
            <LinkIcon className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => setShowImageInput(!showImageInput)}
            title="Add image"
          >
            <ImageIcon className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Cmd+Z)"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Quick Actions */}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => {
              const html = '<NewsletterCTA variant="inline" />'
              editor.chain().focus().insertContent(html).run()
            }}
            className="px-3 py-1 text-xs bg-violet-100 text-violet-700 rounded hover:bg-violet-200 transition-colors font-medium"
          >
            + Newsletter CTA
          </button>
          <button
            onClick={() => {
              const html = '<div class="callout callout-stats"><h3>📊 Datos:</h3><ul><li>Punto 1</li><li>Punto 2</li></ul></div>'
              editor.chain().focus().insertContent(html).run()
            }}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium"
          >
            + Callout Box
          </button>
        </div>
      </div>

      {/* Link input */}
      {showLinkInput && (
        <div className="p-3 bg-yellow-50 border-b border-yellow-200 flex gap-2">
          <input
            type="url"
            placeholder="https://ejemplo.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
            autoFocus
          />
          <button
            onClick={addLink}
            className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
          >
            Añadir
          </button>
          <button
            onClick={() => setShowLinkInput(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Image input */}
      {showImageInput && (
        <div className="p-3 bg-blue-50 border-b border-blue-200 flex gap-2">
          <input
            type="url"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addImage()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
            autoFocus
          />
          <button
            onClick={addImage}
            className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
          >
            Añadir
          </button>
          <button
            onClick={() => setShowImageInput(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Footer info */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-600 flex justify-between">
        <div>
          {editor.storage.characterCount?.characters() || 0} caracteres · {' '}
          {editor.storage.characterCount?.words() || Math.round((editor.getText().length) / 5)} palabras
        </div>
        <div className="text-violet-600 font-medium">
          💡 Escribe "/" para ver todos los comandos
        </div>
      </div>
    </div>
  )
}
