<script lang="ts">
    import { generateIdentifier, objectBuilder, type ObjectType } from "../inbox";
    import { AS, RDF } from '@inrupt/vocab-common-rdf';
    import { getDefaultSession } from "@inrupt/solid-client-authn-browser";

    export let object : ObjectType;

    let mainContent : string;

    $: if (mainContent) {
        let id = generateIdentifier();
        let objectThing = objectBuilder(id)
                            .addUrl(RDF.type,AS.Note)
                            .addUrl(AS.attributedTo, getDefaultSession().info.webId)
                            .addStringNoLocale(AS.content,mainContent)
                            .build();
        object = {
            id : id,
            types : [ "Note" ],
            thing : objectThing
        };
    }
</script>

<textarea bind:value={mainContent}></textarea>

<style>
    textarea { width: 100% ; height: 200px}
</style>