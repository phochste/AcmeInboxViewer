<script lang="ts">
    import Target from './Fields/Target.svelte';
    import Subtypes from './Fields/Subtypes.svelte'; 
    import Object from './Fields/Object.svelte';
    import type { ProfileType } from "./util";
    import { 
        generateIdentifier, 
        sendNotification,
        type ActivityType, 
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

    let notificationType;
    let notificationSubType;

    let target : string ;
    let object : ObjectType;

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

        let notification : ActivityType = {
            id: generateIdentifier() ,
            types: type ,
            actor: actorT ,
            target: targetT ,
            object: object
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
            console.error('target error');
            error |= TARGET_ERROR;
        }

        if (notificationType && notificationType.id > 0) {
            error &= ~TYPE_ERROR;
        }
        else {
            console.error('type error');
            error |= TYPE_ERROR;
        }

        if (object) {
            error &= ~OBJECT_ERROR;
        }
        else {
            console.error('object error');
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
            <Target bind:target {profile}/>
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
            <Subtypes bind:notificationType bind:notificationSubType {profile}/>
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
            <Object bind:object {profile}/>
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