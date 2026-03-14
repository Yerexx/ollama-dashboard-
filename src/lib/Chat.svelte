<script lang="ts">
  import { fetch } from '@tauri-apps/api/http';
  import { selectedModel, systemPrompt } from './stores';

  let messages: { user: string; text: string }[] = [
    { user: 'assistant', text: 'Hello! How can I help you today?' },
  ];
  let newMessage = '';

  async function sendMessage() {
    if (newMessage.trim() === '' || !$selectedModel) return;
    const userMessage = newMessage;
    messages = [...messages, { user: 'user', text: userMessage }];
    newMessage = '';

    messages = [...messages, { user: 'assistant', text: '...' }];

    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          model: $selectedModel,
          messages: [{ role: 'system', content: $systemPrompt }, ...messages.slice(0, -1).map(m => ({ role: m.user, content: m.text }))],
          stream: true,
        }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      let assistantResponse = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        
        // Ollama streams NDJSON, so we need to parse each line
        const jsonChunks = chunk.split('\n').filter(c => c);

        for (const jsonChunk of jsonChunks) {
          try {
            const parsed = JSON.parse(jsonChunk);
            if (parsed.message && parsed.message.content) {
              assistantResponse += parsed.message.content;
              messages[messages.length - 1].text = assistantResponse;
              messages = messages;
            }
          } catch (e) {
            console.error('Failed to parse JSON chunk', jsonChunk);
          }
        }
      }

    } catch (error) {
      console.error('Ollama API request failed', error);
      messages[messages.length - 1].text = 'Sorry, something went wrong.';
      messages = messages;
    }
  }
</script>

<div class="chat-window">
  <div class="messages">
    {#each messages as message}
      <div class="message" class:user={message.user === 'user'} class:assistant={message.user === 'assistant'}>
        <p>{message.text}</p>
      </div>
    {/each}
  </div>
  <div class="input-area">
    <input type="text" bind:value={newMessage} on:keydown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type your message..." />
    <button on:click={sendMessage}>Send</button>
  </div>
</div>

<style>
  .chat-window {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0;
  }
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
  .message {
    margin-bottom: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    max-width: 80%;
  }
  .user {
    background-color: #007bff;
    color: white;
    align-self: flex-end;
    margin-left: auto;
  }
  .assistant {
    background-color: #e9e9eb;
    align-self: flex-start;
  }
  .input-area {
    display: flex;
    padding: 1rem;
    border-top: 1px solid #ccc;
  }
  input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
  }
  button {
    margin-left: 1rem;
    padding: 0.5rem 1rem;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 0.5rem;
    cursor: pointer;
  }
</style>
