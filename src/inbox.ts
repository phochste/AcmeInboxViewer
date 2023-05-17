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
import { RDF , AS } from '@inrupt/vocab-common-rdf';

export type IFetchFunction = {
    (input: RequestInfo, init?: RequestInit) : Promise<Response>
};

/**
 * Create a new fetch functio with options already filled out
 * @param {RequestInit} myInit - The fetch initialization options
 * @returns {IFetchFunction} The initialized fetch function
 */
export function fetchWithOptions(myInit: RequestInit) : IFetchFunction {
    return (input: RequestInfo, init?: RequestInit) => {
        let mergedInit : RequestInit = {...init,...myInit};
        return fetch(input,mergedInit);
    };
}

/**
 * Create a HTML version of a Thing
 * @param {Thing} thing - a solid-client Thing
 * @returns {string} The HTML representation of the Thing 
 */
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

/**
 * Create a clickable HTTP links
 * @param {string} html - a HTML fragment
 * @returns {string} A HTML fragment with clickable HTTP links
 */
export function prettyHttp(html: string) : string {
    return html.replace(/(http(s)?[^ ]+)/,"<a href=\"$1\">$1</a>");
}

/**
 * Create a pretty format for names
 * @param {string} name - a name
 * @returns {string} A pretty representation of the name
 */
export function prettyName(name: string) : string {
    return name ? name : 'Unknown';
}

/**
 * Create a human friendly representation of URIs
 * @param {string[]} uris - an array of URIs
 * @param {string} [join] - a join character
 * @returns {string[] | string} - A list of human friendly strings or a string when join is used
 */
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

/**
 * Generate a UUID URI
 * @returns {string} The UUID URI
 */
export function generateIdentifier() : string {
    return 'urn:uuid:' + uuidv4();
}

/**
 * Send a notification to an inbox
 * @param {string} inbox - an LDN Inbox URL 
 * @param {ActivityType} notification - an AS2 activity 
 * @returns {Promise<boolean>} A boolean success/failure of sending the notification
 */
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

    console.log(`sending status: ${response.status}`);

    return isSuccessfulStatusCode(response.status);
}

function isSuccessfulStatusCode(statusCode: number) : boolean {
    return Math.floor(statusCode / 100) === 2;
}

export type MessageInfo = {
    resource: ResourceInfo | undefined ,
    activity: Promise<ActivityType | undefined>
};

/**
 * Return a solid-client SolidDataset associated with an LDN Inbox
 * @param {string} inbox - an LDN Inbox URI 
 * @param {RequestInit} [init] - Fetch request options 
 * @returns {Promise<SolidDataset & WithServerResourceInfo>} A solid-client SolidDataset
 */
export function inboxDataset(inbox: string, init?: RequestInit) : Promise<SolidDataset & WithServerResourceInfo> {
    return getSolidDataset(inbox, {
        fetch: fetchWithOptions(init ? init : {})
    });
}

/**
 * Return the contents of an LDN Inbox
 * @param {string} inbox - an LDN Inbox URI
 * @returns {Promise<MessageInfo[]>} An array of LDN Inbox resources 
 */
export async function loadInbox(inbox: string) : Promise<MessageInfo[]> {
    const dataset = await inboxDataset(inbox, {
        cache: 'no-store'
    });

    let resources : MessageInfo[] = [];
    
    let containedResources = getContainedResourceUrlAll(dataset);

    for (let containedResourceUrl of containedResources) { 
        let inboxItem = loadInboxItem(dataset, containedResourceUrl, inbox);
        resources.push(inboxItem);
    }

    return resources.sort( (a,b) => {
        if (a.resource.modified && b.resource.modified) {
            return b.resource.modified.getTime() - a.resource.modified.getTime();
        }
        else if (a.resource.mtime && b.resource.mtime) {
            return b.resource.mtime - a.resource.mtime;
        }
        else {
            return 0;
        }
    });
}

/**
 * Return one LDN Inbox resource
 * @param {SolidDataset} dataset - a solid-client SolidDataset 
 * @param {string} resource - an LDN Inbox resoure URL 
 * @param {string} [base] - a base URL
 * @returns {MessageInfo} A message
 */
export function loadInboxItem(dataset: SolidDataset, resource: string, base?: string) : MessageInfo {
    let resourceInfo = getResourceInfoFromDataset(dataset, resource, base);
    let activityInfo = loadInboxItemActivity(resource);

    return {
        resource: resourceInfo,
        activity: activityInfo
    };
}

