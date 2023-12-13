<script lang="ts">
  import { fade } from "svelte/transition";

  export let imageState: App.ImageState;
  export let filename: string;

  let isDragging = false;
  let fileInput: HTMLInputElement;

  $: if (fileInput && !imageState.inputImgSrc) {
    fileInput.value = "";
  }

  function handleFileChange(file: File) {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target) {
        imageState.inputImgSrc = event.target.result as string;
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

  function resetFile() {
    imageState.inputImgSrc = null;
    imageState.resultImgSrc = null;
    imageState.imageRendered = false;
    imageState.downloadUrl = "";
    filename = "";
  }
</script>

<label
  for="file-input"
  class="{imageState.inputImgSrc
    ? ''
    : 'hover:cursor-pointer hover:bg-neutral-200/50'} py-4 px-4 border border-neutral-400 rounded-lg shadow-sm mt-4 border-dashed flex flex-col items-center justify-center text-center {isDragging
    ? 'bg-neutral-200/50'
    : ''} transition-all duration-300 ease-in"
  on:dragover={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
>
  {#if imageState.inputImgSrc}
    <img src="/check.svg" alt="" in:fade />
    <span in:fade>Image uploaded</span>
    <span in:fade class="text-xs text-neutral-500">{filename}</span>
  {:else}
    <img src="/cloud-arrow-up.svg" alt="" /><span>Upload an Image</span>
  {/if}
</label>
<input
  disabled={imageState.inputImgSrc ? true : false}
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

{#if imageState.inputImgSrc}
  <button class="text-xs underline pt-1" on:click={resetFile}>Reset file</button
  >
{/if}
