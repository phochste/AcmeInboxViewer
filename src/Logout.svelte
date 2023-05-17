<script lang="ts">
    import { logout } from '@inrupt/solid-client-authn-browser';
	import { profileState } from './stores'; 

    let profile: any;

    profileState.subscribe(value => profile = value)

    function handleLogout() {
        console.log(`Logout : ${profile.webId}`);
        logout();
        profile = undefined;
        
        profileState.set(profile);
    }

    console.log('profile', profile)
</script>

{#if typeof(profile) != "undefined" }
    {#if profile.img}
        <img src="{profile.img}" 
            class="img-circle" 
            width="50" 
            height="50" 
            alt="{profile.name}" 
            title="{profile.webId}"
            on:click={handleLogout}  
            />
    {:else}
        <img src="images/unknown.jpeg" 
            class="img-circle" 
            width="50" 
            height="50" 
            alt="{profile.name}" 
            title="{profile.webId}"
            on:click={handleLogout} 
            />
    {/if}
{/if}