<script lang="ts">
	import { objectBuilder, type MessageInfo, type ObjectType } from "./inbox";
	import Login from "./Login.svelte";
	import Logout from "./Logout.svelte";
	import InboxList from "./InboxList.svelte";
	import InboxItem from "./InboxItem.svelte";
	import InboxNew from "./InboxNew.svelte";
	import type { InboxListing, ProfileType } from "./util";
	import { AS, RDF } from "@inrupt/vocab-common-rdf";

	import { selectedInboxState, inboxListState, profileState } from "./stores";
	import InboxAdd from "./InboxAdd.svelte";

	let profile: ProfileType;
	let inbox: string | undefined;
	let inboxList: InboxListing[] = [];

	profileState.subscribe((value) => {
		profile = value;

		if (
			profile &&
			inboxList.filter((listing) => listing.inboxUrl === profile.inbox)
				.length === 0
		) {
			let listing = { agentId: profile.webId, inboxUrl: profile.inbox };

			inboxList.push(listing);
			inboxListState.set(inboxList);

			if (!inbox) selectedInboxState.set(listing);
		}
		console.log("profile", profile);
	});

	inboxListState.subscribe((value) => {
		inboxList = value;
	});

	selectedInboxState.subscribe((value) => {
		inbox = value && value.inboxUrl;
	});

	export let name: string;

	let socket: WebSocket;
	let selected: string;
	let newMail: boolean = false;
	let addInbox: boolean = false;
	let inReplyTo: string;
	let target: string;
	let context: ObjectType;
	let object: ObjectType;

	async function handleReply(e) {
		let item = e.detail as MessageInfo;
		let activity = await item.activity;
		selected = undefined;
		newMail = true;
		addInbox = false;
		inReplyTo = activity.id;
		target = activity.actor.id;
		context = activity.object;

		if (activity.types.includes(AS.Offer)) {
			let objectThing = objectBuilder(activity.id).addUrl(
				AS.object,
				activity.object.id
			);

			activity.types.forEach((i) => {
				objectThing = objectThing.addUrl(RDF.type, i);
			});

			object = {
				id: activity.id,
				types: activity.types,
				thing: objectThing.build(),
			} as ObjectType;
		} else {
			object = null;
		}
	}

	function handleNew(e) {
		newMail = true;
		target = undefined;
		inReplyTo = undefined;
		selected = undefined;
		context = undefined;
		addInbox = false;
	}

	function handleAdd(e) {
		newMail = false;
		target = undefined;
		inReplyTo = undefined;
		selected = undefined;
		context = undefined;
		addInbox = true;
	}

	function resetFields() {
		inReplyTo = null;
		target = null;
		context = null;
		object = null;
		newMail = false;
		selected = null;
		addInbox = false;
	}
</script>

<nav class="navbar navbar-default">
	<div class="container-fluid">
		<div class="navbar-header">
			<span class="navbar-brand">{name}</span>
		</div>
		<ul class="nav navbar-nav">
			<li>
				<Logout />
			</li>
		</ul>
		<div class="navbar-header navbar-inbox-container">
			<span class="navbar-inbox">{`selected inbox: ${inbox}`}</span>
		</div>
	</div>
</nav>

<Login />


{#if profile}
	{#if addInbox}
		<InboxAdd {inbox} {inboxList} on:reset={resetFields} />
	{:else if newMail}
		<InboxNew
			{inbox}
			on:send={resetFields}
			on:cancel={resetFields}
			{profile}
			{inReplyTo}
			{target}
			{context}
			{object}
		/>
	{:else if selected}
		<InboxItem {inbox} bind:selected {profile} on:reply={handleReply} />
	{:else}
		<InboxList
			bind:inbox
			bind:inboxList
			bind:selected
			{profile}
			{socket}
			on:new={handleNew}
			on:add={handleAdd}
		/>
	{/if}
{/if}

<style>
    .navbar-inbox-container {
        float: right;
    }

    .navbar-inbox {
        float: right;
        height: 50px;
        padding: 15px 15px;
        font-size: 18px;
        line-height: 20px;
    }
    
    .container-fluid {
        position: relative;
    }
</style>