import {
  HotkeyOptions,
  PortableTextBlock,
  PortableTextChild,
  PortableTextEditor,
  PortableTextFeatures,
  // Type,
  usePortableTextEditor,
  usePortableTextEditorSelection,
} from '@sanity/portable-text-editor'
import {ObjectSchemaType, Path} from '@sanity/types'
import {FOCUS_TERMINATOR} from '@sanity/util/paths'
import {useCallback, useMemo} from 'react'
import {FIXME} from '../../../types'
import {useUnique} from '../utils/useUnique'
import {getPTEToolbarActionGroups} from './helpers'
import {BlockStyleItem, PTEToolbarAction, PTEToolbarActionGroup} from './types'

export function useFocusBlock(): PortableTextBlock | undefined {
  const editor = usePortableTextEditor()
  const selection = usePortableTextEditorSelection()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => PortableTextEditor.focusBlock(editor), [editor, selection]) // selection must be an additional dep here
}

export function useFocusChild(): PortableTextChild | undefined {
  const editor = usePortableTextEditor()
  const selection = usePortableTextEditorSelection()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => PortableTextEditor.focusChild(editor), [editor, selection]) // selection must be an additional dep here
}

export function useFeatures(): PortableTextFeatures {
  const editor = usePortableTextEditor()

  return useMemo(() => PortableTextEditor.getPortableTextFeatures(editor), [editor])
}

export function useActionGroups({
  hotkeys,
  onFocus,
  resolveInitialValue,
  disabled,
}: {
  hotkeys: HotkeyOptions
  onFocus: (path: Path) => void
  resolveInitialValue: (type: ObjectSchemaType) => any
  disabled: boolean
}): PTEToolbarActionGroup[] {
  const editor = usePortableTextEditor()

  const handleInsertAnnotation = useCallback(
    async (type: ObjectSchemaType) => {
      const initialValue = await resolveInitialValue(type)
      const paths = PortableTextEditor.addAnnotation(editor, type as FIXME, initialValue)
      if (paths && paths.markDefPath) {
        PortableTextEditor.blur(editor)
        onFocus(paths.markDefPath.concat(FOCUS_TERMINATOR))
      }
    },
    [editor, onFocus, resolveInitialValue]
  )

  return useMemo(
    () =>
      editor ? getPTEToolbarActionGroups(editor, disabled, handleInsertAnnotation, hotkeys) : [],
    [disabled, editor, handleInsertAnnotation, hotkeys]
  )
}

export function useActiveActionKeys({
  actions,
}: {
  actions: Array<PTEToolbarAction & {firstInGroup?: true}>
}): string[] {
  const editor = usePortableTextEditor()
  const selection = usePortableTextEditorSelection()

  return useUnique(
    useMemo(
      () => {
        const activeAnnotationKeys = PortableTextEditor.activeAnnotations(editor).map(
          (a) => a._type
        )

        return actions
          .filter((a) => {
            if (a.type === 'annotation') {
              return activeAnnotationKeys.includes(a.key)
            }

            if (a.type === 'listStyle') {
              return PortableTextEditor.hasListStyle(editor, a.key)
            }

            return PortableTextEditor.isMarkActive(editor, a.key)
          })
          .map((a) => a.key)
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        editor,
        // This is needed so that active actions update as `selection` changes
        selection,
      ]
    )
  )
}

export function useActiveStyleKeys({items}: {items: BlockStyleItem[]}): string[] {
  const editor = usePortableTextEditor()
  const focusBlock = useFocusBlock()
  const selection = usePortableTextEditorSelection()

  return useUnique(
    useMemo(
      () =>
        items.filter((i) => PortableTextEditor.hasBlockStyle(editor, i.style)).map((i) => i.style),
      //  eslint-disable-next-line react-hooks/exhaustive-deps
      [
        focusBlock,
        // This is needed so that active styles update as `selection` changes
        selection,
      ]
    )
  )
}
