<script lang="ts">
  import { onMount, tick } from "svelte";
  import { fade } from "svelte/transition";
  import { Circle } from "svelte-loading-spinners";
  import { createDialog, melt } from "@melt-ui/svelte";
  import { ConfettiBurst, random } from "svelte-canvas-confetti";
  import { createDownloadUrl } from "$lib/utils/create-download-url";
  import CoverImage from "$lib/components/CoverImage.svelte";
  import Button from "$lib/components/Button.svelte";
  import Toast from "$lib/components/Toast.svelte";
  import { SSE } from "sse.js";
  import StyleSelect from "$lib/components/StyleSelect.svelte";
  import FileInput from "$lib/components/FileInput.svelte";
  import SettingsModal from "$lib/components/SettingsModal.svelte";

  let loading = false;
  let inputImgSrc: string | ArrayBuffer | null;
  let resultImgSrc: string | null;
  let imageRendered = false;
  let downloadUrl = "";
  let style: App.Style = "lego";
  let filename = "";
  let confettiBurst = false;
  let toastMessage: {
    type: App.ToastType;
    heading: string;
    message: string;
  } | null = null;
  const loadingMessages = [
    "Let's go!",
    "Fetching the pixels...",
    "The AI Goblins are piecing them together...",
    "Sticking them to the canvas...",
    "Almost there...",
    "Just kidding this takes a while...",
    "The pixels are getting tired...",
    "The Goblins are on strike...",
    "The pixels are on strike...",
    "The Goblins are back!",
    "Shipping with UPS...",
    "Stuck in customs...",
    "The Goblins are on strike again...",
    "Bribing the customs officer...",
    "The Goblins are back again!",
    "Are we there yet?...",
    "I've run out of loading messages...",
  ];
  let loadingMessageIndex = 0;
  let settings = {
    apiKey: "",
    hd: false,
    systemPrompt: "",
  };

  const {
    elements: { trigger, portalled, overlay, content, close, title },
    states: { open },
  } = createDialog();

  onMount(async () => {
    const savedSettings = localStorage.getItem("settings");
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (error) {
        toastMessage = {
          type: "error",
          heading: "Error",
          message: "Failed to load settings",
        };
      }
    }
  });

  async function generateImage() {
    if (!settings.apiKey) {
      toastMessage = {
        type: "warn",
        heading: "Oops!",
        message: "Please enter your OpenAI API key first",
      };
      return;
    }

    if (!inputImgSrc) {
      toastMessage = {
        type: "warn",
        heading: "Oops!",
        message: "Please upload an image",
      };
      return;
    }

    loading = true;
    const eventSource = new SSE("/api/generate", {
      headers: {
        "Content-Type": "application/json",
      },
      payload: JSON.stringify({
        key: settings.apiKey,
        image: inputImgSrc,
        style,
        isHD: settings.hd,
        systemPrompt: settings.systemPrompt,
      }),
    });

    eventSource.addEventListener("error", (event: MessageEvent) => {
      handleError(event.data);
    });

    eventSource.addEventListener("message", () => {
      loadingMessageIndex = (loadingMessageIndex + 1) % loadingMessages.length;
    });

    let accumulatedData = "";
    eventSource.addEventListener("image", (event: MessageEvent) => {
      accumulatedData += event.data;
      try {
        const data = JSON.parse(accumulatedData);
        accumulatedData = "";
        resultImgSrc = `data:image/jpeg;base64,${data.data[0].b64_json}`;
        const base64 = data.data[0].b64_json;
        downloadUrl = createDownloadUrl(base64, "image/jpeg");
        loading = false;
        imageRendered = true;
        setTimeout(() => {
          makeConfettiBurst();
        }, 500);
      } catch (error) {
        console.log("error", error);
      }
    });
    eventSource.stream();
  }

  function handleLoad() {
    loading = false;
    imageRendered = true;
    setTimeout(() => {
      makeConfettiBurst();
    }, 500);
  }

  function reset() {
    imageRendered = false;
    inputImgSrc = null;
  }

  function handleError(errorMessage: string) {
    toastMessage = { type: "error", heading: "Error", message: errorMessage };
    loading = false;
    inputImgSrc = null;
    filename = "";
  }

  const makeConfettiBurst = async () => {
    confettiBurst = false;
    await tick();
    confettiBurst = true;
  };

  function showSaveSettingsToast() {
    toastMessage = {
      type: "success",
      heading: "Success",
      message: "Settings saved",
    };
  }
