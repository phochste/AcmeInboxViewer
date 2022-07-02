<script lang="ts">
    import { getContainerList, watchContainer, type FileInfo } from './container';

    export let container : string;
    export let selection : string;

    let containerStack : string[] = [ ];
    let list : FileInfo[] = [];
    let socket : WebSocket;

    changeContainer({ url: container});

    async function reloadContainer() {
        console.log(`reload ${container}`);

        let next = await getContainerList(container);

        if (typeof(next) === 'undefined') {
            // Do nothing...
        }
        else {
            list = next;
        }
    }

    async function changeResource(file : FileInfo) {
        selection = file.url;
    }

    async function changeContainer(dir : FileInfo) {
        if (dir) {
            
            containerStack.push(container);

            let next = await getContainerList(dir.url);

            if (typeof(next) === 'undefined') {
                // Do nothing...
                containerStack.pop();
            }
            else {
                container = dir.url;
                selection = dir.url;
                list = next;
                if (socket) socket.close();
                socket = watchContainer(container, (msg) => {
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
                container = url;
                selection = url;
                list = next;
                if (socket) socket.close();
                socket = watchContainer(container, (msg) => {
                    reloadContainer();
                }); 
            }
        }
    }

</script>

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
       <div class="dir">
            <a href="{item.url}" on:click|preventDefault={() => changeContainer(item)} >{item.name}</a>
       </div>
    {:else}
       <div class="file">
            <a href="{item.url}" on:click|preventDefault={ () => changeResource(item)}>{item.name}</a>
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
