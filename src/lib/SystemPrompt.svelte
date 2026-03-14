<script lang="ts">
  import { systemPrompt } from './stores';
</script>

<div class="system-prompt">
  <textarea bind:value={$systemPrompt} placeholder="Enter a system prompt..."></textarea>
</div>

<style>
  .system-prompt {
    padding: 1rem;
    border-bottom: 1px solid #ccc;
  }
  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    min-height: 100px;
  }
</style>
