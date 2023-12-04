<script lang="ts">
  import { createDialog, melt } from "@melt-ui/svelte";
  import { fly, slide } from "svelte/transition";

  import type { Action } from "svelte/action";
  export let action: Action;

  const {
    elements: { trigger, portalled, overlay, content, close, title },
    states: { open },
  } = createDialog();
</script>

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
      <h2 use:melt={$title} class="mb-2">Settings</h2>
      <div class="flex flex-col mb-2">
        <label for="style" class="text-sm text-neutral-500">Style</label>
        <select
          name="style"
          id=""
          bind:value={style}
          class="px-4 py-2 mt-1 bg-transparent border border-neutral-300 rounded-md shadow-inner focus:outline-none focus:ring focus:ring-sky-100 transition-all duration-300 ease-in-out"
        >
          <option value="vivid">Vivid</option>
          <option value="natural">Natural</option>
        </select>
      </div>
      <form action="" on:submit={setApiKey}>
        <div class="px-4 py-2 bg-neutral-200/50 rounded-lg mt-4">
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
              alt=""
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
                class="w-full px-4 py-2 mt-3 bg-transparent border border-neutral-500 rounded-md shadow-inner focus:outline-none focus:ring focus:ring-sky-100 transition-all duration-300 ease-in-out"
                bind:value={apiKey}
              />
              <button class="underline mt-2" type="submit">Submit</button>
            </div>
          {/if}
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
