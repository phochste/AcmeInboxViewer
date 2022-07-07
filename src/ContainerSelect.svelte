<script lang="ts">
    import AutoComplete from 'simple-svelte-autocomplete';
    import { createEventDispatcher } from 'svelte';
    import { ANY_TYPE, getContainerItem, getContainerList, isDirType, isFileType, type FileInfo } from './container';

    export let resource : string ;
    export let required : boolean = true;
    export let create   : boolean = true;
    export let type     : number  = ANY_TYPE;
    export let selectedResource = getContainerItem(resource);

    const dispatch = createEventDispatcher();

    let text;

    async function searchContainer(keyword: string) {
        let containerList = await getContainerList(selectedResource.url)

        if (type && type != ANY_TYPE) {
            if (isFileType(type)) {
                return containerList.filter( (item) => ! item.isDir);
            }
            else if (isDirType(type)) {
                return containerList.filter( (item) => item.isDir);
            }
            else {
                console.log(`unknown type : ${type}`);
            }
        }
        return containerList;
    }

    function handleCreate() {
        if (text && create && text != selectedResource.url) {
            selectedResource = getContainerItem(text);
        }
    }

    function handleChange() {
        if (selectedResource && selectedResource.url != resource) {
            dispatch('change',selectedResource);
        }
    }
</script>

<AutoComplete 
    searchFunction={searchContainer} 
    bind:selectedItem={selectedResource}
    bind:text={text}
    labelFieldName="url"
    delay=200
    required={required}
    create={create}
    onChange={handleChange}
    onCreate={handleCreate}
    />

<style>
    :global(.autocomplete) {
    	width: 450px;
    }
</style>