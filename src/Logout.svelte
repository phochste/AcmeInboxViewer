<script lang="ts">
    import { logout } from '@inrupt/solid-client-authn-browser';
    export let profile: any;

    function handleLogout() {
        console.log(`Logout : ${profile.webId}`);
        logout();
        profile = undefined;
    }
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