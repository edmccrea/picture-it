<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { cva, type VariantProps } from "class-variance-authority";

  const button = cva(
    "px-4 py-2 duration-300 ease-in-out rounded-md w-fit text-neutral-50 hover:cursor-pointer",
    {
      variants: {
        intent: {
          primary: "bg-sky-400 hover:bg-sky-600",
          secondary: "bg-transparent border border-sky-500 hover:bg-sky-400/10",
          disabled: "bg-sky-100 hover:cursor-default",
        },
        size: {
          small: "text-sm",
          medium: "text-base",
        },
      },
      compoundVariants: [
        { intent: "primary", size: "medium", class: "primaryMedium" },
      ],
    }
  );

  interface $$Props extends HTMLButtonAttributes, VariantProps<typeof button> {}

  export let intent: $$Props["intent"] = "primary";
  export let size: $$Props["size"] = "medium";
</script>

<button
  {...$$props}
  class={button({ intent, size, class: $$props.class })}
  on:click
>
  <slot />
</button>
