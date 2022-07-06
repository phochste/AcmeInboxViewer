<script lang="ts">
    export let target : string;
</script>

<input type="text" size="80" on:change={ (e) => { target = e.target.value}}/>