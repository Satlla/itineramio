'use client'

import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { Editor } from '@tiptap/core'
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image,
  Minus,
  Mail,
  Lightbulb
} from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

interface CommandItem {
  title: string
  description: string
  icon: any
  command: (props: { editor: Editor; range: any }) => void
}

export const getSuggestionItems = ({ query }: { query: string }): CommandItem[] => {
  const items: CommandItem[] = [
    {
      title: 'Text',
      description: 'Texto normal',
      icon: Type,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setParagraph()
          .run()
      },
    },
    {
      title: 'Heading 1',
      description: 'Título grande',
      icon: Heading1,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 1 })
          .run()
      },
    },
    {
      title: 'Heading 2',
      description: 'Título medio',
      icon: Heading2,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 2 })
          .run()
      },
    },
    {
      title: 'Heading 3',
      description: 'Título pequeño',
      icon: Heading3,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 3 })
          .run()
      },
    },
    {
      title: 'Bulleted List',
      description: 'Lista con viñetas',
      icon: List,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleBulletList()
          .run()
      },
    },
    {
      title: 'Numbered List',
      description: 'Lista numerada',
      icon: ListOrdered,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleOrderedList()
          .run()
      },
    },
    {
      title: 'Quote',
      description: 'Cita o destacado',
      icon: Quote,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleBlockquote()
          .run()
      },
    },
    {
      title: 'Code',
      description: 'Código inline',
      icon: Code,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setCode()
          .run()
      },
    },
    {
      title: 'Divider',
      description: 'Línea separadora',
      icon: Minus,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHorizontalRule()
          .run()
      },
    },
    {
      title: 'Newsletter CTA',
      description: 'Caja de suscripción',
      icon: Mail,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent('<NewsletterCTA variant="inline" /><p></p>')
          .run()
      },
    },
    {
      title: 'Callout Box',
      description: 'Caja destacada con info',
      icon: Lightbulb,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent('<div class="callout callout-stats"><h3>📊 Datos:</h3><ul><li>Punto 1</li><li>Punto 2</li></ul></div><p></p>')
          .run()
      },
    },
  ]

  return items.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  )
}

interface CommandListProps {
  items: CommandItem[]
  command: (item: CommandItem) => void
}

export const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 overflow-hidden max-h-80 overflow-y-auto">
      {props.items.length ? (
        props.items.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={index}
              onClick={() => selectItem(index)}
              className={`w-full text-left px-3 py-2 rounded-md flex items-start gap-3 transition-colors ${
                index === selectedIndex
                  ? 'bg-violet-50 text-violet-900'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                index === selectedIndex ? 'text-violet-600' : 'text-gray-400'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{item.title}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </button>
          )
        })
      ) : (
        <div className="text-gray-500 text-sm px-3 py-2">No hay resultados</div>
      )}
    </div>
  )
})

CommandList.displayName = 'CommandList'

export const suggestion = {
  items: getSuggestionItems,
  render: () => {
    let component: ReactRenderer
    let popup: any

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(CommandList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props: any) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide()
          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        popup[0].destroy()
        component.destroy()
      },
    }
  },
}
