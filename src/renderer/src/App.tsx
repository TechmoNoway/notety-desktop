import { useRef, useState } from 'react'
import {
  ActionButtonsRow,
  Content,
  DraggableTopBar,
  FloatingNoteTitle,
  MarkdownEditor,
  NotePreviewList,
  RootLayout,
  Sidebar
} from './components'
import { BufferOverflowEditor } from './components/demos/BufferOverflowEditor'

const App = () => {
  const contentContainerRef = useRef<HTMLDivElement>(null)
  const [editorMode, setEditorMode] = useState<'normal' | 'buffer'>('normal')

  const resetScroll = () => {
    contentContainerRef.current?.scrollTo(0, 0)
  }

  return (
    <>
      <DraggableTopBar />
      <RootLayout>
        <Sidebar className="p-2">
          <ActionButtonsRow className="flex justify-between mt-1" />
          <NotePreviewList className="mt-3 space-y-1" onSelect={resetScroll} />
        </Sidebar>

        <Content ref={contentContainerRef} className="border-l bg-zinc-900/50 border-l-white/20">
          <FloatingNoteTitle className="pt-2" />
          
          <div className="flex justify-center gap-2 py-2 mb-1">
            <button
              onClick={() => setEditorMode('normal')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                editorMode === 'normal' 
                  ? 'bg-zinc-700 text-white' 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700/70'
              }`}
            >
              Normal Editor
            </button>
            <button
              onClick={() => setEditorMode('buffer')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                editorMode === 'buffer' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-red-900/50'
              }`}
            >
              Buffer Overflow Demo
            </button>
          </div>
          
          {editorMode === 'normal' ? (
            <MarkdownEditor />
          ) : (
            <div className="p-4">
              <BufferOverflowEditor />
            </div>
          )}
        </Content>
      </RootLayout>
    </>
  )
}

export default App
