import { fetch } from '@tauri-apps/api/http';

const OLLAMA_API_URL = 'http://localhost:11434/api';

export interface Model {
  name: string;
  modified_at: string;
  size: number;
}

export async function getModels(): Promise<Model[]> {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/tags`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Ollama API request failed with status ${response.status}`);
    }
    const data = (await response.data) as { models: Model[] };
    return data.models;
  } catch (error) {
    console.error('Failed to fetch models from Ollama API', error);
    return [];
  }
}

export async function deleteModel(modelName: string): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/delete`, {
      method: 'DELETE',
      body: JSON.stringify({ name: modelName }),
    });
    return response.ok;
  } catch (error) {
    console.error(`Failed to delete model ${modelName}`, error);
    return false;
  }
}

export async function downloadModel(
  modelName: string,
  onProgress: (status: string, total: number, completed: number) => void
): Promise<void> {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/pull`, {
      method: 'POST',
      body: JSON.stringify({ name: modelName, stream: true }),
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      const chunk = decoder.decode(value, { stream: true });

      const jsonChunks = chunk.split('\n').filter(c => c);

      for (const jsonChunk of jsonChunks) {
        try {
          const parsed = JSON.parse(jsonChunk);
          if (parsed.total && parsed.completed) {
            onProgress(parsed.status, parsed.total, parsed.completed);
          } else {
            onProgress(parsed.status, 0, 0);
          }
        } catch (e) {
          console.error('Failed to parse JSON chunk', jsonChunk);
        }
      }
    }
  } catch (error) {
    console.error(`Failed to download model ${modelName}`, error);
  }
}
