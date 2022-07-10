<script lang="ts">
    import NoteType from "./NoteType.svelte";
    import DocumentType from "./DocumentType.svelte";
    import RelationshipType from "./RelationshipType.svelte";
    import OfferType from "./OfferType.svelte";
    import type { ProfileType } from "../util";
    import type { ObjectType } from "../inbox";
    import { AS } from '@inrupt/vocab-common-rdf';

    export let profile : ProfileType;
    export let object : ObjectType;

    let objectTypes;

    if (object && object.types.includes(AS.Offer)) {
        objectTypes = [
            { id: 0 , text: 'Offer' } 
        ];

    }
    else {
        objectTypes = [
            { id: 0 , text: 'Note' } ,
            { id: 1 , text: 'Document' } ,
            { id: 2 , text: 'Relationship' } 
        ];
    }

    let selected = objectTypes[0];
</script>

<p>
<select bind:value={selected}>
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
{:else if selected.text == 'Offer'}
    <OfferType bind:object={object}/>
{:else}
    <p>Unknown element {selected.text}</p>
{/if}
