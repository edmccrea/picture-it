<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fly, slide } from "svelte/transition";
  import { createDialog, melt } from "@melt-ui/svelte";
  import Button from "./Button.svelte";

  export let settings: {
    hd: boolean;
    apiKey: string;
    systemPrompt: string;
  };
  export let toastMessage: App.ToastMessage | null;

  const {
    elements: { trigger, portalled, overlay, content, close, title },
    states: { open },
  } = createDialog();

  const dispatch = createEventDispatcher();
  let apiKeyInputOpen = false;

  async function saveSettings() {
    localStorage.setItem("settings", JSON.stringify(settings));
    dispatch("save");
  }
  function resetSettings() {
    settings = {
      hd: false,
      apiKey: "",
      systemPrompt: "",
    };
    localStorage.removeItem("settings");

    toastMessage = {
      type: "info",
      heading: "Updated",
      message: "Settings reset",
    };
  }
</script>

<button
  use:melt={$trigger}
  class="absolute bottom-4 right-4 px-4 py-2 shadow-xl rounded-lg bg-neutral-50"
  >Settings</button
>

<div use:melt={$portalled}>
  {#if $open}
    <div use:melt={$overlay} class="fixed inset-0 z-50 bg-black/50" />
    <div
      use:melt={$content}
      class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw]
    max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-neutral-50
    px-12 pt-12 pb-16 shadow-lg"
      in:fly={{ y: 100, duration: 200 }}
    >
      <h2 use:melt={$title} class="mb-2 text-lg">Settings</h2>
      <form action="" on:submit={saveSettings}>
        <div class="flex mb-2 gap-2">
          <input type="checkbox" id="hd" bind:checked={settings.hd} />
          <label for="hd" class="text-sm text-neutral-500">HD</label>
        </div>
        <label for="prompt" class="text-xs text-neutral-500"
          >System Prompt</label
        >
        <textarea
          bind:value={settings.systemPrompt}
          name="prompt"
          id=""
          rows="3"
          class="w-full mt-1 px-4 py-2 text-neutral-500 border border-neutral-400 rounded-lg shadow-inner resize-none active:outline-sky-400/50 focus:outline-sky-400/50 transition-colors duration-200 ease-in"
          placeholder="Enter a system prompt..."
        ></textarea>
        <div
          class="px-4 py-2 bg-neutral-200/30 rounded-lg mt-4 hover:bg-neutral-200/60 transition-all duration-300 ease-in-out"
        >
          <div
            class="flex justify-between hover:cursor-pointer items-center"
            on:click={() => (apiKeyInputOpen = !apiKeyInputOpen)}
            on:keydown={() => (apiKeyInputOpen = !apiKeyInputOpen)}
            role="button"
            tabindex="0"
          >
            <label for="key" class="text-sm text-neutral-700"
              >Open AI API Key</label
            >

            <img
              src="/chevron-down.svg"
              alt="chevron"
              class="{apiKeyInputOpen
                ? '-rotate-180'
                : ''} h-4 transition-all duration-200 ease-in"
            />
          </div>
          {#if apiKeyInputOpen}
            <div transition:slide>
              <input
                name="key"
                type="password"
                placeholder="Enter your OpenAI API key..."
                class="w-full px-4 py-2 my-3 bg-transparent border border-neutral-300 rounded-md shadow-inner focus:outline-none focus:ring focus:ring-sky-100 transition-all duration-300 ease-in-out"
                bind:value={settings.apiKey}
              />
            </div>
          {/if}
        </div>
        <div class="mt-6 flex gap-3">
          <Button type="submit">Save</Button>
          <Button intent="ghost" on:click={resetSettings}>Reset</Button>
        </div>
      </form>
      <button use:melt={$close} class="top-4 right-4 absolute"
        ><svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 18L18 6M6 6L18 18"
            stroke="#000"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg></button
      >
    </div>
  {/if}
</div>
