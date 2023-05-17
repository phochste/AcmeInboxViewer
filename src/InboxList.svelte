<script lang="ts">
    import Checkbox from './Fields/Checkbox.svelte';
    import { deleteInboxItem, loadInbox, prettyUris, type MessageInfo, countInbox } from './inbox';
    import { createEventDispatcher } from 'svelte';
    import { watchContainer } from './container';
    import type { InboxListing, ProfileType } from './util';
    import { selectedInboxState, selectedNotificationListState } from './stores';

    const dispatch = createEventDispatcher();

    export let inbox : string;
    export let inboxList : InboxListing[];
    export let socket : WebSocket;
    export let selected : string;
    export let profile : ProfileType;
    export let maxItems : number = 50;

    let inboxCounts: Map<string, number> = new Map(); 
    
    let selectedNotifications: string[] = [];

    let inboxResources : MessageInfo[] = [];
    let checkAll : boolean = false;
    let checkedMail : Set<MessageInfo> = new Set<MessageInfo>();

    selectedNotificationListState.subscribe(value => {
        selectedNotifications = value;
    })
        
    listAll(inbox);
    countInboxes();

    async function countInboxes() {
        for (let inboxListing of inboxList) {
            let { total, unread } = await countInbox(inboxListing.inboxUrl, selectedNotifications)
            console.log("test", inboxCounts[inboxListing.inboxUrl], unread)
            if (inboxCounts[inboxListing.inboxUrl] !== unread) {
                inboxCounts[inboxListing.inboxUrl] = unread
                // Fix for WSS not working
                if (inboxListing.inboxUrl === inbox) refreshInbox();
            }
        }
    }

    setInterval(countInboxes, 10000)

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

    function handleAdd() {
        dispatch('add', {});
    }

    function handleCheck(e,mail) {
        if (e.detail.checked) {
            checkedMail.add(mail);
        }
        else {
            checkedMail.delete(mail);
        }
        checkedMail = new Set(checkedMail);
        console.log(checkedMail)
    }

    function handleDeleteChecked() {
        checkedMail.forEach( (mail) => {
            deleteMail(mail);
        });
        checkedMail = new Set<MessageInfo>();
        checkAll = false;
    }

    function handleSelectAll(e) {
        checkedMail = new Set<MessageInfo>(); 
        if (e.detail.checked) {
            inboxResources.forEach( (mail) => {
                 checkedMail.add(mail);
            });
        }
    }

    /**
     * I dont know how svelte bindings work, but this should be handled by just page-rerendering I think.
     * @param inboxListing
     */
    function selectInbox(inboxListing: InboxListing) {
        selectedInboxState.set(inboxListing);
        inbox = inboxListing.inboxUrl;
        refreshInbox();
    }

    function refreshInbox() {
        console.log(`refreshing inbox for ${inbox}`)
        listAll(inbox)
    }
</script>

<svelte:head>
    <title>Inbox ({inboxResources.length}) - {inbox}</title>
</svelte:head>

<button class="btn btn-primary" on:click={handleNew}>New message</button>
<button class="btn btn-primary" on:click={handleAdd}>Manage inboxes</button>
<hr/>
{#each inboxList as inboxListing}
    {#if inboxListing.inboxUrl === inbox} 
        <button class="btn btn-info" on:click={() => refreshInbox() }>
            🔃 
            {inbox} 
            { inboxCounts[inbox] === undefined ? "Loading" : inboxCounts[inbox] } 
            { inboxCounts[inbox] > 0 ? "❗" : "" } 
        </button>    
    {:else}
        <button class="btn" on:click={() => selectInbox(inboxListing) }>
            {inboxListing.inboxUrl} 
            { inboxCounts[inboxListing.inboxUrl] === undefined ? "Loading" : inboxCounts[inboxListing.inboxUrl] } 
            { inboxCounts[inboxListing.inboxUrl] > 0 ? "❗" : "" } 
        </button>    
    {/if}
{/each}
<hr/>

<h4>Messages</h4>
<div class="list-menu">
     <Checkbox bind:checked={checkAll} on:checked={handleSelectAll}/>
{#if checkedMail.size}
     <button class="delete" on:click={handleDeleteChecked}>🗑</button>
{/if}
</div>
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
        <tr on:click={ () => { selected = mail.resource.url } } class="{selectedNotifications.indexOf(mail.resource.url) === -1 ? '' : 'seen'}" >
            {#if activity}
                <td>
                    <Checkbox 
                        checked={checkedMail.has(mail)}    
                        on:checked={(e) => handleCheck(e,mail)}/>
                </td>
                <td><b>{activity.actor.name ? activity.actor.name : 'Unknown' }</b></td>
                <td>{prettyUris(activity.types,", ")}</td>
                <td>{prettyUris(activity.object.types,", ")}</td>
                <td>{mail.resource.modified.toISOString()}</td>
                <td><button class="delete" on:click|stopPropagation={ () => deleteMail(mail)}>🗑</button></td>
            {:else}
                <td>
                    <Checkbox 
                        checked={checkedMail.has(mail)}    
                        on:checked={(e) => handleCheck(e,mail)}/>
                </td>
                <td><b>Unknown</b></td>
                <td>--</td>
                <td>--</td>
                <td>{mail.resource.modified.toISOString()}</td>
                <td><button class="delete" on:click|stopPropagation={() => deleteMail(mail)}>🗑</button></td>
            {/if}
        </tr>
    {/await}
  {/each}
  {#if inboxResources.length > maxItems}
        <tr on:click={ () => { maxItems += maxItems }}>
            <td colspan="6">
                ...older messages...
            </td>
        </tr>
  {/if}
  </tbody>
  </table>
{:else}
    (no messages available)
{/if}

<style>
    .list-menu {
        margin-left: 7px;
        margin-bottom: 5px;
    }

    button.delete {
        width: 30px;
        height: 30px;
    }

    .seen {
        color: gray;
    }
</style>