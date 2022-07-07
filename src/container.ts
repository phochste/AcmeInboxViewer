import { getSolidDataset , getContainedResourceUrlAll } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

export const FILE_TYPE = 0x01;
export const DIR_TYPE  = 0x02;
export const ANY_TYPE  = 0x04;

export function hasType(type: number) : boolean {
    return type && type > 0 ? true : false;
}

export function isFileType(type: number) : boolean {
    if (! type) return false;
    return (type & FILE_TYPE) > 0;
}

export function isDirType(type: number) : boolean {
    if (! type) return false;
    return (type & DIR_TYPE) > 0;
}

export type FileInfo = {
    url: string ,
    name?: string ,
    isDir?: boolean ,
};

export function watchContainer(url: string, callback: (string) => void) : WebSocket {
    let socket : WebSocket;
    let keepAlive = (websocket,sock) => {
        var timeout = 20000;
        if (sock.readyState == sock.OPEN) {   
            console.log(`${websocket} keep alive`);
            socket.send('');
            setTimeout(keepAlive, timeout, websocket, sock);  
        }
    };
    try {
        const websocket = 'wss://' + url.split('/')[2];
        socket = new WebSocket(websocket, ['solid-0.1']);
        socket.onopen = function() {
            console.log(`${websocket} open ${url}`);
            console.log(`${websocket} sub ${url}`);
            this.send(`sub ${url}`);
            keepAlive(websocket,this);
        }
        socket.onmessage = function(msg) {
            if (msg.data && msg.data.slice(0,3) === 'pub') {
                console.log(`${websocket} ${msg.data}`);
                callback(msg.data);
            }
            if (msg.data && msg.data.slice(0,3) === 'ack') {
                console.log(`${websocket} ${msg.data}`);
            }
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

export function getContainerItem(url: string) : FileInfo | undefined {
    let file : FileInfo;

    if (! url) return undefined;
    
    if (url.endsWith('/')) {
        let name = url.replace(/\/$/g,'').replace(/.*\//g,'');
        file = {
            url: url,
            name: name,
            isDir: true
        };
    }
    else {
        let name = url.replace(/.*\//g,'');
        file = {
            url: url,
            name: name,
            isDir: false
        };
    } 

    return file;
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
            let file = getContainerItem(uri);
            files.push(file);
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