import { writable } from 'svelte/store';
import type { ProfileType, InboxListing } from './util';

export const selectedInboxState = writable<InboxListing | undefined>(undefined)
export const profileState = writable<ProfileType | undefined>(undefined);
export const inboxListState = writable<InboxListing[]>([]);
export const selectedNotificationListState = writable<string[]>([]);

loadInitialConfig()


selectedInboxState.subscribe(value => { 
  if (value) {
    window.localStorage.setItem('selectedInboxState', JSON.stringify(value))
  } else { 
    window.localStorage.removeItem('selectedInboxState')
  }
})

// profileState.subscribe(value => { 
//   window.localStorage.setItem('profileState', JSON.stringify(value))
// })

inboxListState.subscribe(value => { 
  if (value) {
    window.localStorage.setItem('inboxListState', JSON.stringify(value))
  } else { 
    window.localStorage.removeItem('inboxListState')
  }  
})

selectedNotificationListState.subscribe(value => { 
  if (value) {
    window.localStorage.setItem('selectedNotificationListState', JSON.stringify(value))
  } else { 
    window.localStorage.removeItem('selectedNotificationListState')
  }
})


function loadInitialConfig() { 
  console.log('Loading config from session storage')

  let selectedInboxStateValue = window.localStorage.getItem('selectedInboxState')
  // let profileStateValue = window.localStorage.getItem('profileState')
  let inboxListStateValue = window.localStorage.getItem('inboxListState')
  let selectedNotificationListStateValue = window.localStorage.getItem('selectedNotificationListState')

  console.log(selectedInboxStateValue)
  if (selectedInboxStateValue) {
    console.log(typeof(selectedInboxStateValue))
    selectedInboxState.set(JSON.parse(selectedInboxStateValue))
  } else { 
    selectedInboxState.set(undefined)
  }

  // if (profileStateValue) {
  //   profileState.set(JSON.parse(profileStateValue))
  // } else { 
  //   profileState.set(undefined)
  // }

  if (inboxListStateValue) {
    inboxListState.set(JSON.parse(inboxListStateValue))
  } else { 
    inboxListState.set([])
  }

  if (selectedNotificationListStateValue) {
    selectedNotificationListState.set(JSON.parse(selectedNotificationListStateValue))
  } else { 
    selectedNotificationListState.set([])
  }
}