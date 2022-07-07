<script lang="ts">
    import type { FileInfo } from "../container";
    import ContainerSelect from "../ContainerSelect.svelte";
    import { objectBuilder, type ObjectType } from "../inbox";
    import { AS, RDF } from '@inrupt/vocab-common-rdf';

    export let resource : string ;
    export let object : ObjectType;

    let mainDocument : FileInfo;

    $: if (mainDocument) {
        let objectThing = objectBuilder(mainDocument.url)
                            .addUrl(RDF.type,AS.Document)
                            .build();
        object = {
            id : mainDocument.url,
            types : [ "Document" ],
            thing : objectThing
        };
    }
</script>

<small><i>Select a local resource.</i></small><br>
<ContainerSelect {resource} bind:selectedResource={mainDocument}/>