</script>

<div class="min-h-screen sm:h-screen w-screen relative">
  <button
    use:melt={$trigger}
    class="absolute bottom-4 right-4 px-4 py-2 shadow-xl rounded-lg bg-neutral-50"
    >Settings</button
  >
  <div class="grid md:grid-cols-2 gap-0 sm:gap-8 h-full max-w-6xl mx-auto">
    <div class="h-full flex flex-col justify-center p-8">
      <h1 class="text-5xl">
        Transforming Snapshots into Art.<br /><span
          class="font-gradient font-bold">Picture It</span
        >
      </h1>
      <form
        action=""
        on:submit={generateImage}
        class="flex flex-col mt-4 w-full sm:w-72"
      >
        <StyleSelect bind:style {loading} />
        <FileInput bind:inputImgSrc bind:filename />
        <Button
          disabled={!settings.apiKey || !inputImgSrc}
          intent={!settings.apiKey || !inputImgSrc || loading
            ? "disabled"
            : "primary"}
          class="mt-4 w-full"
          type="submit"
          >{#if loading}
            <div class="h-6 flex justify-center items-center">
              <Circle size="16" color="#FFf" unit="px" duration="1s" />
            </div>
          {:else}
            Generate
          {/if}</Button
        >{#if !settings.apiKey}
          <p class="text-xs mt-2 text-center">
            Please enter your API key in the settings
          </p>
        {/if}
        <p></p>
      </form>
      {#if imageRendered}
        <div class="w-full sm:w-72">
          <Button
            intent={loading ? "disabled" : "ghost"}
            class="mt-2 w-full"
            on:click={reset}>Reset</Button
          >
        </div>
      {/if}
    </div>

    <div
      class="h-full mb:12 sm:mb-0 w-full mx-auto flex flex-col items-center justify-center p-8 pb-28 sm:p-0 max-w-[100vw]"
    >
      {#if !loading && !imageRendered}
        <CoverImage selectedStyle={style} />
      {:else}
        <div
          class="w-[512px] max-h-[512px] max-w-[100%] aspect-square overflow-hidden rounded-md shadow-sm relative"
        >
          <div class={loading ? "skeleton-loader" : "hidden"} />
          {#if resultImgSrc && !loading}
            <img
              src={resultImgSrc}
              alt=""
              in:fade={{ duration: 200 }}
              on:load={handleLoad}
              class={loading ? "opacity-0" : "opacity-100"}
            />
            <a
              href={downloadUrl}
              download="image.jpg"
              class="px-2 py-2 bg-white shadow-lg rounded-md absolute top-4 right-4 hover:bg-neutral-100 transition-colors duration-200"
            >
              <img src="arrow-down-tray.svg" alt="" class="w-5 h-5" />
            </a>
          {/if}
        </div>
        {#if loading}
          {#key loadingMessageIndex}
            <p class="text-sm mt-2" in:fade>
              {loadingMessages[loadingMessageIndex]}
            </p>
          {/key}
        {/if}
      {/if}
    </div>
  </div>
</div>

<SettingsModal
  on:save={showSaveSettingsToast}
  bind:settings
  bind:toastMessage
  {portalled}
  {overlay}
  {content}
  {close}
  {title}
  {open}
/>

{#if toastMessage}
  <Toast open bind:toastMessage />
{/if}

{#if confettiBurst}
  <ConfettiBurst
    origin={[
      random((window.innerWidth / 4) * 3, window.innerWidth / 4),
      random((window.innerHeight / 4) * 3, window.innerHeight / 4),
    ]}
  />
{/if}

<style>
  .font-gradient {
    background: linear-gradient(90deg, #38bdf8 0%, #0c4a6e 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .skeleton-loader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      #dcdcdc 0%,
      #c4c4c4 50%,
      #dcdcdc 100%
    );
    background-size: 200% auto;
    animation: skeleton 2.5s linear infinite;
  }

  @keyframes skeleton {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
