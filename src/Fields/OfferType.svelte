<script lang="ts">
    import { prettyThing, prettyUris, type ObjectType} from "../inbox";

    export let object : ObjectType;
</script>

{#if object}
    {@html prettyThing(object.thing)}
{:else}
    An Offer can only be created from a reply.
{/if}