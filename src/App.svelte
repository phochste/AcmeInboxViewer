<script lang="ts">
	import Login from './Login.svelte';
	import Logout from './Logout.svelte';
	import InboxList from './InboxList.svelte';
	import InboxItem from './InboxItem.svelte';
	import InboxNew from './InboxNew.svelte';

	export let name: string;
	
	let profile: any;
	let selected: string;
	let newMail: boolean = false;

</script>

<nav class="navbar navbar-default">
	<div class="container-fluid">
	  <div class="navbar-header">
		<span class="navbar-brand">{name}</span>
	  </div>
	  <ul class="nav navbar-nav">
		<li>
			<Logout bind:profile={profile}/>
		</li>
	  </ul>
	</div>
</nav>

<Login bind:profile={profile}/>

{#if profile}
  {#if newMail}
	 <InboxNew inbox={profile.inbox} bind:newMail={newMail} {profile}/>
  {:else if selected}
     <InboxItem inbox={profile.inbox} bind:selected={selected}/>
  {:else}
  	 <InboxList inbox={profile.inbox} bind:selected={selected} bind:newMail={newMail}/>
  {/if}
{/if}