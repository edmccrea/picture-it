<script lang="ts">
  export let style: string;
  export let loading: boolean;
</script>

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
  <option value="simpsons">Simpsons</option>
  <option value="south-park">South Park</option>
  <option value="sock-puppet">Sock Puppet</option>
  <option value="claymation">Claymation</option>
  <option value="monster">Monster</option>
  <option value="comic-book-hero">Comic Book Hero</option>
  <option value="comic-book-villain">Comic Book Villain</option>
  <option value="abstract">Abstract</option>
  <option value="watercolor">Watercolor</option>
  <option value="oil-painting">Oil Painting</option>
</select>

<style>
  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("/chevron-down.svg");
    background-repeat: no-repeat;
    background-position: calc(100% - 1rem) center;
    background-size: 1em;
  }
</style>
