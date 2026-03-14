import { writable, derived } from 'svelte/store';
import { getModels, type Model } from './ollama';
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { homeDir } from '@tauri-apps/api/path';

export const models = writable<Model[]>([]);
export const selectedModel = writable<string>('');
export const systemPrompt = writable<string>('');
export const memory = writable<string>('');

export const fullSystemPrompt = derived(
  [systemPrompt, memory],
  ([$systemPrompt, $memory]) => {
    return `You are a helpful AI assistant.

${$systemPrompt}

This is your memory. You can use it to store information that you want to remember for future conversations.

[MEMORY]
${$memory}
[/MEMORY]

You can write to your memory by using the [WRITE_TO_MEMORY: "The new memory to write."] command.`;
  }
);

export async function loadModels() {
  const fetchedModels = await getModels();
  models.set(fetchedModels);
  if (fetchedModels.length > 0) {
    selectedModel.set(fetchedModels[0].name);
  }
}

export async function loadMemory() {
  const home = await homeDir();
  const memoryPath = `${home}Documents/idk just yet/Existance/Memory.md`;
  try {
    const memoryContent = await readTextFile(memoryPath);
    memory.set(memoryContent);
  } catch (error) {
    console.error('Failed to read memory file', error);
  }
}
