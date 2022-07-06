<script lang="ts">
    import { deleteInboxItem, loadInbox, prettyUris, type MessageInfo } from './inbox';
    import { watchContainer } from './container';

    export let inbox : string;
    export let socket : WebSocket;
    export let selected : string;
    export let newMail : boolean = false;

    let inboxResources : Promise<MessageInfo>[] = [];
        
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

</script>

<svelte:head>
    <title>Inbox ({inboxResources.length}) - {inbox}</title>
</svelte:head>

<button  class="btn btn-primary" on:click={ () => newMail = true }>New message</button>
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
  {#each inboxResources as promise}
    {#await promise}
    <!-- deliberately empty -->
    {:then mail}
    <tr on:click={ () => { selected = mail.resource.url } } >
        {#if mail.activity}
            <td><b>{mail.activity.actor.name ? mail.activity.actor.name : 'Unknown' }</b></td>
            <td>{prettyUris(mail.activity.types,", ")}</td>
            <td>{prettyUris(mail.activity.object.types,", ")}</td>
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
  </tbody>
  </table>
  {:else}
  (no messages available)
  {/if}