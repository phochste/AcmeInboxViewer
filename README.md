# Acme InboxViewer

An implemenatation of a [Mellon project](https://knows.idlab.ugent.be/projects/mellon/) LDN inbox
based on [Solid](https://solidproject.org).

The Mellon _ResearcherPod_ is a 3 year project 2020-2023 to create decentralized services for
scholarly communication. One of the challenges of this project is to create a messaging system
between Solid Pod that is used by researchers and service providers to communicate about 
scholarly artifacts (research papers, datasets, ...) and services on top of these artifacts 
(registration, endorsement, discovery, archivation). The project is using 
[Linked Data Notifications](https://www.w3.org/TR/ldn/) as a network protocol and a profile
of [ActivityStreams 2.0](https://mellonscholarlycommunication.github.io/spec-notifications/) as
message payload.

The Acme InboxViewer is a Solid application to send and receive such messages via a personal
inbox that is made available on Solid Pods.

# Features

- [ ] Open inbox
    - [x] Open single inbox via web profile
    - [ ] Select inbox from web profile
    - [ ] Open inbox by reference
- [ ] List inbox resources
    - [x] List AS2 resources
    - [x] List other resources
    - [x] List resource metadata (modified, url)
    - [x] List AS2 content (types,actors)
    - [x] Sorted by date
    - [] Sorted by name,type
- [x] Reload inbox
    - [x] Reload via a button
    - [x] Reload via web sockets
- [ ] Paging of inbox resources
    - [x] Client based paging
    - [ ] Server based paging
- [x] Delete resources
    - [x] Delete single resources
    - [x] Delete selected resources
    - [x] Delete all resources on a page
- [ ] View inbox message
    - [x] View basic metadata
    - [ ] View object
        - [x] View flat object list
        - [ ] View object by RDF template
    - [ ] View message source
    - [ ] Open a inbox message via URL
- [x] Reply to a message
- [ ] New message
    - [x] Send a Note
    - [x] Send a Document
    - [x] Send a Reltionship
    - [ ] Send any RDF Form
    - [x] Select target from `foaf:knows` in web profile
    - [ ] Create a new target from web id
        - [x] By parsing web id as RDF resource
        - [ ] By parsing web id as RDFa resource
    - [ ] Create new message via URL reference
    - [x] Select Mellon Activity Types
    - [x] Select Mellon Activity Subtypes
    - [ ] Add own subtypes
    - [x] Select local resources by autocomplete


# Compiling the source code

```
cd AcmeInboxViewer
npm install
npm run dev
```
