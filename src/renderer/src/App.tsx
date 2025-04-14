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
import { HtmlPreview } from './components/HtmlPreview' // Import the new component

const App = () => {
  const contentContainerRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<'markdown' | 'html'>('markdown')

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

          {/* Add toggle buttons */}
          <div className="flex justify-center gap-2 py-2">
            <button
              onClick={() => setViewMode('markdown')}
              className={`px-2 py-1 rounded ${viewMode === 'markdown' ? 'bg-zinc-700' : 'bg-zinc-800'}`}
            >
              Edit (Markdown)
            </button>
            <button
              onClick={() => setViewMode('html')}
              className={`px-2 py-1 rounded ${viewMode === 'html' ? 'bg-zinc-700' : 'bg-zinc-800'}`}
            >
              Preview (HTML)
            </button>
          </div>

          {viewMode === 'markdown' ? <MarkdownEditor /> : <HtmlPreview />}
        </Content>
      </RootLayout>
    </>
  )
}

export default App
