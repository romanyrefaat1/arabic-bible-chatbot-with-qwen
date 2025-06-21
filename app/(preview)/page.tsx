"use client"

import { VersesProvider, useVerses } from '@/contexts/verses-contexts';
import VersesDialogButton from '@/components/chat/found-verses-modal';
import { useChatRemoteWithVerses } from '@/hooks/useChat-remote';

const ChatInterface = () => {
  const { verses, hasVerses, messageVerses, getAllVerses } = useVerses();
  const { messages, sendMessage, clearChat, isProcessing, loadingState } = useChatRemoteWithVerses();

  return (
    <div className="chat-container">
      {/* Verses button shows current/latest verses */}
      <div className="mb-4 flex justify-center">
        <VersesDialogButton 
          verses={verses} 
          isVisible={hasVerses}
          className="sticky top-4 z-10"
        />
      </div>

      {/* Optional: Show all verses from conversation */}
      <div className="mb-4 flex gap-2">
        <VersesDialogButton 
          verses={getAllVerses()} 
          isVisible={getAllVerses().length > 0}
          className="text-xs"
        />
        <span className="text-sm text-gray-500">
          جميع الآيات ({getAllVerses().length})
        </span>
      </div>

      {/* Messages */}
      <div className="messages space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="content">{message.content}</div>
            
            {/* Show verses count for each assistant message */}
            {message.role === 'assistant' && message.type === 'response' && (
              <div className="mt-2 text-xs text-blue-600">
                {messageVerses.find(mv => mv.messageId === message.id)?.verses.length || 0} آيات
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading state */}
      {isProcessing && (
        <div className="loading-indicator">
          {loadingState === 'searching_verses' && '🔍 البحث عن الآيات...'}
          {loadingState === 'thinking' && '🤔 التفكير...'}
          {loadingState === 'generating' && '✍️ الكتابة...'}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.querySelector('input') as HTMLInputElement;
        sendMessage(input.value);
        input.value = '';
      }}>
        <input 
          type="text" 
          placeholder="اسأل سؤالاً..." 
          disabled={isProcessing}
        />
        <button type="submit" disabled={isProcessing}>
          إرسال
        </button>
      </form>

      <button onClick={clearChat}>مسح المحادثة</button>
    </div>
  );
};

// Main App
export default function App() {
  return (
    <VersesProvider>
      <ChatInterface />
    </VersesProvider>
  );
}