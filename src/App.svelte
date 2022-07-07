<script lang="ts">
	import type { MessageInfo, ObjectType } from './inbox';
	import Login from './Login.svelte';
	import Logout from './Logout.svelte';
	import InboxList from './InboxList.svelte';
	import InboxItem from './InboxItem.svelte';
	import InboxNew from './InboxNew.svelte';
	import type { ProfileType } from './util';

	export let name: string;
	
	let socket: WebSocket;
	let profile: ProfileType;
	let selected: string;
	let newMail: boolean = false;
	let inReplyTo : string;
	let target : string;
	let context : ObjectType;
	let object : ObjectType;

	function handleReply(e) {
		let item = e.detail as MessageInfo;
		selected = undefined;
		newMail = true;
		inReplyTo = item.activity.id;
		target = item.activity.actor.id;
		context = item.activity.object;
	}

	function handleNew(e) {
		newMail = true;
		target = undefined;
		inReplyTo = undefined;
		selected = undefined;
		context = undefined;
	}

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
	 <InboxNew inbox={profile.inbox} bind:newMail={newMail} 
	 	{profile} {inReplyTo} {target} {context} {object}/>
  {:else if selected}
     <InboxItem inbox={profile.inbox} bind:selected={selected} {profile} 
	 		on:reply={handleReply}/>
  {:else}
  	 <InboxList inbox={profile.inbox} bind:selected={selected} {profile} {socket}
	 		on:new={handleNew}/>
  {/if}
{/if}