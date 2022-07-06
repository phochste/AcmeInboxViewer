<script lang="ts">
    import type { ProfileType } from "../util";

    export let notificationType;
    export let notificationSubType;
    export let profile : ProfileType;

    let notificationTypes = [
        { id: 0 , text: '--Choose Type--' } ,
        { id: 1 , text: 'Offer'    , url: 'Offer' } ,
        { id: 2 , text: 'Accept'   , url: 'Accept' } ,   
        { id: 3 , text: 'Reject'   , url: 'Reject' } ,   
        { id: 3 , text: 'Undo'     , url: 'Undo' } ,   
        { id: 3 , text: 'Announce' , url: 'Announce' }    
    ];

    let notificationSubTypes = [
        { id: 0 , text: '--Choose Subtype--' } ,
        { id: 1 , text: 'ArchivationAction' ,   url: 'https://example.org/mellon#ArchivationAction'} ,
        { id: 2 , text: 'AwarenessAction'  ,    url: 'https://example.org/mellon#AwarenessAction' },   
        { id: 3 , text: 'CertificationAction' , url: 'https://example.org/mellon#CertificationAction' } ,   
        { id: 3 , text: 'EndorsementAction' ,   url: 'https://example.org/mellon#EndorsementAction' } ,   
        { id: 3 , text: 'RegistrationAction' ,  url: 'https://example.org/mellon#RegistrationAction' } 
    ];
</script>

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