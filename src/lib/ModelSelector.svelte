<script lang="ts">
  import { models, selectedModel } from '$lib/stores';
  import * as Select from '$lib/components/ui/select';
</script>

<div class="p-4 border-b">
  <Select.Root items={$models.map(m => ({ value: m.name, label: m.name }))} onSelectedChange={(v) => selectedModel.set(v?.value)}>
    <Select.Trigger class="w-full">
      <Select.Value placeholder="Select a model" />
    </Select.Trigger>
    <Select.Content>
      {#each $models as model}
        <Select.Item value={model.name} label={model.name}>{model.name}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
</div>
