<script lang="ts">
  import { fetch } from '@tauri-apps/api/http';
  import { selectedModel, fullSystemPrompt, loadMemory } from '$lib/stores';
  import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
  import { homeDir } from '@tauri-apps/api/path';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import Save from 'lucide-svelte/icons/save';
  import * as Card from '$lib/components/ui/card';
  import Input from '$lib/components/ui/input/input.svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  let messages: { user: string; text: string; memory?: boolean }[] = [
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
          messages: [{ role: 'system', content: $fullSystemPrompt }, ...messages.slice(0, -1).map(m => ({ role: m.user, content: m.text }))],
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
            if (parsed.message && parsed.message.content) {\n              assistantResponse += parsed.message.content;\n              messages[messages.length - 1].text = assistantResponse;\n              messages = messages;\n\n              const memoryMatch = assistantResponse.match(/\\\[WRITE_TO_MEMORY: \"(.*?)\"\\]/);\n              if (memoryMatch) {\n                const newMemory = memoryMatch[1];\n                const home = await homeDir();\n                const memoryPath = `${home}Documents/idk just yet/Existance/Memory.md`;\n                await writeTextFile(memoryPath, `\\n- ${newMemory}`, { append: true });\n                loadMemory();\n                messages[messages.length - 1].memory = true;\n              }\n            }
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
            {#if message.memory}
              <Tooltip.Root>
                <Tooltip.Trigger class="mt-2">
                  <Save class="h-4 w-4 text-muted-foreground" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Memory saved</p>
                </Tooltip.Content>
              </Tooltip.Root>
            {/if}
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
