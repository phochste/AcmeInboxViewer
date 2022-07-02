<script lang="ts">
    import Container from './Container.svelte';
    import type { ProfileType } from "./util";

    export let newMail: boolean;
    export let profile: ProfileType;
    export let inReplyTo: string;

    let notificationTypes = [
        { id: 0 , text: '--Choose Type--' } ,
        { id: 1 , text: 'Offer' } ,
        { id: 2 , text: 'Accept' } ,   
        { id: 3 , text: 'Reject' } ,   
        { id: 3 , text: 'Undo' } ,   
        { id: 3 , text: 'Announce' }    
    ];

    let notificationSubTypes = [
        { id: 0 , text: '--Choose Subtype--' } ,
        { id: 1 , text: 'ArchivationAction' } ,
        { id: 2 , text: 'AwarenessAction' } ,   
        { id: 3 , text: 'CertifiactionAction' } ,   
        { id: 3 , text: 'EndorsementAction' } ,   
        { id: 3 , text: 'RegistrationAction' }    
    ];

    let notificationType;
    let notificationSubType;

</script>

<button on:click={ () => newMail = false}>Cancel</button>

<h4>New notification</h4>

<table class="table">
    <tbody>
    <tr>
        <th>Actor</th>
        <td> {profile.webId} </td>
    </tr>
    <tr>
        <th>Origin</th>
        <td>Acme InboxViewer</td>
    </tr>
    <tr>
        <th>Type</th>
        <td>
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
        </td>
    </tr>
    {#if inReplyTo}
    <tr>
        <th>Reply To</th>
        <td>
            {inReplyTo}
        </td>
    </tr>
    {/if}
    <tr>
        <th>Object</th>
        <td>
            <Container resource={profile.storage}/>
        </td>
    </tr>
    </tbody>
</table>