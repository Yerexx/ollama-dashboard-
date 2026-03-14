<script lang="ts">
  import { theme, toggleTheme } from "svelte-themes";
  import Button from "$lib/components/ui/button/button.svelte";
  import Sun from "lucide-svelte/icons/sun";
  import Moon from "lucide-svelte/icons/moon";
</script>

<Button on:click={() => toggleTheme()} variant="ghost" size="icon">
  {#if $theme === "light"}
    <Sun class="h-[1.2rem] w-[1.2rem]" />
  {:else}
    <Moon class="h-[1.2rem] w-[1.2rem]" />
  {/if}
</Button>