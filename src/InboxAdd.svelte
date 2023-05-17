<script lang="ts">
	import {
		fetchUserProfile,
		type InboxListing,
		type ProfileType,
	} from "./util";
	import { createEventDispatcher } from "svelte";
	import Checkbox from "./Fields/Checkbox.svelte";
	import { inboxListState, selectedInboxState } from "./stores";

	let selected: InboxListing | undefined;
	let inboxList: InboxListing[];

	inboxListState.subscribe((value) => {
		inboxList = value;
	});

	selectedInboxState.subscribe((value) => {
		selected = value;
	});

	let inboxToAdd: string = "";

	const dispatch = createEventDispatcher();

	function handleReset() {
		dispatch("reset", {});
	}

	async function handleRemove(listingToRemove: InboxListing) {
		let beforeLen = inboxList.length;
		let newInboxList = inboxList.filter(
			(listing) => listing.inboxUrl !== listingToRemove.inboxUrl
		);
		if (newInboxList.length !== beforeLen) {
			inboxListState.set(newInboxList);
			return;
		} else {
			console.error(`Failed to remove listing for ${listingToRemove.inboxUrl}`);
		}

        if (listingToRemove.inboxUrl === selected.inboxUrl) {
            if (newInboxList.length >= 1) {
                setSelectedInbox(newInboxList[1]);
            } else {
                setSelectedInbox(undefined)
            }
        }
	}

	async function handleAdd() {
		let addedWebID: string | undefined;
		let addedInboxURL: string;
		console.log(inboxToAdd);
		let inboxOrWebID = inboxToAdd; // Could be WebID or inbox URL
		try {
			let webIdProfile = await fetchUserProfile(inboxOrWebID);
			if (webIdProfile && webIdProfile.inbox) {
				addedWebID = inboxOrWebID;
				addedInboxURL = webIdProfile.inbox;
			} else {
				addedInboxURL = inboxOrWebID;
			}
		} catch (e) {
			alert(`Could not add inbox: ${e}`);
			return;
		}

		for (const listing of inboxList) {
			if (listing.inboxUrl === addedInboxURL) {
				alert("Added inbox already exists");
				return;
			}
		}

		let inboxListing: InboxListing = {
			inboxUrl: addedInboxURL,
			agentId: addedWebID,
		};
		inboxList.push(inboxListing);
		inboxListState.set(inboxList);
	}

    function setSelectedInbox(inboxListing) {
        selectedInboxState.set(inboxListing)
    }

</script>

<button class="btn btn-primary" on:click={handleReset}>Return</button>

<h4>Add Inbox</h4>
<p>Add an inbox URL, or the WebID from which an Inbox is linked</p>
<input type="text" bind:value={inboxToAdd} />
<button class="btn btn-success" on:click={handleAdd}>Add</button>

<h4>Manage Inboxes</h4>

<table class="table">
	<thead>
		<th>Selected</th>
		<th>Inbox</th>
		<th>Agent Id</th>
		<th>Unread Messages</th>
		<th />
	</thead>
	<tbody>
		{#each inboxList as inboxListing}
			<tr>
				<td>
					<Checkbox
						checked={inboxListing.inboxUrl === (selected && selected.inboxUrl)}
						on:checked={() => {
							setSelectedInbox(inboxListing);
						}}
					/>
				</td>
				<td><b>{inboxListing.inboxUrl}</b></td>
				<td><b>{inboxListing.agentId || "Unknown"}</b></td>
                <td>--</td>
				<td
					><button
						class="delete"
						on:click|stopPropagation={() => {
							handleRemove(inboxListing);
						}}>🗑</button
					></td
				>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.list-menu {
		margin-left: 7px;
		margin-bottom: 5px;
	}

	button.delete {
		width: 30px;
		height: 30px;
	}
</style>
