<script lang="ts">
    import { 
        type ProfileType ,
        getResourceInfoFromDataset
    } from './util';
    import { fetch } from '@inrupt/solid-client-authn-browser';
    import { getSolidDataset, 
             getContainedResourceUrlAll,
    } from '@inrupt/solid-client';

    export let inbox : string;
    export let profile : ProfileType;

    let inboxResources = loadInbox(inbox);

    async function loadInbox(inbox: string) {
        const dataset = await getSolidDataset(inbox, {
            fetch: fetch
        });

        let resources = [];
        
        let containedResources = getContainedResourceUrlAll(dataset);

        for (let containedResourceUrl of containedResources) { 
            let resourceInfo = getResourceInfoFromDataset(dataset, containedResourceUrl, inbox);
            resources.push(resourceInfo);
        }

        return resources;
    }
</script>
<p><i>{inbox}</i></p>

{#await inboxResources}
<p>...loading...</p>
{:then things}
  <table class="table">
    <thead>
        <th>modified</th>
        <th>resource</th>
    </thead>
    <tbody>
  {#each things as resource}
    <tr>
        <td>{resource.modified}</td>
        <td>{resource.relativePath}</td>
    </tr>
  {/each}
   </tbody>
</table>
{/await}