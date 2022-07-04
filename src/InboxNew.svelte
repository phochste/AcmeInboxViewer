<script lang="ts">
    import Container from './Container.svelte';
    import type { ProfileType } from "./util";

    let error : number ;

    const TARGET_ERROR = 0x01;
    const TYPE_ERROR   = 0x02;
    const OBJECT_ERROR = 0x04;

    export let inbox : string;
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
        { id: 3 , text: 'CertificationAction' } ,   
        { id: 3 , text: 'EndorsementAction' } ,   
        { id: 3 , text: 'RegistrationAction' }    
    ];

    let notificationType;
    let notificationSubType;

    let target : string ;

    let container : string = profile.storage;
    let object : string;

    function sendNotification() : void {
        error = validateFields();

        if (error == 0) {
            newMail = false;
        }
    }

    function validateFields() : number {
        let error;

        if (target && target.match(/^http(s)?:\/\//)) {
            error &= ~TARGET_ERROR;
        }
        else {
            error |= TARGET_ERROR;
        }

        if (notificationType && notificationType.id > 0) {
            error &= ~TYPE_ERROR;
        }
        else {
            error |= TYPE_ERROR;
        }

        if (object) {
            error &= ~OBJECT_ERROR;
        }
        else {
            error |= OBJECT_ERROR;
        }

        return error;
    }

</script>

<button on:click={sendNotification}>Send</button>
<button on:click={ () => newMail = false}>Cancel</button>

<h4>New notification</h4>

<table class="table">
    <tbody>
    <tr>
        <th>Target</th>
        <td>
            <input type="text" size="80" on:change={ (e) => { target = e.target.value}}/>
        </td>
        <td>
            {#if error & TARGET_ERROR}
            <span class="error">Invalid target</span>
            {/if}
        </td>
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
        <td>
            {#if error & TYPE_ERROR}
            <span class="error">Need a type</span>
            {/if}
        </td>
    </tr>
    {#if inReplyTo}
    <tr>
        <th>Reply To</th>
        <td>
            {inReplyTo}
        </td>
        <td></td>
    </tr>
    {/if}
    <tr>
        <th>Object</th>
        <td>
            <input type="text" bind:value={object} size="80" readonly/>
            <Container container={container} bind:selection={object}/>
        </td>
        <td>
            {#if error & OBJECT_ERROR}
            <span class="error">Need an object</span>
            {/if}
        </td>
    </tr>
    </tbody>
</table>

<style>
    .error {
        color: red;
    }
</style>