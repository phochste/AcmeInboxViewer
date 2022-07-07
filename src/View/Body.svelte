<script lang="ts">
    import type { ActivityType, ResourceInfo } from "../inbox";
    import { prettyThing } from "../inbox";

    export let resource : ResourceInfo;
    export let activity : ActivityType;
</script>

{#if activity}
<table class="table">
    <tbody>
    <tr>
        <th>Id</th>
        <td>{activity.id}</td>
    </tr>
    {#if activity.context}
    <tr>
        <th>Context</th>
        <td class="markdown">
            {#if activity.context?.thing}
            {@html prettyThing(activity.context.thing)}
            {:else}
            <a href="{activity.context.id}">{activity.context.id}</a>
            {/if}
        </td>
    </tr> 
    {/if}
    {#if activity.object}
    <tr>
        <th>Object</th>
        <td class="markdown">
            {#if activity.object?.thing}
            {@html prettyThing(activity.object.thing)}
            {:else}
            <a href="{activity.object.id}">{activity.object.id}</a>
            {/if}
        </td>
    </tr>
    {/if}
    {#if activity.inReplyTo}
    <tr>
        <th>In Reply To</th>
        <td>{activity.inReplyTo}</td>
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