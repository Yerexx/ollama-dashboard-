<script lang="ts">
  import { models, loadModels } from './stores';
  import { deleteModel, downloadModel } from './ollama';
  import { onMount } from 'svelte';

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

<div class="model-manager">
  <h1>Model Management</h1>

  <div class="download-model">
    <h2>Download a new model</h2>
    <form on:submit|preventDefault={handleDownload}>
      <input type="text" bind:value={downloadModelName} placeholder="e.g. llama2:7b" />
      <button type="submit">Download</button>
    </form>
    {#if downloadProgress}
      <div class="progress-container">
        <p>{downloadProgress.status}</p>
        {#if downloadProgress.total > 0}
          <progress value={downloadProgress.completed} max={downloadProgress.total}></progress>
          <span>
            {formatSize(downloadProgress.completed)} / {formatSize(downloadProgress.total)}
          </span>
        {/if}
      </div>
    {/if}
  </div>

  <div class="downloaded-models">
    <h2>Downloaded models</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Size</th>
          <th>Modified</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $models as model}
          <tr>
            <td>{model.name}</td>
            <td>{formatSize(model.size)}</td>
            <td>{formatDate(model.modified_at)}</td>
            <td>
              <button class="delete-btn" on:click={() => handleDelete(model.name)}>Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .model-manager {
    padding: 2rem;
  }
  h1, h2 {
    color: #333;
  }
  .download-model, .downloaded-models {
    margin-top: 2rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  th {
    background-color: #f2f2f2;
  }
  .delete-btn {
    background-color: #ff4d4d;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  form {
    display: flex;
    gap: 1rem;
  }
  input[type="text"] {
    flex-grow: 1;
    padding: 0.5rem;
  }
  .progress-container {
    margin-top: 1rem;
  }
  progress {
    width: 100%;
  }
</style>
