<script lang="ts">
  import Chat from './lib/Chat.svelte';
  import ModelSelector from './lib/ModelSelector.svelte';
  import SystemPrompt from './lib/SystemPrompt.svelte';
  import ModelManager from './lib/ModelManager.svelte';
  import { onMount } from 'svelte';
  import { loadModels, loadMemory } from './lib/stores';
  import Button from '$lib/components/ui/button/button.svelte';
  import ModeToggle from '$lib/ModeToggle.svelte';

  import { ThemeProvider } from "svelte-themes";

  let currentView: 'chat' | 'models' = 'chat';

  onMount(() => {
    loadModels();
    loadMemory();
  });
</script>

<ThemeProvider>
  <main class="dark text-foreground bg-background">
    <nav>
      <Button on:click={() => currentView = 'chat'} variant={currentView === 'chat' ? 'secondary' : 'ghost'}>Chat</Button>
      <Button on:click={() => currentView = 'models'} variant={currentView === 'models' ? 'secondary' : 'ghost'}>Models</Button>
      <ModeToggle />
    </nav>

    {#if currentView === 'chat'}
      <ModelSelector />
      <SystemPrompt />
      <Chat />
    {:else if currentView === 'models'}
      <ModelManager />
    {/if}
  </main>
</ThemeProvider>
