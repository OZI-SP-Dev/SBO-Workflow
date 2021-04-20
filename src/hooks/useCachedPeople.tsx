import { useEffect, useState } from "react";
import { IPerson } from "../api/DomainObjects";

export interface ICachedPeople {
    getCachedPeople: () => IPerson[],
    cachePerson: (person: IPerson) => void
}

const SBO_CACHED_PEOPLE: string = "sboCachedPeople";

export const useCachedPeople = (): ICachedPeople => {

    const getCachedPeople = () => {
        const cachedPeople = localStorage.getItem(SBO_CACHED_PEOPLE);
        return cachedPeople ? JSON.parse(cachedPeople) : [];
    };

    const cachePerson = (person: IPerson) => {
        const people = getCachedPeople();
        if (people.findIndex((p: IPerson) => p.EMail === person.EMail) < 0) {
            localStorage.setItem(SBO_CACHED_PEOPLE, JSON.stringify([...people, person]));
        }
    }

    return { getCachedPeople, cachePerson };
}