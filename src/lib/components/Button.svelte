<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { cva, type VariantProps } from "class-variance-authority";

  const button = cva("px-4 py-2 duration-300 ease-in-out rounded-md w-fit", {
    variants: {
      intent: {
        primary: "bg-sky-400 hover:bg-sky-600 text-neutral-50",
        secondary: "bg-sky-900 border hover:bg-sky-900/70 text-neutral-50",
        disabled:
          "bg-sky-100 hover:cursor-default text-neutral-50 pointer-events-none",
        ghost: "bg-transparent  hover:bg-sky-100 text-neutral-500",
      },
      size: {
        small: "text-sm",
        medium: "text-base",
      },
    },
    compoundVariants: [
      { intent: "primary", size: "medium", class: "primaryMedium" },
    ],
  });

  interface $$Props extends HTMLButtonAttributes, VariantProps<typeof button> {}

  export let intent: $$Props["intent"] = "primary";
  export let size: $$Props["size"] = "medium";
  export let type: $$Props["type"] = "button";
</script>

<button
  {...$$props}
  class={button({ intent, size, class: $$props.class })}
  on:click
  {type}
>
  <slot />
</button>
