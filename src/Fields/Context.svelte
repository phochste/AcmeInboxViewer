<script lang="ts">
    import { objectBuilder , type ObjectType} from "../inbox";
    import { AS, RDF } from '@inrupt/vocab-common-rdf';

    export let context : ObjectType;

    let value : string = context?.id;

    function handleChange() {
        let contextThing = objectBuilder(value)
                            .addUrl(RDF.type,AS.Document)
                            .build();
        context = {
            id : value,
            types : [ "Document" ],
            thing : contextThing 
        };
    }
</script>

<small><i>Optional, an external resource that is the focus of your message.</i></small><br>
<input type="text" bind:value={value} on:change={handleChange}/>

<style>
    input {
        width: 450px;
    }
</style>