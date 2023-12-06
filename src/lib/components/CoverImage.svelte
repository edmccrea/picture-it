<script lang="ts">
  import { fade } from "svelte/transition";

  export let selectedStyle: App.Style;
</script>

<div class="relative w-[500px] h-[500px]">
  <div class="dot-pattern pattern-one"></div>
  <div class="dot-pattern pattern-two"></div>
  <div
    class="w-[300px] h-[300px] overflow-hidden absolute rounded-md top-0 left-0 shadow-md"
  >
    <img src="/profile.jpeg" alt="" class="w-full h-full object-cover" />
  </div>
  <div
    class="w-[300px] h-[300px] overflow-hidden absolute rounded-md bottom-0 right-0 shadow-md"
  >
    {#key selectedStyle}
      <img
        src={`/cover-images/${selectedStyle}.jpeg`}
        alt=""
        class="w-full h-full object-cover"
        in:fade={{ duration: 100, delay: 100 }}
        out:fade={{ duration: 100 }}
      />
    {/key}
  </div>
</div>

<style>
  .dot-pattern {
    width: 300px;
    height: 300px;
    background-image: radial-gradient(circle, #33333380 1px, transparent 1px);
    background-size: 20px 20px;
    border-radius: 1rem;
    position: absolute;
  }

  .pattern-one {
    bottom: 25%;
    left: 50%;
  }

  .pattern-two {
    top: 45%;
    right: 40%;
  }
</style>
