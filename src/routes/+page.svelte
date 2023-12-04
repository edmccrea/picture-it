<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import CryptoJS from "crypto-js";

  import { createDownloadUrl } from "$lib/utils/create-download-url";

  let apiKey = "";
  let loading = false;
  let inputImgSrc: string | ArrayBuffer | null;
  let resultImgSrc: string | null;
  let imageRendered = false;
  let downloadUrl = "";
  let fileInput: HTMLInputElement;

  onMount(async () => {
    const res = await fetch("/api/encryption-key");
    const encryptionKey = await res.text();
    const encryptedMessage = localStorage.getItem("encryptedMessage");

    if (encryptedMessage && encryptionKey) {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
      const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);

      if (decryptedMessage) {
        apiKey = decryptedMessage;
      }
    }
  });

  async function setApiKey() {
    const res = await fetch("/api/encryption-key");
    const encryptionKey = await res.text();
    const encryptedMessage = CryptoJS.AES.encrypt(
      apiKey,
      encryptionKey
    ).toString();
    localStorage.setItem("encryptedMessage", encryptedMessage);
  }

  function handleFileChange() {
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target) {
          inputImgSrc = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async function generateImage() {
    if (!apiKey) {
      return;
    }

    if (!inputImgSrc) {
      return;
    }

    loading = true;
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: apiKey, image: inputImgSrc }),
    });

    if (res.ok) {
      const data = await res.json();
      resultImgSrc = `data:image/jpeg;base64,${data[0].b64_json}`;
      const base64 = data[0].b64_json;
      downloadUrl = createDownloadUrl(base64, "image/jpeg");
    } else {
      loading = false;
      alert("Something went wrong");
    }
  }

  function handleLoad() {
    loading = false;
    imageRendered = true;
  }

  function reset() {
    imageRendered = false;
    inputImgSrc = "";
  }
</script>

<div class="min-h-screen w-screen">
  <h1>Let's make your profile more Exciting</h1>
  <form action="" on:submit={generateImage}>
    <input
      type="file"
      accept="img/*"
      bind:this={fileInput}
      on:change={handleFileChange}
    />
    <button type="submit">Submit</button>
  </form>

  <div
    class="w-[512px] max-h-[512px] max-w-[90vw] aspect-square overflow-hidden rounded-md shadow-sm relative"
  >
    <div class={loading ? "skeleton-loader" : "hidden"} />
    {#if resultImgSrc}
      <img
        src={resultImgSrc}
        alt=""
        in:fade={{ duration: 200 }}
        on:load={handleLoad}
        class={loading ? "opacity-0" : "opacity-100"}
      />
    {/if}
    {#if !loading && !imageRendered}
      <img src="/placeholder.png" alt="" />
    {/if}
  </div>

  <div class="absolute bottom-4 right-4">
    <form action="" on:submit={setApiKey}>
      <input
        bind:value={apiKey}
        type="password"
        autocomplete="off"
        placeholder="Enter your API key..."
        class="border rounded-md py-1 px-3"
      />
      <button type="submit">Submit</button>
    </form>
  </div>
</div>

<style>
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
