<script lang="ts">
	import { objectBuilder , type MessageInfo, type ObjectType } from './inbox';
	import Login from './Login.svelte';
	import Logout from './Logout.svelte';
	import InboxList from './InboxList.svelte';
	import InboxItem from './InboxItem.svelte';
	import InboxNew from './InboxNew.svelte';
	import type { ProfileType } from './util';
	import { AS, RDF } from '@inrupt/vocab-common-rdf';

	export let name: string;
	
	let socket: WebSocket;
	let profile: ProfileType;
	let selected: string;
	let newMail: boolean = false;
	let inReplyTo : string;
	let target : string;
	let context : ObjectType;
	let object : ObjectType;

	async function handleReply(e) {
		let item  = e.detail as MessageInfo;
		let activity = await item.activity;
		selected  = undefined;
		newMail   = true;
		inReplyTo = activity.id;
		target    = activity.actor.id;
		context   = activity.object;

		console.log(activity);

		if (activity.types.includes(AS.Offer)) {
			let objectThing = objectBuilder(activity.id)
								.addUrl(AS.object,activity.object.id);

			activity.types.forEach( i => {
				objectThing = objectThing.addUrl(RDF.type,i);
			});

			object = {
				id: activity.id ,
				types: activity.types,
				thing: objectThing.build()
			} as ObjectType;
		}
		else {
			object = null;
		}
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