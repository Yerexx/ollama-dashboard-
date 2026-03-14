import { writable } from 'svelte/store';
import { getModels, type Model } from './ollama';

export const models = writable<Model[]>([]);
export const selectedModel = writable<string>('');

export async function loadModels() {
  const fetchedModels = await getModels();
  models.set(fetchedModels);
  if (fetchedModels.length > 0) {
    selectedModel.set(fetchedModels[0].name);
  }
}
