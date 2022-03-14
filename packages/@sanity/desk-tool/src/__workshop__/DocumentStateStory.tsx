import {
  DocumentActionComponent,
  DocumentActionDescription,
  DocumentActionProps,
  useInitialValue,
} from '@sanity/base'
import {EditStateFor} from '@sanity/base/_internal'
import {useUnique} from '@sanity/base/util'
import {useConnectionState, useEditState, useValidationStatus} from '@sanity/base/hooks'
import {Box, Button, Code, Dialog, Stack} from '@sanity/ui'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {resolveDocumentActions} from '../actions/resolveDocumentActions'
import {DeskToolProvider} from '../contexts/deskTool'
import {DocumentPaneProvider} from '../panes/document/DocumentPaneProvider'
import {DocumentPaneNode} from '../types'

export default function InitialValueStory() {
  const documentId = 'test'
  const documentType = 'author'

  const pane: DocumentPaneNode = useMemo(
    () => ({
      id: documentId,
      options: {
        id: documentId,
        type: documentType,
      },
      type: 'document',
      title: 'Workshop',
    }),
    [documentId, documentType]
  )

  return (
    <DeskToolProvider>
      <DocumentPaneProvider index={0} itemId={documentId} pane={pane} paneKey={documentId}>
        <Debug documentId={documentId} documentType={documentType} />
      </DocumentPaneProvider>
    </DeskToolProvider>
  )
}

function Debug(props: {documentId: string; documentType: string}) {
  const {documentId, documentType} = props

  const templateName = undefined // 'author-developer'
  const templateParams = undefined // {}

  const initialValue = useInitialValue({
    documentId,
    documentType,
    templateName,
    templateParams,
  })

  const editState = useEditState(documentId, documentType)
  const {validation} = useValidationStatus(documentId, documentType)
  const connectionState = useConnectionState(documentId, documentType)

  const value = editState?.draft || editState?.published || initialValue.value

  const documentActions = useDocumentActions(editState)

  return (
    <Box padding={4}>
      <Code language="json" size={1}>
        {JSON.stringify(
          {
            connectionState,
            documentId,
            documentType,
            initialValue,
            validation,
            templateName,
            templateParams,
            value,
          },
          null,
          2
        )}
      </Code>

      {documentActions.node}

      {documentActions.items && (
        <>
          <Stack space={1}>
            {documentActions.items.map(
              (actionItem, idx) =>
                actionItem && (
                  <Button
                    disabled={actionItem.disabled}
                    icon={actionItem.icon}
                    key={idx}
                    // eslint-disable-next-line react/jsx-handler-names
                    onClick={actionItem.onHandle}
                    tone={actionItem.tone}
                    text={actionItem.label}
                  />
                )
            )}
          </Stack>

          {documentActions.items.map((actionItem, idx) => {
            if (actionItem?.modal && actionItem.modal.type === 'dialog') {
              return (
                <Dialog
                  footer={actionItem.modal.footer}
                  header={actionItem.modal.header}
                  id={`document-action-modal-${idx}`}
                  // eslint-disable-next-line react/jsx-handler-names
                  onClose={actionItem.modal.onClose}
                >
                  <Box padding={4}>{actionItem.modal.content}</Box>
                </Dialog>
              )
            }

            return null
          })}
        </>
      )}
    </Box>
  )
}

function useDocumentActions(editState: EditStateFor) {
  const actionHooks = useMemo(() => (editState ? resolveDocumentActions() : null), [editState])

  const [descriptions, setDescriptions] = useState<Array<DocumentActionDescription | null> | null>(
    null
  )

  const node = actionHooks && (
    <DocumentActionResolver
      actionHooks={actionHooks}
      editState={editState}
      onUpdate={setDescriptions}
    />
  )

  return {items: descriptions, node}
}

function DocumentActionResolver(props: {
  actionHooks: DocumentActionComponent[]
  editState: EditStateFor
  onUpdate: (descs: Array<DocumentActionDescription | null>) => void
}) {
  const {actionHooks, editState, onUpdate} = props

  const [actionDescriptions, setActionDescriptions] = useState<
    Array<DocumentActionDescription | null>
  >(() => actionHooks.map(() => null))

  const updateDescription = useCallback((desc: DocumentActionDescription | null, idx: number) => {
    setActionDescriptions((arr) => {
      const copy = arr.slice(0)
      copy.splice(idx, 1, desc)
      return copy
    })
  }, [])

  useEffect(() => {
    onUpdate(actionDescriptions)
  }, [actionDescriptions, onUpdate])

  return (
    <>
      {actionHooks.map((actionHook, idx) => (
        <DocumentActionHook
          actionHook={actionHook}
          editState={editState}
          index={idx}
          key={idx}
          onUpdate={updateDescription}
        />
      ))}
    </>
  )
}

function DocumentActionHook(props: {
  actionHook: DocumentActionComponent
  editState: EditStateFor
  index: number
  onUpdate: (desc: DocumentActionDescription | null, idx: number) => void
}) {
  const {actionHook: useActionDescription, editState, index, onUpdate} = props

  const onComplete = useCallback(() => {
    // @todo
  }, [])

  const actionProps: DocumentActionProps = useMemo(
    () => ({
      ...editState,
      onComplete,
      // @todo
      revision: undefined,
    }),
    [editState, onComplete]
  )

  const actionDescription = useUnique(useActionDescription(actionProps))

  useEffect(() => {
    onUpdate(actionDescription, index)
  }, [actionDescription, index, onUpdate])

  return null
}