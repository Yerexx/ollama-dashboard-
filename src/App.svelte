<script lang="ts">
  import Chat from './lib/Chat.svelte';
  import ModelSelector from './lib/ModelSelector.svelte';
  import SystemPrompt from './lib/SystemPrompt.svelte';
  import ModelManager from './lib/ModelManager.svelte';
  import { onMount } from 'svelte';
  import { loadModels } from './lib/stores';

  let currentView: 'chat' | 'models' = 'chat';

  onMount(() => {
    loadModels();
  });
</script>

<main>
  <nav>
    <button on:click={() => currentView = 'chat'} class:active={currentView === 'chat'}>Chat</button>
    <button on:click={() => currentView = 'models'} class:active={currentView === 'models'}>Models</button>
  </nav>

  {#if currentView === 'chat'}
    <ModelSelector />
    <SystemPrompt />
    <Chat />
  {:else if currentView === 'models'}
    <ModelManager />
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  nav {
    display: flex;
    justify-content: center;
    padding: 0.5rem;
    background-color: #f0f0f0;
    border-bottom: 1px solid #ccc;
  }
  button {
    margin: 0 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    color: #333;
  }
  button.active {
    border-bottom: 2px solid #007bff;
    color: #007bff;
  }
</style>
