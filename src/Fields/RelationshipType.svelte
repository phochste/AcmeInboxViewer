<script lang="ts">
    import ContainerSelect from "../ContainerSelect.svelte";
    import { v4 as uuidv4 } from 'uuid';
    import { generateIdentifier, objectBuilder, type ObjectType } from "../inbox";
    import { AS, RDF } from '@inrupt/vocab-common-rdf';

    export let resource : string;
    export let object : ObjectType;

    const relationshipTypes = [
        { id: 1 , text: 'http://purl.org/dc/terms/alternative' } ,
        { id: 2 , text: 'http://purl.org/dc/terms/hasPart'} ,
        { id: 3 , text: 'http://purl.org/dc/terms/hasVersion'} ,
        { id: 4 , text: 'http://purl.org/dc/terms/isFormatOf'} ,
        { id: 5 , text: 'http://purl.org/dc/terms/isPartOf'} ,
        { id: 6 , text: 'http://purl.org/dc/terms/isReferencedBy'} ,
        { id: 7 , text: 'http://purl.org/dc/terms/isReplacedBy'} ,
        { id: 8 , text: 'http://purl.org/dc/terms/isVersionOf'} ,
        { id: 9 , text: 'http://purl.org/dc/terms/references'} ,
        { id: 10 , text: 'http://purl.org/dc/terms/replaces'} ,
        { id: 11 , text: 'http://purl.org/dc/terms/replaces'} ,
        { id: 12 , text: 'http://purl.org/dc/terms/replaces'}
    ];

    let selected = relationshipTypes[0];

    let mainSubject;
    let mainRelationship = relationshipTypes[0].text;
    let mainObject;

    $: if (mainSubject && mainRelationship && mainObject) {
        let id = generateIdentifier();
        let objectThing = objectBuilder(id)
                            .addUrl(RDF.type,AS.Relationship)
                            .addUrl(AS.subject,mainSubject.url)
                            .addUrl(AS.relationship,mainRelationship)
                            .addUrl(AS.object,mainObject.url)
                            .build();
        object = {
            id: uuidv4(),
            types: [ "Relationship" ] ,
            thing: objectThing
        };
    }
    function handleRelationshipType() {
        mainRelationship = selected.text;
    }

</script>

<table class="table">
    <tbody>
        <tr>
            <th>Subject</th>
            <td>
                <ContainerSelect {resource} bind:selectedResource={mainSubject}/>
            </td>
        </tr>
        <tr>
            <th>Relationship</th>
            <td>
                <select bind:value={selected} on:change={handleRelationshipType}>
                    {#each relationshipTypes as type}
                        <option value={type}>{type.text}</option>
                    {/each}
                </select>
            </td>
        </tr>
        <tr>
            <th>Object</th>
            <td>
                <ContainerSelect {resource} bind:selectedResource={mainObject}/>
            </td>
        </tr>
    </tbody>
</table>