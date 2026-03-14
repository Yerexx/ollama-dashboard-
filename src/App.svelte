<script lang="ts">
  import Chat from './lib/Chat.svelte';
  import ModelSelector from './lib/ModelSelector.svelte';
  import { onMount } from 'svelte';
  import { loadModels } from './lib/stores';

  onMount(() => {
    loadModels();
  });
</script>

<main>
  <ModelSelector />
  <Chat />
</main>

<style>
  main {
    height: 100vh;
  }
</style>
