<script lang="ts">
  import { systemPrompt } from '$lib/stores';
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';
</script>

<div class="p-4 border-b">
  <Textarea bind:value={$systemPrompt} placeholder="Enter a system prompt..." />
</div>
