<script lang="ts">
  import { models, selectedModel } from './stores';
</script>

<div class="model-selector">
  <select bind:value={$selectedModel}>
    {#each $models as model}
      <option value={model.name}>{model.name}</option>
    {/each}
  </select>
</div>

<style>
  .model-selector {
    padding: 1rem;
    border-bottom: 1px solid #ccc;
  }
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
  }
</style>
