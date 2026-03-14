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
