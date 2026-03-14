<script lang="ts">
  import { fetch } from '@tauri-apps/api/http';
  import { selectedModel, systemPrompt } from '$lib/stores';
  import * as Card from '$lib/components/ui/card';
  import Input from '$lib/components/ui/input/input.svelte';
  import Button from '$lib/components/ui/button/button.svelte';

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

<div class="flex flex-col h-full">
  <div class="flex-1 overflow-y-auto p-4 space-y-4">
    {#each messages as message}
      <div class="flex" class:justify-end={message.user === 'user'}>
        <Card.Root class="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl {message.user === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}">
          <Card.Content class="p-4">
            <p>{message.text}</p>
          </Card.Content>
        </Card.Root>
      </div>
    {/each}
  </div>
  <div class="p-4 border-t">
    <form on:submit|preventDefault={sendMessage} class="flex space-x-2">
      <Input type="text" bind:value={newMessage} placeholder="Type your message..." class="flex-1" />
      <Button type="submit">Send</Button>
    </form>
  </div>
</div>
