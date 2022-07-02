<script lang="ts">
    import { getContainerList, watchContainer, type FileInfo } from './container';

    export let resource : string = "";

    let containerStack : string[] = [ ];
    let list : FileInfo[] = [];
    let socket : WebSocket;

    changeContainer({ url: resource });

    async function reloadContainer() {
        console.log(`reload ${resource}`);

        let next = await getContainerList(resource);

        if (typeof(next) === 'undefined') {
            // Do nothing...
        }
        else {
            list = next;
        }
    }

    async function changeContainer(container : FileInfo) {
        if (container) {
            
            containerStack.push(resource);

            let next = await getContainerList(container.url);

            if (typeof(next) === 'undefined') {
                // Do nothing...
                containerStack.pop();
            }
            else {
                resource = container.url;
                list = next;
                if (socket) socket.close();
                socket = watchContainer(resource, (msg) => {
                    reloadContainer();
                });
            }
        }
        else {
            let url  = containerStack.pop();
            let next = await getContainerList(url);

            if (typeof(next) === 'undefined') {
                // Do nothing...
            }
            else {
                resource = url;
                list = next;
                if (socket) socket.close();
                socket = watchContainer(resource, (msg) => {
                    reloadContainer();
                }); 
            }
        }
    }

</script>

<p> 
    <a href="{resource}" on:click|preventDefault={reloadContainer}><b>{resource}</b></a>
</p>

{#if list}
 <ul>
  {#if containerStack.length}
  <li>
        <div class="dir_open" on:click|preventDefault={() => changeContainer(null)}>..</div>
  </li>
  {/if}
  {#each list as item} 
    <li>
    {#if item.isDir}
       <div class="dir" on:click|preventDefault={() => changeContainer(item)}>
            <a href="{item.url}">{item.name}</a>
       </div>
    {:else}
       <div class="file">
            <a href="{item.url}">{item.name}</a>
       </div>
    {/if}
    </li>
  {/each}
 </ul>
{/if}

<style>
	div {
		padding: 0 0 0 1.5em;
		background: 0 0.1em no-repeat;
		background-size: 1em 1em;
	}

    .file {
        background-image: url(/images/file.svg);
    }

    .dir {
		background-image: url(/images/folder.svg);
        font-weight: bold;
	}

    .dir_open {
		background-image: url(/images/folder-open.svg);
        font-weight: bold;
    }

    ul {
		padding: 0.2em 0 0 0.5em;
		margin: 0 0 0 0.5em;
		list-style: none;
		border-left: 1px solid #eee;
	}

    li {
		padding: 0.2em 0;
	}
</style>
