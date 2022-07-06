<script lang="ts">
    // https://github.com/pstanoev/simple-svelte-autocomplete
    import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
    import { getAllKnownInboxes, type InboxLookupType } from '../inbox';
    import AutoComplete from 'simple-svelte-autocomplete';
    import { onMount } from 'svelte';
    export let target : string;

    let knownInboxes : InboxLookupType[]; 

    async function loadInboxes() {
        let webId   = getDefaultSession().info.webId;
        knownInboxes = await getAllKnownInboxes(webId);
    }

    async function searchInbox(keyword: string) {
        if (knownInboxes) {
            return knownInboxes;
        }
        else {
            return [];
        }
    }

    onMount( () => {
       loadInboxes();
    });
</script>

<AutoComplete 
    searchFunction={searchInbox} 
    labelFieldName="webid" 
    valueFieldName="webid" 
    bind:text={target}
    delay=200
    required={true}
    />


