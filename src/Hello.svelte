<script lang="ts">
    import type { ProfileType } from './util';
    import { isLoggedIn } from './util';
    export let profile : ProfileType;
</script>

{#if isLoggedIn() && profile }
    <h1>Hello {profile.givenName ? profile.givenName : "Anonymous 😉"} !</h1>
{/if}