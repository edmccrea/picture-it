<script lang="ts">
  import { fly } from "svelte/transition";
  import { createDialog, melt } from "@melt-ui/svelte";

  export let prompt: string;
  const htmlPrompt = prompt.replace(/(?:\r\n|\r|\n)/g, "<br>");

  const {
    elements: { trigger, portalled, overlay, content, close, title },
    states: { open },
  } = createDialog();
</script>

<button
  use:melt={$trigger}
  class="absolute bottom-4 left-4 px-4 py-2 shadow-xl rounded-lg bg-neutral-50"
  >View Prompt</button
>

<div use:melt={$portalled}>
  {#if $open}
    <div use:melt={$overlay} class="fixed inset-0 z-50 bg-black/50" />
    <div
      use:melt={$content}
      class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw]
      max-w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-neutral-50
      px-12 pt-12 pb-16 shadow-lg overflow-scroll"
      in:fly={{ y: 100, duration: 200 }}
    >
      <h2 class="font-bold" use:melt={$title}>
        The prompt used to generate this image
      </h2>
      <p class="text-sm mt-2">{@html htmlPrompt}</p>
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
