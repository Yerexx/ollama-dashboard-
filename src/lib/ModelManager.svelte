<script lang="ts">
  import { models, loadModels } from '$lib/stores';
  import { deleteModel, downloadModel } from '$lib/ollama';
  import { onMount } from 'svelte';
  import * as Table from '$lib/components/ui/table';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';

  let downloadModelName = '';
  let downloadProgress: { status: string; total: number; completed: number } | null = null;

  onMount(loadModels);

  async function handleDelete(modelName: string) {
    if (confirm(`Are you sure you want to delete ${modelName}?`)) {
      const success = await deleteModel(modelName);
      if (success) {
        loadModels();
      }
    }
  }

  async function handleDownload() {
    if (!downloadModelName) return;
    downloadProgress = { status: 'starting...', total: 0, completed: 0 };
    await downloadModel(downloadModelName, (status, total, completed) => {
      downloadProgress = { status, total, completed };
      if (status === 'success') {
        downloadProgress = null;
        downloadModelName = '';
        loadModels();
      }
    });
  }

  function formatSize(sizeInBytes: number): string {
    const sizeInGb = sizeInBytes / (1024 * 1024 * 1024);
    return `${sizeInGb.toFixed(2)} GB`;
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
</script>

<div class="p-4">
  <h1 class="text-2xl font-bold mb-4">Model Management</h1>

  <div class="mb-8">
    <h2 class="text-xl font-semibold mb-2">Download a new model</h2>
    <form on:submit|preventDefault={handleDownload} class="flex space-x-2">
      <Input type="text" bind:value={downloadModelName} placeholder="e.g. llama2:7b" class="flex-1" />
      <Button type="submit">Download</Button>
    </form>
    {#if downloadProgress}
      <div class="mt-4">
        <p>{downloadProgress.status}</p>
        {#if downloadProgress.total > 0}
          <progress value={downloadProgress.completed} max={downloadProgress.total} class="w-full"></progress>
          <span>
            {formatSize(downloadProgress.completed)} / {formatSize(downloadProgress.total)}
          </span>
        {/if}
      </div>
    {/if}
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-2">Downloaded models</h2>
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Size</Table.Head>
          <Table.Head>Modified</Table.Head>
          <Table.Head>Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each $models as model}
          <Table.Row>
            <Table.Cell>{model.name}</Table.Cell>
            <Table.Cell>{formatSize(model.size)}</Table.Cell>
            <Table.Cell>{formatDate(model.modified_at)}</Table.Cell>
            <Table.Cell>
              <Button variant="destructive" on:click={() => handleDelete(model.name)}>Delete</Button>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
