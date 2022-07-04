<script lang="ts">
    import { deleteInboxItem, loadInbox, prettyUris, type MessageInfo } from './inbox';
    import { watchContainer } from './container';
import { thingAsMarkdown } from '@inrupt/solid-client';

    export let inbox : string;
    export let socket : WebSocket;
    export let selected : string;
    export let newMail : boolean = false;

    let inboxResources = loadInbox(inbox);
    let current : string = "";

    socket = watchContainer(inbox, () => {
        inboxResources = loadInbox(inbox);
    });

    async function deleteMail(mail : MessageInfo) {
        await deleteInboxItem(mail);
    }

</script>

{#await inboxResources}
<p>...loading...</p>
{:then things}
  <button class="btn btn-primary" on:click={ () => newMail = true }>New message</button>
  <hr/>
  Current inbox: <div class="activebox" on:click={ () => loadInbox(inbox) }>{inbox} ({things.length})</div>
  <hr/>
  <h4>Messages</h4>
  {#if things.length}
  <table class="table">
    <thead>
        <th>Actor</th>
        <th>Type</th>
        <th>Object</th>
        <th>Date</th>
        <th></th>
    </thead>
    <tbody>
  {#each things as mail}
    <tr class={ current === mail.resource.url ? 'selected' : ''}
        on:mouseenter={ () => { current = mail.resource.url } }
        on:mouseleave={ () => { current = undefined} }
        on:click={ () => { selected = mail.resource.url } }
        >
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
  {/each}
   </tbody>
   </table>
   {:else}
   (no messages available)
   {/if}
{/await}

<style>
    .selected {
        background-color: #f7f7f7;
    }

    .activebox {
        font-weight: bold;
        margin-bottom: 20px;
    }
</style>