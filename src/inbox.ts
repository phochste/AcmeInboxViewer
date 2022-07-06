import { fetch } from '@inrupt/solid-client-authn-browser';
import {
    getThing ,
    getDatetime ,
    getInteger ,
    getUrlAll ,
    getUrl,
    getStringNoLocale,
    getSolidDataset, 
    getContainedResourceUrlAll,
    type SolidDataset, 
    type Thing,
    type WithServerResourceInfo,
    deleteFile,
    buildThing,
    createThing
} from '@inrupt/solid-client';
import { v4 as uuidv4 } from 'uuid';

export type IFetchFunction = {
    (input: RequestInfo | URL, init?: RequestInit) : Promise<Response>
};

export function fetchWithOptions(myInit: RequestInit) : IFetchFunction {
    return (input: RequestInfo | URL, init?: RequestInit) => {
        let mergedInit : RequestInit = {...init,...myInit};
        return fetch(input,mergedInit);
    };
}

export function as2(term:string) : string {
    return 'https://www.w3.org/ns/activitystreams#' + term;
}

export function prettyThing(thing: Thing) : string {
    if (! thing) {
        return "";
    }
    else {
        let json = thingToJson(thing);
        let pretty =`
<table class="table table-bordered">
<tbody>
`;
        for (let key in json) {
            let value = json[key];
            if (Array.isArray(value)) {
                value = value as Array<string>;
                value = value.join(" ");
            }
            
            value = prettyHttp(value);

            pretty += `<tr><th>${key}</th><td>${value}</td></tr>`;
        }
        pretty += `</tbody></table>`;
        return pretty;
    }
}

export function prettyHttp(html: string) : string {
    return html.replace(/(http(s)?[^ ]+)/,"<a href=\"$1\">$1</a>");
}

export function prettyName(name: string) : string {
    return name ? name : 'Unknown';
}

