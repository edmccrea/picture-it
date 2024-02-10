<script lang="ts">
  import { cva } from "class-variance-authority";
  import { fly } from "svelte/transition";

  const bar = cva("w-2", {
    variants: {
      intent: {
        info: "bg-sky-500 w-2",
        warn: "bg-yellow-500 w-2",
        error: "bg-red-500 w-2",
        success: "bg-green-500 w-2",
      },
    },
  });

  export let toastMessage: App.ToastMessage | null = null;

  $: toastMessage,
    setTimeout(() => {
      toastMessage = null;
    }, 4000);

  let intent = toastMessage?.type;

  function close() {
    toastMessage = null;
  }
</script>

{#if toastMessage}
  <div
    {...$$props}
    class="duration-300 ease-in-out text-[#333] rounded-md w-64 fixed top-4 right-4 flex overflow-hidden break-words shadow-lg z-[99] bg-neutral-50"
    in:fly|global={{ x: 200 }}
    out:fly|global={{ x: 200 }}
  >
    <button class="top-3 right-3 absolute" on:click={close}
      ><svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 18L18 6M6 6L18 18"
          stroke="#333"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg></button
    >
    <div class={bar({ intent })}></div>
    <div class="pr-8 pl-4 py-4 overflow-hidden">
      <p>{toastMessage.heading}</p>
      <p class="text-sm opacity-80">{toastMessage.message}</p>
    </div>
  </div>
{/if}
