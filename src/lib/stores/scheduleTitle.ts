import { writable } from 'svelte/store';
// type scheduleTitle = {
//     name: string;
//   };


export const scheduleTitle = writable<string>('Schedule Title');