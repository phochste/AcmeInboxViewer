<script lang="ts">
    import { prettyPrintJson } from 'pretty-print-json';
    import { getSource, type ActivityType, type ResourceInfo, type SourceType } from "../inbox";
    import { Modals, openModal, closeModal, modals } from 'svelte-modals'
    import Modal from "./Modal.svelte";
    import { prettyUris , prettyName } from "../inbox";

    export let resource : ResourceInfo;
    export let activity : ActivityType;

    function escapeHTML(str){
        return new Option(str).innerHTML;
    }

	async function handleOpen() {
        let content : SourceType = await getSource(resource.url);
        let message;

        console.log(content)
        
        try {
            if (content.isJson) {
                message = '<pre>' + JSON.stringify(
                    JSON.parse(content.text),
                    undefined,4
                ) + '</pre>';
            }
            else {
                message = '<pre>' + escapeHTML(content.text) + '</pre>';
            }
        }
        catch (e) {
            console.error(`failed to parse source %O`, e);
            message = '<pre>' + escapeHTML(content.text) + '</pre>';
        }

        if (message) {
            openModal(Modal, { 
                title: `Source`, 
                message: message
            });
        }
	}

</script>

{#if activity && activity.types}
    <h2>{prettyUris(activity.types)}</h2>
{/if}
<p>
    <b>Actor</b>:
    {#if activity?.actor}
        <a href="{activity.actor.id}">
        {#if activity.actor.name}
            {prettyName(activity.actor.name)}
        {:else}
            {activity.actor.id}
        {/if}
        </a>
        {#if activity.actor.types}
            a <i>{prettyUris(activity.actor.types,";")}</i>
        {/if}
    {:else}
        Unkown
    {/if}

    <b>Date</b>:
    {#if activity?.published}
        {activity.published.toISOString()}
    {:else if resource?.modified}
        {resource.modified.toISOString()}
    {/if}
    <br>
    
    <b>Target</b>:
    {#if activity?.target}
        <a href="{activity.target.id}">
            {#if activity.target.name}
                {prettyName(activity.target.name)}
            {:else}
                {activity.target.id}
            {/if}
        </a>
        {#if activity.target.types}
            a <i>{prettyUris(activity.target.types,";")}</i>
        {/if}
    {:else}
        Unkown
    {/if}

    <br/>
    <a href="/" on:click|preventDefault={handleOpen}>View Source</a>
</p>

<Modals>
    <div
      slot="backdrop"
      class="backdrop"
      on:click={closeModal}
    />
</Modals>

<style>
    .backdrop {
      position: fixed;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      background: rgba(0,0,0,0.50)
    }
  </style>