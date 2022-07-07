<script lang="ts">
    import type { ActivityType, ResourceInfo } from "../inbox";
    import { prettyUris , prettyName } from "../inbox";

    export let resource : ResourceInfo;
    export let activity : ActivityType;
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
</p>