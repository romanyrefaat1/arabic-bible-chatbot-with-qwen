// lib/use-gradio-api-client.ts
export async function sendMessageToQwen(
    message: string,
    sysPrompt: string,
    context: string[][]
  ): Promise<string> {
    console.log('🚀 sendMessageToQwen called');
    console.log('📝 Message:', message);
    console.log('📝 System prompt length:', sysPrompt.length);
    console.log('📝 Context length:', context.length);
    
    try {
      console.log('🔄 Making fetch request to /api/chat');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sysPrompt,
          context,
        }),
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Response not ok:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Request failed');
      }
      
      console.log('✅ sendMessageToQwen completed successfully');
      return data.response;
      
    } catch (error) {
      console.error('❌ sendMessageToQwen error:', error);
      throw error;
    }
  }