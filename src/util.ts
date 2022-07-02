import { fetch , getDefaultSession } from '@inrupt/solid-client-authn-browser';
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
    image: string | undefined,
    inbox: string | undefined,
    storage: string | undefined
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
    const storageQuad
          = profileQuads.find(quad => quad.predicate.value === 'http://www.w3.org/ns/pim/space#storage');

    return {
        webId: webId ,
        givenName: givenNameQuad?.object.value ,
        familyName: familyNameQuad?.object.value ,
        name:  nameQuad?.object.value ,
        image: imageQuad?.object.value,
        inbox: inboxQuad?.object.value,
        storage: storageQuad?.object.value
    };
}