/**
 * Count the number of items in the requested inbox
 * @param {string} inbox - the inbox URL
 * @returns {number} The amount of notifications
 */
export async function countInbox(inbox: string, selectedNotifications: string[]) { 
    const dataset = await inboxDataset(inbox, {
        cache: 'no-store'
    });
    let containedResources = getContainedResourceUrlAll(dataset);
    let totalCount = containedResources.length;
    let unreadCount = containedResources.filter(url => selectedNotifications.indexOf(url) === -1).length
    return { total: totalCount, unread: unreadCount }
}

async function loadInboxItemActivity(resource: string) : Promise<ActivityType | undefined> {
    try {
        let messageDataset = await inboxDataset(resource);

        let rootUri = getRootUri(messageDataset);

        if (rootUri) {
            return getActivityFromDataset(messageDataset,rootUri,resource);
        }
        else {
            return undefined;
        }
    }
    catch (e) {
        console.error(`${resource} is probably not RDF`);
        console.error(e);
        return undefined;
    }
}

/**
 * Delete an LDN Inbox resource
 * @param {MessageInfo} item - an LDN Inbox resource
 */
export async function deleteInboxItem(item : MessageInfo) : Promise<void> {
    await deleteFile(item.resource.url, {
        fetch:fetch
    });
}

/**
 * Return the "root" subject of a dataset. This is the subject that is not
 * the object of any triple in the contained graph(s).
 * @param {SolidDataset} dataset - a solid-client dataset
 * @returns {string | undefined} The resolved root URI
 */
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

/**
 * Return an AS2 Activity for an LDN Inbox resource
 * @param {SolidDataset} dataset - a solid-client dataset
 * @param {string} resourceUrl - a root URI 
 * @param {string} [baseurl] - the baseURL of the resource 
 * @returns {ActivityType} An AS2 Activity
 */
export function getActivityFromDataset(dataset: SolidDataset, resourceUrl: string, baseurl?: string) : ActivityType | undefined {
    const thing = getThing(dataset, resourceUrl);
    let activityT : ActivityType | undefined;
    let actorT : AgentType | undefined;
    let targetT : AgentType | undefined;
    let originT : AgentType | undefined;
    let objectT : ObjectType | undefined;
    let contextT : ObjectType | undefined;

    if (thing) {
        const types     = getUrlAll(thing, RDF.type);
        const published = getDatetime(thing, AS.published);
        const actor     = getUrl(thing, AS.actor);
        const target    = getUrl(thing, AS.target);
        const origin    = getUrl(thing, AS.origin);
        const context   = getUrl(thing, AS.context);
        const inReplyTo = getUrl(thing, AS.inReplyTo);
        const object    = getUrl(thing, AS.object);

        if (actor) {
            const thing = getThing(dataset, actor);
            let types: string[];
            let name: string;
            let inbox: string;

            if (thing) {
                types = getUrlAll(thing, RDF.type);
                name  = getStringNoLocale(thing, AS.name);
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
                types = getUrlAll(thing, RDF.type);
                name  = getStringNoLocale(thing, AS.name);
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
                types = getUrlAll(thing, RDF.type);
                name  = getStringNoLocale(thing, AS.name);
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
                types = getUrlAll(thing, RDF.type);
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
                types = getUrlAll(thing, RDF.type);
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

/**
 * Return an AS2 Activity as JSON-LD
 * @param {ActivityType} notification - an AS2 activity 
 * @returns {any} A JSON-LD representation
 */
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

    if (context) {
        jsonld['context'] = context;
    }

    if (object) {
        jsonld['object'] = object;
    }

    if (target) {
        jsonld['target'] = target;
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
    return buildThing(createThing({ url: id }));
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

export type SourceType = {
    text: string,
    type: string,
    isJson: boolean
};

/**
 * Return the content of a resource
 * @param {string} resource - a URL 
 * @returns {Promise<SourceType | null>} A representation of the resource content
 */
export async function getSource(resource: string) : Promise<SourceType | null> {
    const result = await fetch(resource);

    if (! isSuccessfulStatusCode(result.status)) {
        return null;
    }
    else {
        let text = await result.text();
        return {
            text: text,
            type: result.headers.get("content-type"),
            isJson: result.headers.get("content-type").includes('json')
        }
    }
}