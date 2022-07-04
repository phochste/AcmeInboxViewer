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
    thingAsMarkdown,
    deleteFile
} from '@inrupt/solid-client';
import { markdown } from 'markdown';

export function prettyThing(thing: Thing) : string {
    if (! thing) {
        return "";
    }
    else {
        return markdown.toHTML(thingAsMarkdown(thing));
    }
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

export type MessageInfo = {
    resource: ResourceInfo | undefined ,
    activity: ActivityType | undefined
};

export async function inboxDataset(inbox: string) : Promise<SolidDataset> {
    const dataset = await getSolidDataset(inbox, {
        fetch: fetch
    });
    return dataset;
}

export async function loadInbox(inbox: string) : Promise<MessageInfo[]> {
    const dataset = await getSolidDataset(inbox, {
        fetch: fetch
    });

    let resources : MessageInfo[] = [];
    
    let containedResources = getContainedResourceUrlAll(dataset);

    for (let containedResourceUrl of containedResources) { 
        let inboxItem = await loadInboxItem(dataset, containedResourceUrl, inbox);
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