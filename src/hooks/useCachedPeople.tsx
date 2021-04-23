import { useEffect, useState } from "react";
import { IPerson } from "../api/DomainObjects";

export interface ICachedPeople {
    getCachedPeople: () => IPerson[],
    cachePerson: (person: IPerson) => void,
    removePersonFromCache: (title: string) => IPerson[]
}

const SBO_CACHED_PEOPLE: string = "sboCachedPeople";

export const useCachedPeople = (): ICachedPeople => {

    const getCachedPeople = () => {
        const cachedPeople = localStorage.getItem(SBO_CACHED_PEOPLE);
        return cachedPeople ? JSON.parse(cachedPeople) : [];
    };

    const cachePerson = (person: IPerson) => {
        const people: IPerson[] = getCachedPeople();
        // always put the new person at the front and filter them out of the old list to prevent duplicates
        localStorage.setItem(SBO_CACHED_PEOPLE, JSON.stringify([person, ...people.filter(p => p.EMail !== person.EMail)]));
    }

    const removePersonFromCache = (title: string): IPerson[] => {
        const people: IPerson[] = getCachedPeople().filter((p: IPerson) => p.Title !== title);
        localStorage.setItem(SBO_CACHED_PEOPLE, JSON.stringify([...people]));
        return people;
    }

    return { getCachedPeople, cachePerson, removePersonFromCache };
}