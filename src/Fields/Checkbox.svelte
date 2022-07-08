<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let checked : boolean = false;

    const dispatch = createEventDispatcher();

    function clicked() {
        checked = ! checked;
        dispatch('checked', { checked: checked});
    }
</script>

<button on:click|stopPropagation={clicked}>
{#if checked}✓{:else}&nbsp;{/if}
</button>

<style>
    button {
        width: 30px;
        height: 30px;
    }
</style>