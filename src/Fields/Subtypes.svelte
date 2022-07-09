<script lang="ts">
    import type { ProfileType } from "../util";

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
        { id: 3 , text: 'EndorsementAction' ,   url: 'https://example.org/mellon#EndorsementAction' } ,   
        { id: 3 , text: 'RegistrationAction' ,  url: 'https://example.org/mellon#RegistrationAction' } 
    ];

    export let notificationType = notificationTypes[8];
    export let notificationSubType;
    export let profile : ProfileType;
</script>

<small><i>Select an activity type.</i></small><br>
<select bind:value={notificationType}>
    {#each notificationTypes as mytype}
        <option value={mytype}>
            {mytype.text}
        </option>
    {/each}
</select>
<select bind:value={notificationSubType}>
    {#each notificationSubTypes as mytype}
        <option value={mytype}>
            {mytype.text}
        </option>
    {/each}
</select>