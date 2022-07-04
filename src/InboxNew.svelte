<script lang="ts">
    import Container from './Container.svelte';
    import type { ProfileType } from "./util";
    import { 
        generateIdentifier, 
        sendNotification,
        objectBuilder,
        type ActivityType , 
        type AgentType,
        type ObjectType
    } from "./inbox";

    let error : number ;

    const TARGET_ERROR = 0x01;
    const TYPE_ERROR   = 0x02;
    const OBJECT_ERROR = 0x04;
    const SEND_ERROR   = 0x08;

    export let inbox : string;
    export let newMail: boolean;
    export let profile: ProfileType;
    export let inReplyTo: string;

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

    let notificationType;
    let notificationSubType;

    let target : string ;

    let container : string = profile.storage;
    let object : string;

    function validateAndSend() : void {
        error = validateFields();

        if (error) {
            return;
        }

        let type : string[] = [];

        if (notificationType && notificationType.id) {
            type.push(notificationType.url);
        }

        if (notificationSubType && notificationSubType.id) {
            type.push(notificationSubType.url);
        }

        let actorT : AgentType = {
            id: profile.webId ,
            name: profile.name ,
            inbox: inbox,
            types: [ 'Person' ]
        };

        let targetT : AgentType = {
            id: generateIdentifier(),
            inbox: target,
            types: [ 'Person' ]
        };

        let objectThing = objectBuilder(object)
                            .addUrl('https://example.org/cite-as','http://brol.com')
                            .addStringNoLocale('https://example.org/brol','ok')
                            .addDecimal('https://example.org/brol',4)
                            .build();

        let objectT : ObjectType = {
            id: object,
            types: [ 'Document'] ,
            thing: objectThing
        };

        let notification : ActivityType = {
            id: generateIdentifier() ,
            types: type ,
            actor: actorT ,
            target: targetT ,
            object: objectT
        };

        let result = sendNotification(inbox, notification);

        if (! result) {
            error |= SEND_ERROR;
        }
        else {
            error &= ~SEND_ERROR;
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

<button class="btn btn-primary" on:click={validateAndSend}>Send</button>
<button class="btn btn-secondary" on:click={ () => newMail = false}>Cancel</button>

<h4>New notification</h4>

{#if error & SEND_ERROR} 
<span class="error">Failed to send notification</span>
{/if}

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