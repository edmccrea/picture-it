<script lang="ts">
  import { onMount, tick } from "svelte";
  import { fade, slide, fly } from "svelte/transition";
  import CryptoJS from "crypto-js";
  import { Circle } from "svelte-loading-spinners";
  import { createDialog, melt } from "@melt-ui/svelte";
  import { ConfettiBurst, random } from "svelte-canvas-confetti";

  import { createDownloadUrl } from "$lib/utils/create-download-url";
  import CoverImage from "$lib/components/CoverImage.svelte";
  import Button from "$lib/components/Button.svelte";
  import Toast from "$lib/components/Toast.svelte";
  import { SSE } from "sse.js";

  let apiKey = "";
  let loading = false;
  let inputImgSrc: string | ArrayBuffer | null;
  let resultImgSrc: string | null;
  let imageRendered = false;
  let downloadUrl = "";
  let fileInput: HTMLInputElement;
  let style: App.Style = "lego";
  let filename = "";
  let apiKeyInputOpen = false;
  let isDragging = false;
  let confettiBurst = false;
  let toastMessage: {
    type: App.ToastType;
    message: string;
  } | null = null;
  const loadingMessages = [
    "Fetching the pixels...",
    "Painting the canvas...",
    "Creating the masterpiece...",
    "Generating the magic...",
  ];
  let loadingMessageIndex = 0;
  let settings = {
    hd: true,
  };

  const {
    elements: { trigger, portalled, overlay, content, close, title },
    states: { open },
  } = createDialog();

  onMount(async () => {
    const res = await fetch("/api/encryption-key");
    const encryptionKey = await res.text();
    const encryptedMessage = localStorage.getItem("encryptedMessage");

    const savedSettings = localStorage.getItem("settings");
    if (savedSettings) {
      settings = JSON.parse(savedSettings);
    }

    if (encryptedMessage && encryptionKey) {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
      const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);

      if (decryptedMessage) {
        apiKey = decryptedMessage;
      }
    }
  });

  async function saveSettings() {
    localStorage.setItem("settings", JSON.stringify(settings));
    if (apiKey) {
      toastMessage = {
        type: "success",
        heading: "Success",
        message: "Settings saved",
      };

      return;
    }
    const res = await fetch("/api/encryption-key");
    const encryptionKey = await res.text();
    const encryptedMessage = CryptoJS.AES.encrypt(
      apiKey,
      encryptionKey
    ).toString();
    localStorage.setItem("encryptedMessage", encryptedMessage);

    toastMessage = {
      type: "success",
      heading: "Success",
      message: "Settings saved",
    };
  }

  function handleFileChange(file: File) {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target) {
        inputImgSrc = event.target.result as string;
        filename = file.name;
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    if (event.dataTransfer) {
      if (event.dataTransfer.items) {
        for (let i = 0; i < event.dataTransfer.items.length; i++) {
          if (event.dataTransfer.items[i].kind === "file") {
            const file: File | null = event.dataTransfer.items[i].getAsFile();
            if (file) {
              handleFileChange(file);
            }
          }
        }
      } else {
        for (let i = 0; i < event.dataTransfer.files.length; i++) {
          handleFileChange(event.dataTransfer.files[i]);
        }
      }
    }
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  async function generateImage() {
    if (!apiKey) {
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
        key: apiKey,
        image: inputImgSrc,
        style,
        isHD: settings.hd,
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
    fileInput.value = "";
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
        <label for="style-select" class="text-sm pb-1">Select a style</label>
        <select
          name=""
          id="style-select"
          bind:value={style}
          class="py-2 pl-4 pr-10 border border-neutral-400 rounded-lg shadow-inner hover:cursor-pointer disabled:cursor-default active:outline-sky-400/50 focus:outline-sky-400/50 transition-colors duration-200 ease-in"
          disabled={loading}
        >
          <option value="lego">Lego</option>
          <option value="2d-cartoon">2D Cartoon</option>
          <option value="pixar">Disney Pixar</option>
          <option value="anime">Anime</option>
          <option value="old-school-anime">Old School Anime</option>
          <option value="monster">Monster</option>
          <option value="comic-book-hero">Comic Book Hero</option>
          <option value="comic-book-villain">Comic Book Villain</option>
          <option value="abstract">Abstract</option>
          <option value="watercolor">Watercolor</option>
          <option value="oil-painting">Oil Painting</option>
        </select>
        <label
          for="file-input"
          class="{inputImgSrc
            ? ''
            : 'hover:cursor-pointer hover:bg-neutral-200/50'} py-4 px-4 border border-neutral-400 rounded-lg shadow-sm mt-4 border-dashed flex flex-col items-center justify-center text-center {isDragging
            ? 'bg-neutral-200/50'
            : ''} transition-all duration-300 ease-in"
          on:dragover={handleDragEnter}
          on:dragleave={handleDragLeave}
          on:drop={handleDrop}
        >
          {#if inputImgSrc}
            <img src="/check.svg" alt="" in:fade />
            <span in:fade>Image uploaded</span>
            <span in:fade class="text-xs text-neutral-500">{filename}</span>
          {:else}
            <img src="/cloud-arrow-up.svg" alt="" /><span>Input an Image</span>
          {/if}
        </label>
        <input
          disabled={inputImgSrc ? true : false}
          id="file-input"
          type="file"
          accept=".jpg, .jpeg, .png"
          bind:this={fileInput}
          on:change={() => {
            if (fileInput.files && fileInput.files.length > 0) {
              handleFileChange(fileInput.files[0]);
            }
          }}
          class="hidden"
        />
        <Button
          disabled={!apiKey || !inputImgSrc}
          intent={!apiKey || !inputImgSrc || loading ? "disabled" : "primary"}
          class="mt-4 w-full"
          type="submit"
          >{#if loading}
            <div class="h-6 flex justify-center items-center">
              <Circle size="16" color="#FFf" unit="px" duration="1s" />
            </div>
          {:else}
            Generate
          {/if}</Button
        >
      </form>
      {#if imageRendered}
        <div class="w-full sm:w-72">
          <Button
            intent={loading ? "disabled" : "secondary"}
            class="mt-2 w-full"
            on:click={reset}>Reset</Button
          >
        </div>
      {/if}
    </div>

    <div
      class="h-full mb:12 sm:mb-0 w-full mx-auto flex flex-col items-center justify-center p-8 pb-28 sm:p-0"
    >
      {#if !loading && !imageRendered}
        <CoverImage selectedStyle={style} />
      {:else}
        <div
          class="w-[512px] max-h-[512px] max-w-[90vw] aspect-square overflow-hidden rounded-md shadow-sm relative"
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
      <div class="flex mb-2 gap-2">
        <input type="checkbox" id="hd" bind:checked={settings.hd} />
        <label for="hd" class="text-sm text-neutral-500">HD</label>
      </div>
      <form action="" on:submit={saveSettings}>
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
                class="w-full px-4 py-2 my-3 bg-transparent border border-neutral-300 rounded-md shadow-inner focus:outline-none focus:ring focus:ring-sky-100 transition-all duration-300 ease-in-out"
                bind:value={apiKey}
              />
            </div>
          {/if}
        </div>
        <Button type="submit" class="mt-4">Save</Button>
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

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("/chevron-down.svg");
    background-repeat: no-repeat;
    background-position: calc(100% - 1rem) center;
    background-size: 1em;
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
