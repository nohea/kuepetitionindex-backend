
// const parse = await import("csv-parse").then((module) => module.parse);
import { parse } from 'csv-parse/sync';
import * as fs from "fs";
import Bottleneck from "bottleneck";

import { insertPetitioner } from './lib/graphql-mutations.js';
import { Petitioner } from './models/Petitioner.js';

console.log("kuepc loader");

let inputfile = process.argv[2] || '';

console.log(`npm run load '${inputfile}'`);

const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT || '';

const inputStr = fs.readFileSync(inputfile, "utf8");

console.log("HASURA_GRAPHQL_ENDPOINT: ", HASURA_GRAPHQL_ENDPOINT);

// read petitioners import csv file
let petitioners: Array<any> = [];
petitioners = parse(inputStr.trim(), {
  columns: true
});

// console.log("petitioners: ", petitioners);

console.log("petitioners length: ", petitioners.length);

const limiter = new Bottleneck({
  minTime: 1100,
  maxConcurrent: 1,
});

petitioners.forEach(async (record, index) => {
    console.log("record ", record);

    const pet = new Petitioner(record);

    // -> insert new pet 
    // console.log(`-> insert new pet ${pet.family_name} ${pet.given_name}`);
    // const rv = await insertPetitioner(pet, 'admin', '');
    // console.log("insert pet rv: ", rv);

    // https://github.com/SGrondin/bottleneck#readme
    const wrapped = limiter.wrap(insertPetitioner);
    const result = await wrapped(pet, 'admin', '');

});

async function fakeInsert(pet: any) {
    // -> insert new pet 
    console.log(`-> fake insert new pet ${pet.family_name} ${pet.given_name}`);
    // const rv = await insertPetitioner(pet, 'admin', '');
    // console.log("insert pet rv: ", rv);
}

