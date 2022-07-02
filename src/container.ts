import { getSolidDataset , getContainedResourceUrlAll } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

export type FileInfo = {
    url: string ,
    name?: string ,
    isDir?: boolean ,
};

export function watchContainer(url: string, callback: (string) => void) : WebSocket {
    let socket;
    try {
        const websocket = 'wss://' + url.split('/')[2];
        socket = new WebSocket(websocket, ['solid-0.1']);
        socket.onopen = function() {
            console.log(`${websocket} open ${url}`);
            console.log(`${websocket} sub ${url}`);
            this.send(`sub ${url}`);
        }
        socket.onmessage = function(msg) {
            if (msg.data && msg.data.slice(0,3) === 'pub') {
                console.log(`ws> ${msg.data}`);
                callback(msg.data);
            }
            console.log(msg);
        }
        socket.onerror = function(e) {
            console.error(`${websocket} error ${url} %O`, e);
        }
        socket.onclose = function() {
            console.log(`${websocket} closed ${url}`);
        }
    }
    catch (e) {
        console.error(`watchContainer(${url})`);
        console.error(e);
    }
    return socket;   
}

export async function getContainerList(url: string) : Promise<FileInfo[] | undefined> {
    let containerDataset = null;

    try {
        let files : FileInfo[] = [];
        containerDataset = await getSolidDataset(url, { fetch: fetch });

        if (! containerDataset ) {
            return [];
        }

        let containedURIs = getContainedResourceUrlAll(containerDataset);

        for (let uri of containedURIs) {
            if (uri.endsWith('/')) {
                let name = uri.replace(/\/$/g,'').replace(/.*\//g,'');
                files.push({
                    url: uri,
                    name: name,
                    isDir: true
                });
            }
            else {
                let name = uri.replace(/.*\//g,'');
                files.push({
                    url: uri,
                    name: name,
                    isDir: false
                });
            }
        }

        return files.sort( (a,b) => {
            if (a.name > b.name) {
                return 1;
            }
            else if (a.name < b.name) {
                return -1;
            }
            else {
                return 0;
            }
        });
    }
    catch (e) {
        console.error(`failed to access ${url} : %O`, e);
        return undefined;
    }
}