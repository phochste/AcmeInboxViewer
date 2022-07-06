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
import { FOAF , LDP } from '@inrupt/vocab-common-rdf';

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

export type ProfileType = {
    webId: string,
    givenName: string | null,
    familyName: string | null,
    name: string | null,
    img: string | null,
    inbox: string | null,
    storage: string | null,
    knows: string[] | null,
    data?: SolidDataset 
};

export async function fetchUserProfile(webId: string) : Promise<ProfileType> {
    const dataset      = await getSolidDataset(webId);
    const me           = getThing(dataset,webId);
    const givenName    = getString(me,FOAF.givenName);
    const familyName   = getString(me,FOAF.familyName);
    const name         = getString(me,FOAF.name);
    const img          = getUrl(me,FOAF.img);
    const inbox        = getUrl(me,LDP.inbox);
    const storage      = getUrl(me,'http://www.w3.org/ns/pim/space#storage');
    const knows        = getUrlAll(me,FOAF.knows);

    return {
        webId: webId ,
        givenName: givenName,
        familyName: familyName, 
        name:  name,
        img: img ,
        inbox: inbox ,
        storage: storage ,
        knows: knows ,
        data: dataset
    };
}