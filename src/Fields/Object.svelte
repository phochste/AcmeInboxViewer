<script lang="ts">
    import { onMount } from 'svelte';
    import AutoComplete from 'simple-svelte-autocomplete';
    import { getContainerList, type FileInfo } from '../container';

    export let object : string;
    export let profile : ProfileType;

    async function searchContainer(keyword: string) {

        let containerList = await getContainerList(object)

        return containerList.map( (item : FileInfo) => { return item.url } );
    }

    onMount( () => {
        object = profile.storage;
    });
</script>

<AutoComplete 
    searchFunction={searchContainer} 
    bind:text={object}
    delay=200
    required={true}
    />
