<script lang="ts">
    import Target from './Fields/Target.svelte';
    import Subtypes from './Fields/Subtypes.svelte'; 
    import Object from './Fields/Object.svelte';
    import Context from './Fields/Context.svelte';
    import Origin from './Fields/Origin.svelte';
    import type { ProfileType } from "./util";
    import { 
        generateIdentifier, 
        sendNotification,
        type ActivityType, 
        type AgentType,
        type ObjectType
    } from "./inbox";
    import { AS } from '@inrupt/vocab-common-rdf';
    import { createEventDispatcher } from 'svelte';

    let error : number ;

    const TARGET_ERROR = 0x01;
    const TYPE_ERROR   = 0x02;
    const OBJECT_ERROR = 0x04;
    const SEND_ERROR   = 0x08;

    export let inbox : string;
    export let profile: ProfileType;
    export let inReplyTo: string;
    export let originT : AgentType;
    export let target : string ;
    export let targetT : AgentType;
    export let context : ObjectType;
    export let object : ObjectType;

    let notificationType;
    let notificationSubType;

    if (object && object.types.includes(AS.Offer)) {
        notificationType = AS.Accept;
    }

    const dispatch = createEventDispatcher();

    async function validateAndSend() : Promise<void> {
        error = validateFields();

        if (error) {
            return;
        }

        let type : string[] = [];

        if (notificationType) {
            type.push(notificationType);
        }

        if (notificationSubType) {
            type.push(notificationSubType);
        }

        let actorT : AgentType = {
            id: profile.webId ,
            name: profile.name ,
            inbox: inbox,
            types: [ 'Person' ]
        };

        let inReplyTo : string = context ? context.id : null;

        let notification : ActivityType = {
            id: generateIdentifier() ,
            types: type ,
            actor: actorT ,
            origin: originT ,
            target: targetT ,
            context: context ,
            inReplyTo: inReplyTo ,
            object: object
        };

        let result = await sendNotification(targetT.inbox, notification);

        if (! result) {
            error |= SEND_ERROR;
        }
        else {
            error &= ~SEND_ERROR;
            targetT = null;
            originT = null;
            dispatch('send',notification);
        }
    }

    function validateFields() : number {
        let error : number;

        if (targetT) {
            error &= ~TARGET_ERROR;
        }
        else {
            console.error('target error');
            error |= TARGET_ERROR;
        }

        if (notificationType) {
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

    function handleCancel() {
        targetT = null;
        originT = null;
        dispatch('cancel',{});
    }
    
</script>

<button class="btn btn-success" on:click={validateAndSend}>Send</button>
<button class="btn btn-secondary" on:click={handleCancel}>Cancel</button>

<h4>New notification</h4>

{#if error & SEND_ERROR} 
<span class="error">Failed to send notification</span>
{/if}

<Origin bind:originObject={originT}/>

<table class="table">
    <tbody>
    <tr>
        <th>Target</th>
        <td>
            <Target target={target} bind:targetObject={targetT} {profile}/>
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
        <th>Context</th>
        <td>
            <Context bind:context={context}/>
        </td>
    </tr>
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