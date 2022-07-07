<script lang="ts">
    import Header from './View/Header.svelte';
    import Body from './View/Body.svelte';

    import type { MessageInfo } from './inbox';
    import { createEventDispatcher } from 'svelte';
    import { inboxDataset, loadInboxItem } from './inbox';
    import type { ProfileType } from './util';

    export let inbox : string;
    export let selected : string;
    export let profile : ProfileType;

    let item : Promise<MessageInfo> = loadSelected();

    const dispatch = createEventDispatcher();

    async function loadSelected() : Promise<MessageInfo> {
        let dataset = await inboxDataset(inbox);
        return loadInboxItem(dataset, selected);
    }

    async function handleReply() : Promise<void> {
        dispatch('reply', await item);
    }

</script>

<button class="btn btn-secondary" on:click={ () => selected = undefined}>&larr;</button>

{#await item}
    <p>...loading...</p>
{:then mail}
    <h4>Message detail: <a href="{mail.resource.url}">{mail.resource.url}</a></h4>

    <button class="btn btn-primary" on:click={handleReply}>Reply</button>

    {#await mail.activity}
        <p>...loading...</p>
    {:then activity}
        <Header resource={mail.resource} {activity} />
        <Body resource={mail.resource} {activity} />
    {/await}
{/await}