export function prettyUris(uris : string[], join?: string) : string[] | string {
    if (!uris) {
        if (join) {
            return "";
        }
        else {
            return [];
        }
    }
    let pretty = uris.map( item => item.replace(/.*[\/#]/g,''));
    if (join) {
        return pretty.join(join);
    }
    else {
        return pretty;
    }
}

export function generateIdentifier() : string {
    return 'urn:uuid:' + uuidv4();
}

export async function sendNotification(inbox: string, notification: ActivityType) : Promise<boolean> {
    let jsonld = notificationAsJsonld(notification);

    console.log(`sending to ${inbox} : %s`, JSON.stringify(jsonld, undefined, 4));

    let response = await fetch(inbox, {
        method: 'POST',
        headers: {
            'Content-Type':'application/ld+json'
        },
        body: JSON.stringify(jsonld)
    });

    return isSuccessfulStatusCode(response.status);
}

function isSuccessfulStatusCode(statusCode: number) : boolean {
    return Math.floor(statusCode / 100) === 2;
}

export type MessageInfo = {
    resource: ResourceInfo | undefined ,
    activity: ActivityType | undefined
};

export function inboxDataset(inbox: string, init?: RequestInit) : Promise<SolidDataset & WithServerResourceInfo> {
    return getSolidDataset(inbox, {
        fetch: fetchWithOptions(init ? init : {})
    });
}

export async function loadInbox(inbox: string) : Promise<Promise<MessageInfo>[]> {
    const dataset = await inboxDataset(inbox, {
        cache: 'no-store'
    });

    let resources : Promise<MessageInfo>[] = [];
    
    let containedResources = getContainedResourceUrlAll(dataset);

    for (let containedResourceUrl of containedResources) { 
        let inboxItem = loadInboxItem(dataset, containedResourceUrl, inbox);
        resources.push(inboxItem);
    }

    return resources;
}

export async function loadInboxItem(dataset: SolidDataset, resource: string, base?: string) : Promise<MessageInfo> {
    let resourceInfo = getResourceInfoFromDataset(dataset, resource, base);
    let activityInfo : ActivityType = undefined;

    try {
        let messageDataset = await getSolidDataset(resource, {
            fetch: fetch
        });

        let rootUri = getRootUri(messageDataset);

        if (rootUri) {
            activityInfo = getActivityFromDataset(messageDataset,rootUri,resource);
        }
    }
    catch (e) {
        console.error(`${resource} is probably not RDF`);
        console.error(e);
    }

    return {
        resource: resourceInfo,
        activity: activityInfo
    };
}

export async function deleteInboxItem(item : MessageInfo) {
    await deleteFile(item.resource.url, {
        fetch:fetch
    });
}

export function getRootUri(dataset: SolidDataset) : string | undefined {
    const graphs = dataset.graphs;

    // The 'root' of a graph is a subject which is not the object of any predicate
    // We have a root if one and only one of such URIs exist
    let rootIds = Object.keys(graphs.default);

    for (let subject in graphs.default) {
        for (let predicate in graphs.default[subject].predicates) {
            for (let object in graphs.default[subject].predicates[predicate]) {
                if (object == 'namedNodes') {
                    let nodes = graphs.default[subject].predicates[predicate][object];
                    nodes.forEach( node => {
                       rootIds = rootIds.filter( id => id !== node);
                    });
                }
            }
        }
    }

    if (rootIds.length == 1) {
        return rootIds[0];
    }
    else {
        return undefined;
    }
}

/**
 * From BashLib https://github.com/SolidLabResearch/Bashlib
 */
 export type ResourceInfo = {
    url: string,
    relativePath?: string,
    isDir: boolean,
    modified?: Date | null,
    mtime?: number | null,
    size?: number | null,
    types?: string[],
}

export function getResourceInfoFromDataset(dataset: SolidDataset, resourceUrl: string, baseUrl?: string) : ResourceInfo | undefined {
    const thing = getThing(dataset, resourceUrl)
    let resourceInfo: ResourceInfo | undefined;
    if (thing) {
      const modified = getDatetime(thing, 'http://purl.org/dc/terms/modified')
      const mtime = getInteger(thing, 'http://www.w3.org/ns/posix/stat#mtime')
      const size = getInteger(thing, 'http://www.w3.org/ns/posix/stat#size')
      const types = getUrlAll(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
      resourceInfo = {
        url: resourceUrl,
        relativePath: baseUrl ? resourceUrl.slice(baseUrl.length) : undefined, 
        isDir: types.indexOf('http://www.w3.org/ns/ldp#Container') !== -1 || types.indexOf('http://www.w3.org/ns/ldp#BasicContainer') !== -1,
        modified, mtime, size, types
      }
    }
    return resourceInfo
}

export type AgentType = {
    id?: string,
    types?: string[],
    name?: string,
    inbox?: string,
    thing?: Thing   
}

export type ObjectType = {
    id?: string,
    types?: string[],
    thing?: Thing
}

export type ActivityType = {
    id?: string,
    types: string[],
    published?: Date,
    actor?: AgentType,
    inReplyTo?: string,
    context?: ObjectType,
    origin?: AgentType,
    object?: ObjectType,
    target?: AgentType
    thing?: Thing
}

export function getActivityFromDataset(dataset: SolidDataset, resourceUrl: string, baseurl?: string) : ActivityType | undefined {
    const thing = getThing(dataset, resourceUrl);
    let activityT : ActivityType | undefined;
    let actorT : AgentType | undefined;
    let targetT : AgentType | undefined;
    let originT : AgentType | undefined;
    let objectT : ObjectType | undefined;
    let contextT : ObjectType | undefined;

    if (thing) {
        const types     = getUrlAll(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        const published = getDatetime(thing, 'https://www.w3.org/ns/activitystreams#published');
        const actor     = getUrl(thing, 'https://www.w3.org/ns/activitystreams#actor');
        const target    = getUrl(thing, 'https://www.w3.org/ns/activitystreams#target');
        const origin    = getUrl(thing, 'https://www.w3.org/ns/activitystreams#origin');
        const context   = getUrl(thing, 'https://www.w3.org/ns/activitystreams#context');
        const inReplyTo = getUrl(thing, 'https://www.w3.org/ns/activitystreams#inReplyTo');
        const object    = getUrl(thing, 'https://www.w3.org/ns/activitystreams#object');

        if (actor) {
            const thing = getThing(dataset, actor);
            let types: string[];
            let name: string;
            let inbox: string;

            if (thing) {
                types = getUrlAll(thing,'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                name  = getStringNoLocale(thing, 'https://www.w3.org/ns/activitystreams#name');
                inbox = getUrl(thing, 'https://www.w3.org/ns/activitystreams#inbox');
            }

            actorT = {
                id: actor ,
                types , name , inbox , thing
            };
        }
        else {
            actorT = undefined;
        }

        if (target) {
            const thing = getThing(dataset, target);
            let types: string[];
            let name: string;
            let inbox: string;

            if (thing) {
                types = getUrlAll(thing,'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                name  = getStringNoLocale(thing, 'https://www.w3.org/ns/activitystreams#name');
                inbox = getUrl(thing, 'https://www.w3.org/ns/activitystreams#inbox');
            }

            targetT = {
                id: target ,
                types , name , inbox , thing
            };
        }
        else {
            targetT = undefined;
        }

        if (origin) {
            const thing = getThing(dataset, target);
            let types: string[];
            let name: string;
            let inbox: string;

            if (thing) {
                types = getUrlAll(thing,'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                name  = getStringNoLocale(thing, 'https://www.w3.org/ns/activitystreams#name');
                inbox = getUrl(thing, 'https://www.w3.org/ns/activitystreams#inbox');
            }

            originT = {
                id: origin ,
                types , name , inbox, thing
            };
        }
        else {
            originT = undefined;
        }

        if (context) {
            const thing = getThing(dataset, context); 
            let types : string[];
            
            if (thing) {
                types = getUrlAll(thing,'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
            }

            contextT = {
                id: context,
                types , thing
            }; 
        }

        if (object) {
            const thing = getThing(dataset, object); 
            let types : string[];

            if (thing) {
                types = getUrlAll(thing,'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
            }   

            objectT = {
                id: object ,
                types , thing
            };
        }
        else {
            objectT = undefined;
        }

        activityT = {
            id: thing.url ,
            actor: actorT ,
            origin: originT ,
            target: targetT ,
            context: contextT ,
            object: objectT ,
            types , published , inReplyTo , thing
        };

        return activityT;
    }
    else {
        return undefined;
    }
}

export function notificationAsJsonld(notification: ActivityType) : any {
    let jsonld : any = {};
   
    jsonld['@context'] = 'https://www.w3.org/ns/activitystreams';
    jsonld['id']      = notification.id;

    if (notification.types.length) {
        if (notification.types.length == 1) {
            jsonld['type'] = notification.types[0];
        }
        else {
            jsonld['type'] = notification.types;
        }
    }

    if (notification.published) {
        jsonld['published'] = notification.published.toISOString();
    }
    else {
        jsonld['published'] = (new Date()).toISOString();
    }

    if (notification.inReplyTo) {
        jsonld['inReplyTo'] = notification.inReplyTo;
    }

    let actor   = agentTypeToJson(notification.actor);
    let target  = agentTypeToJson(notification.target);
    let origin  = agentTypeToJson(notification.origin);
    let object  = objectTypeToJson(notification.object);
    let context = objectTypeToJson(notification.context);

    if (actor) {
        jsonld['actor'] = actor;
    }

    if (origin) {
        jsonld['origin'] = origin;
    }

    if (target) {
        jsonld['target'] = target;
    }

    if (object) {
        jsonld['object'] = object;
    }

    if (context) {
        jsonld['context'] = context;
    }

    return jsonld;
}

function agentTypeToJson(agent: AgentType) : any | undefined {
    let json : any; 

    if (agent) {
        json = {};
        if (agent.id) {
            json['id'] = agent.id;
        }
        if (agent.name) {
            json['name'] = agent.name;
        }
        if (agent.inbox) {
            json['inbox'] = agent.inbox;
        }
        if (agent.types && agent.types.length) {
            if (agent.types.length == 1) {
                json['type'] = agent.types[0];
            }
            else {
                json['type'] = agent.types;
            }
        }
    }

    return json;
}

export function objectBuilder(id: string) {
    return  buildThing(createThing({ url: id }));
}

function objectTypeToJson(object: ObjectType) : any | undefined {
    let json : any; 

    if (object) {
        json = {};

        if (object.id) {
            json['id'] = object.id;
        }
        if (object.types && object.types.length) {
            if (object.types.length == 1) {
                json['type'] = object.types[0];
            }
            else {
                json['type'] = object.types;
            }
        }
        if (object.thing) {
            let jsonObject = thingToJson(object.thing);

            if (jsonObject) {
                json = {...json,...jsonObject};
            }
        }
    }

    return json;
}

// This code is a simplification where an object is probably a more
// extended object than just a thing
// TODO: refactor and throw it away
function thingToJson(thing: Thing) : any | undefined {
    if (! thing) {
        return undefined;
    }

    let json : any = { id: thing.url };

    for (let predicate in thing.predicates) {
        let jpred = predicate.replace("https://www.w3.org/ns/activitystreams#","")
                             .replace("http://www.w3.org/1999/02/22-rdf-syntax-ns#type","type");

        json[jpred] = [];

        let object = thing.predicates[predicate];

        if (object.namedNodes && object.namedNodes.length) {
            json[jpred].push(...object.namedNodes);
        }

        if (object.literals) {
            for (let sch in object.literals) {
                let values = object.literals[sch];
                for (let i in values) {
                    json[jpred].push(values[i]);
                }
            }
        }

        if (object.blankNodes) {
            console.error(`blank nodes not supported`);
        }

        json[jpred] = json[jpred].map( item => { 
           return item.replace("https://www.w3.org/ns/activitystreams#","");
        });

        if (json[jpred].length == 1) {
            json[jpred] = json[jpred][0];
        }
    }    

    return json;
}