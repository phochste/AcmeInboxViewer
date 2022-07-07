<script lang="ts">
    import { deleteInboxItem, loadInbox, prettyUris, type MessageInfo } from './inbox';
    import { createEventDispatcher } from 'svelte';
    import { watchContainer } from './container';
    import type { ProfileType } from './util';

    const dispatch = createEventDispatcher();

    export let inbox : string;
    export let socket : WebSocket;
    export let selected : string;
    export let profile : ProfileType;
    export let maxItems : number = 50;

    let inboxResources : MessageInfo[] = [];
        
    listAll(inbox);

    socket = watchContainer(inbox, async () => {
        inboxResources = await loadInbox(inbox);
    });

    async function listAll(inbox) : Promise<void> {
        inboxResources = await loadInbox(inbox);
        return;
    }

    async function deleteMail(mail : MessageInfo) {
        await deleteInboxItem(mail);
    }

    function handleNew() {
        dispatch('new', {});
    }
</script>

<svelte:head>
    <title>Inbox ({inboxResources.length}) - {inbox}</title>
</svelte:head>

<button  class="btn btn-primary" on:click={handleNew}>New message</button>
<hr/>
<button class="btn btn-info" on:click={() => listAll(inbox) }>🔃 {inbox} ({inboxResources.length})</button>
<hr/>

<h4>Messages</h4>
{#if inboxResources.length}
<table class="table table-hover">
    <thead>
        <th>Actor</th>
        <th>Type</th>
        <th>Object</th>
        <th>Date</th>
        <th></th>
    </thead>
    <tbody>
  {#each inboxResources.slice(0,maxItems) as mail}
    {#await mail.activity}
       <!-- deliberately left empty--> 
    {:then activity} 
        <tr on:click={ () => { selected = mail.resource.url } } >
            {#if activity}
                <td><b>{activity.actor.name ? activity.actor.name : 'Unknown' }</b></td>
                <td>{prettyUris(activity.types,", ")}</td>
                <td>{prettyUris(activity.object.types,", ")}</td>
                <td>{mail.resource.modified.toISOString()}</td>
                <td><button on:click|stopPropagation={ () => deleteMail(mail)}>🗑</button></td>
            {:else}
                <td><b>Unknown</b></td>
                <td>--</td>
                <td>--</td>
                <td>{mail.resource.modified.toISOString()}</td>
                <td><button on:click|stopPropagation={() => deleteMail(mail)}>🗑</button></td>
            {/if}
        </tr>
    {/await}
  {/each}
  {#if inboxResources.length > maxItems}
        <tr on:click={ () => { maxItems += maxItems }}>
            <td colspan="5">
                ...older messages...
            </td>
        </tr>
  {/if}
  </tbody>
  </table>
  {:else}
    (no messages available)
  {/if}