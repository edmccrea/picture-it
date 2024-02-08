<script lang="ts">
  import { cva } from "class-variance-authority";
  import { fly } from "svelte/transition";

  const toast = cva(
    "duration-300 ease-in-out rounded-md w-64 text-neutral-50 fixed top-4 right-4 flex overflow-hidden break-words shadow-lg z-[999]",
    {
      variants: {
        intent: {
          info: "bg-sky-400",
          warn: "bg-yellow-400 text-[#333]",
          error: "bg-red-400",
          success: "bg-green-500",
        },
      },
    }
  );

  const bar = cva("w-2", {
    variants: {
      intent: {
        info: "bg-sky-700 w-2",
        warn: "bg-yellow-600 w-2",
        error: "bg-red-700 w-2",
        success: "bg-green-700 w-2",
      },
    },
  });

  export let toastMessage: App.ToastMessage | null = null;

  let intent = toastMessage?.type;

  function close() {
    toastMessage = null;
  }
</script>

{#if toastMessage}
  <div
    {...$$props}
    class={toast({ intent })}
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
          stroke={intent === "warn" ? "#333" : "#fafafa"}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg></button
    >
    <div class={bar({ intent })}></div>
    <div class="pr-8 pl-4 py-4 overflow-hidden">
      {toastMessage.message}
    </div>
  </div>
{/if}
