<script lang="ts">
    // https://github.com/pstanoev/simple-svelte-autocomplete
    import { getAllKnownInboxes, type InboxLookupType } from '../inbox';
    import AutoComplete from 'simple-svelte-autocomplete';
    import { onMount } from 'svelte';
    import type { ProfileType } from '../util';

    export let profile : ProfileType;
    export let target : string;

    let knownInboxes : InboxLookupType[]; 
    let text;

    async function loadInboxes() {
        knownInboxes = await getAllKnownInboxes(profile.webId);
    }

    async function searchInbox(keyword: string) {
        if (knownInboxes) {
            return knownInboxes;
        }
        else {
            return [];
        }
    }

    function handleChange(inbox: InboxLookupType) {
        if (! inbox) {
            text = target;
        }
        else {
            target = text;
        }
    }

    onMount( () => {
       loadInboxes();
    });
</script>

<small><i>The intended receiver of messages.</i></small><br>
<AutoComplete 
    searchFunction={searchInbox} 
    labelFieldName="webid" 
    valueFieldName="webid" 
    bind:text={text}
    create={true}
    delay=200
    required={true}
    onChange={handleChange}
    />

<style>
    :global(.autocomplete) {
        width: 450px;
    }
</style>

