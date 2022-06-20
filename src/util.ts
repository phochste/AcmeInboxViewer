import { fetch , getDefaultSession } from '@inrupt/solid-client-authn-browser';
import {
    getThing ,
    getDatetime ,
    getInteger ,
    getUrlAll ,
    type SolidDataset
} from '@inrupt/solid-client';
import * as N3 from 'n3';

/* 
 * See: https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/authenticate-browser/
 * for documentation on Inrupt Solid Authn API
*/

export function isLoggedIn() : boolean {
    return getDefaultSession().info.isLoggedIn;
}

export async function readSolidDocument(url: string) {
    try {
        const response = await fetch(url, { headers: { Accept: 'text/turtle' } });

        if (!isSuccessfulStatusCode(response.status))
            return null;

        const data = await response.text();
        const parser = new N3.Parser({ baseIRI: url });

        return parser.parse(data);
    } catch (error) {
        return null;
    }
}

function isSuccessfulStatusCode(statusCode: number) : boolean {
    return Math.floor(statusCode / 100) === 2;
}

export type ProfileType = {
    webId: string,
    givenName: string | undefined,
    familyName: string | undefined,
    name: string | undefined,
    image: string | undefined
    inbox: string | undefined
};

export async function fetchUserProfile(webId: string) : Promise<ProfileType> {
    const profileQuads = await readSolidDocument(webId);
    const givenNameQuad 
          = profileQuads.find(quad => quad.predicate.value === 'http://xmlns.com/foaf/0.1/givenName');
    const familyNameQuad 
          = profileQuads.find(quad => quad.predicate.value === 'http://xmlns.com/foaf/0.1/familyName');
    const nameQuad  
          = profileQuads.find(quad => quad.predicate.value === 'http://xmlns.com/foaf/0.1/name');
    const imageQuad 
          = profileQuads.find(quad => quad.predicate.value === 'http://xmlns.com/foaf/0.1/img');
    const inboxQuad
          = profileQuads.find(quad => quad.predicate.value === 'http://www.w3.org/ns/ldp#inbox');

    return {
        webId: webId ,
        givenName: givenNameQuad?.object.value ,
        familyName: familyNameQuad?.object.value ,
        name:  nameQuad?.object.value ,
        image: imageQuad?.object.value,
        inbox: inboxQuad?.object.value
    };
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

export function getResourceInfoFromDataset(dataset: SolidDataset, resourceUrl: string, baseUrl?: string) {
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