<script lang="ts">
    import NoteType from "./NoteType.svelte";
    import DocumentType from "./DocumentType.svelte";
    import RelationshipType from "./RelationshipType.svelte";
    import type { ProfileType } from "../util";

    const objectTypes = [
        { id: 1 , text: 'Note' } ,
        { id: 2 , text: 'Document' } ,
        { id: 3 , text: 'Relationship'}
    ]

    export let profile : ProfileType;
    export let objectType : string;
    export let object : any;

    let selected = objectTypes[0];

    function handleObjectType() {
        objectType = selected.text;
    }
</script>

<p>
<select bind:value={selected} on:change={handleObjectType}>
    {#each objectTypes as type}
        <option value={type}>{type.text}</option>
    {/each}
</select>
</p>

{#if selected.text == 'Note'}
    <NoteType bind:object={object}/>
{:else if selected.text == 'Document'}
    <DocumentType resource={profile.storage} bind:object={object}/>
{:else if selected.text == 'Relationship'}
    <RelationshipType resource={profile.storage} bind:object={object}/>
{:else}
    <p>Unknown element {selected.text}</p>
{/if}
