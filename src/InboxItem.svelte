<script lang="ts">
    import type { MessageInfo } from './inbox';
    import { prettyThing, prettyUris, prettyName, inboxDataset, loadInboxItem, getActivityFromDataset } from './inbox';

    export let inbox : string;
    export let selected : string;

    let item : Promise<MessageInfo> = loadSelected();

    async function loadSelected() : Promise<MessageInfo> {
        let dataset = await inboxDataset(inbox);
        return  await loadInboxItem(dataset, selected);
    }
</script>

<div class="activebox" on:click={ () => selected = undefined }>&lt;&lt; {inbox}</div>

{#await item}
<p>...loading...</p>
{:then mail}

{#if mail.activity?.types} 
    <h3>{prettyUris(mail.activity.types,"; ")}</h3>
{/if}

<p>
    <b>Actor</b>:
    {#if mail.activity?.actor}
    <a href="{mail.activity.actor.id}">
      {#if mail.activity.actor.name}
      {prettyName(mail.activity.actor.name)}
      {:else}
      {mail.activity.actor.id}
      {/if}
    </a>
      {#if mail.activity.actor.types}
      a <i>{prettyUris(mail.activity.actor.types,";")}</i>
      {/if}
    {:else}
    Unkown
    {/if}
    <b>Date</b>:
    {#if mail.activity?.published}
        {mail.activity.published.toISOString()}
    {:else if mail.resource?.modified}
        {mail.resource.modified.toISOString()}
    {/if}
    <br>
    <b>Target</b>:
    {#if mail.activity?.target}
      <a href="{mail.activity.target.id}">
        {#if mail.activity.target.name}
        {prettyName(mail.activity.target.name)}
        {:else}
        {mail.activity.target.id}
        {/if}
      </a>
      {#if mail.activity.target.types}
      a <i>{prettyUris(mail.activity.target.types,";")}</i>
      {/if}
    {:else}
    Unkown
    {/if}
</p>

{#if mail.activity}
<table class="table">
    <tbody>
    <tr>
        <th>Id</th>
        <td>{mail.activity.id}</td>
    </tr>
    {#if mail.activity.context}
    <tr>
        <th>Context</th>
        <td class="markdown">
            {#if mail.activity.context?.thing}
            {@html prettyThing(mail.activity.context.thing)}
            {:else}
            {mail.activity.context.id}
            {/if}
        </td>
    </tr> 
    {/if}
    {#if mail.activity.object}
    <tr>
        <th>Object</th>
        <td class="markdown">
            {#if mail.activity.object?.thing}
            {@html prettyThing(mail.activity.object.thing)}
            {:else}
            {mail.activity.object.id}
            {/if}
        </td>
    </tr>
    {/if}
    {#if mail.activity.inReplyTo}
    <tr>
        <th>In Reply To</th>
        <td>{mail.activity.inReplyTo}</td>
    </tr> 
    {/if}
    </tbody>    
</table>
{:else}
<table class="table">
    <tbody>
        <td>Unkown type</td>
    </tbody>
</table>
{/if}
{/await}

<style>
    .activebox {
        background-color: #fefefe;
        font-weight: bold;
        margin-bottom: 10px;
    }
</style>