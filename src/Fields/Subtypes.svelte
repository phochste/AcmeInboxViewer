<script lang="ts">
    import type { ProfileType } from "../util";

    export let notificationType;
    export let notificationSubType;
    export let profile : ProfileType;

    const notificationTypes = [
        { id: 0 , text: '--Choose Type--' } ,
        { id: 1 , text: 'Create'   , url: 'Create' } ,
        { id: 2 , text: 'Update'   , url: 'Update' } ,
        { id: 3 , text: 'Remove'   , url: 'Remove' } ,
        { id: 4 , text: 'Offer'    , url: 'Offer' } ,
        { id: 5 , text: 'Accept'   , url: 'Accept' } ,   
        { id: 6 , text: 'Reject'   , url: 'Reject' } ,   
        { id: 7 , text: 'Undo'     , url: 'Undo' } ,   
        { id: 8 , text: 'Announce' , url: 'Announce' }    
    ];

    const notificationSubTypes = [
        { id: 0 , text: '--Choose Subtype--' } ,
        { id: 1 , text: 'ArchivationAction' ,   url: 'https://example.org/mellon#ArchivationAction'} ,
        { id: 2 , text: 'AwarenessAction'  ,    url: 'https://example.org/mellon#AwarenessAction' },   
        { id: 3 , text: 'CertificationAction' , url: 'https://example.org/mellon#CertificationAction' } ,   
        { id: 4 , text: 'EndorsementAction' ,   url: 'https://example.org/mellon#EndorsementAction' } ,   
        { id: 5 , text: 'RegistrationAction' ,  url: 'https://example.org/mellon#RegistrationAction' } 
    ];

    console.log(notificationType);

    let selectType = notificationTypes[8];
    let selectSubtype = notificationSubTypes[0];

    if (notificationType) {
        selectType = notificationTypes.find( (i) => i.url === notificationType.replace(/.*[#\/]/g,''));
    }
    else {
        notificationType = selectType.url;
    }

    if (notificationSubType) {
        selectSubtype = notificationSubTypes.find( (i) => i.url === notificationSubType);
    }
    else {
        notificationSubType = null;
    }

    function handleSelect(e) {
        if (selectType && selectType.id > 0) {
            notificationType = selectType.url;
        }
        if (selectSubtype && selectSubtype.id > 0) {
            notificationSubType = selectSubtype.url;
        }
    }

</script>

<small><i>Select an activity type.</i></small><br>
<select bind:value={selectType} on:change={handleSelect}>
    {#each notificationTypes as mytype}
        <option value={mytype}>
            {mytype.text}
        </option>
    {/each}
</select>
<select bind:value={selectSubtype} on:change={handleSelect}>
    {#each notificationSubTypes as mytype}
        <option value={mytype}>
            {mytype.text}
        </option>
    {/each}
</select>