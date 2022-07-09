<script lang="ts">
    import AutoComplete from 'simple-svelte-autocomplete';
    import type { AgentType } from '../inbox';
    import { type ProfileType, fetchUserProfile , fetchKnowsProfile } from '../util';

    export let profile : ProfileType;
    export let target : string;
    export let targetObject : AgentType;

    let text : string;
    let externalProfile : Promise<ProfileType>;

    async function searchUser(keyword: string) {
        let people : string [] = [profile.webId, ...profile.knows];
        return people.filter( (item) => item.includes(keyword) );
    }

    function handleChange(webId: string) {
        if (! webId) {
            text = target;
        }
        else {
            target = text;
        }

        if (target) {
           getExternalProfile(target); 
        }
    }

    function handleCreate() {
        if (text) {
            target = text;
            getExternalProfile(target);
        }
    }

    async function getExternalProfile(webId: string) : Promise<void> {
        // First try to find if the local `foaf:knows` contains
        // an inbox for the webId. If not, try to fetch the
        // remote web profile
        let knowsProfile = fetchKnowsProfile(profile.webId, webId);
        let containsInbox = await hasInbox(knowsProfile);

        if (containsInbox) {
            console.log(`Local ${webId} inbox found`);
            externalProfile = knowsProfile;
        }
        else {
            console.log(`Fetching ${webId} remote profile for inbox information`);
            externalProfile = fetchUserProfile(webId);
        }

        setTargetParameters(externalProfile);
    }

    async function hasInbox(aProfile: Promise<ProfileType>) : Promise<boolean> {
        let candidate = await aProfile;

        return candidate && candidate.inbox ? true : false;
    }

    async function setTargetParameters(user: Promise<ProfileType>) : Promise<void> {
        try {
            let candidate = await user;

            if (candidate) {
                targetObject = {
                    id: candidate.webId ,
                    name: candidate.name ,
                    inbox: candidate.inbox ,
                    types: candidate.types
                }
            }
        }
        catch (e) {
            targetObject = null;
        }
    }

</script>

<small><i>The intended audience of your message.</i></small><br>
<AutoComplete 
    searchFunction={searchUser} 
    bind:text={text}
    create={true}
    delay=200
    required={true}
    onChange={handleChange}
    onCreate={handleCreate}
    />
<br>
{#if externalProfile}
  {#await externalProfile}
    <p>...Loading profile...</p>
  {:then external}
   {#if external.inbox}
    <b>Name</b>: {external.name}<br/>
    <b>Inbox</b>: {external.inbox} <br>
    <i>a</i> {external.types.join(', ')}
    {:else}
    <p>Found the web profile of {target}, but no inbox was found :-/.</p>
    {/if}
  {:catch error} 
    <p>Couldn't load the web profile of {target}. Can't send messages for now :-/.</p>
  {/await}
{/if}

<style>
    :global(.autocomplete) {
        width: 450px;
    }
</style>

