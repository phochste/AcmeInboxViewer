import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { getSolidDataset, 
         getStringNoLocale, 
         getThing,
         getUrl, 
         getUrlAll, 
         getStringEnglish,
         getStringByLocaleAll,
         type SolidDataset,
         type Thing
} from '@inrupt/solid-client';
import { FOAF , LDP , RDF } from '@inrupt/vocab-common-rdf';
import type { MessageInfo } from './inbox';

/* 
 * See: https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/authenticate-browser/
 * for documentation on Inrupt Solid Authn API
 */

export function isLoggedIn() : boolean {
    return getDefaultSession().info.isLoggedIn;
}

export function getString(thing: Thing, property: string) : string | null {
    let value = getStringNoLocale(thing,property);

    if (value) {
        return value;
    }

    value = getStringEnglish(thing, property);

    if (value) {
        return value;
    }

    let map = getStringByLocaleAll(thing, property);

    if (map) {
        let values = map.values()?.next()?.value;

        return values && values.length ? values[0] : null;
    }

    return null;
}

export type InboxListingMessageInfo = {
    listing: InboxListing,
    inboxResources: MessageInfo[],
}

export type InboxListing = {
    inboxUrl: string,
    agentId?: string
}

export type ProfileType = {
    webId: string,
    givenName: string | null,
    familyName: string | null,
    name: string | null,
    img: string | null,
    inbox: string | null,
    storage: string | null,
    knows: string[] | null,
    types: string[] | null,
    data?: SolidDataset 
};

export async function fetchUserProfile(webId: string) : Promise<ProfileType> {
    const dataset = await getSolidDataset(webId);
    const thing   = getThing(dataset,webId);
    return profileData(dataset,thing);
}

function profileData(dataset: SolidDataset, thing: Thing) : ProfileType {
    const givenName    = getString(thing,FOAF.givenName);
    const familyName   = getString(thing,FOAF.familyName);
    const name         = getString(thing,FOAF.name);
    const img          = getUrl(thing,FOAF.img);
    const inbox        = getUrl(thing,LDP.inbox);
    const storage      = getUrl(thing,'http://www.w3.org/ns/pim/space#storage');
    const knows        = getUrlAll(thing,FOAF.knows);
    const types        = getUrlAll(thing,RDF.type);

    return {
        webId: thing.url ,
        givenName: givenName,
        familyName: familyName, 
        name:  name,
        img: img ,
        inbox: inbox ,
        storage: storage ,
        knows: knows ,
        types: types ,
        data: dataset
    };
}

export async function fetchKnowsProfile(webId: string, userId: string) : Promise<ProfileType | null> {
    const dataset      = await getSolidDataset(webId);
    const me           = getThing(dataset, webId);
    const knows        = getUrlAll(me,FOAF.knows);


    if (! knows) {
        return null;
    }

    if (! knows.includes(userId)) {
        return null;
    } 

    const thing = getThing(dataset,userId);

    if (! thing) {
        return null;
    }

    return profileData(dataset,thing);
}