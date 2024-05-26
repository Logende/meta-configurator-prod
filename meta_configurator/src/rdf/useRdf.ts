import jsonld from 'jsonld';
import * as $rdf from 'rdflib';

class RdfService {



}


async function fetchRdfData(uri: string): Promise<string> {
    const response = await fetch(uri);
    if (!response.ok) {
        throw new Error(`Failed to fetch RDF data: ${response.statusText}`);
    }
    return response.text();
}
async function parseRdfData(rdfContent: string, baseURI: string) {
    const store = $rdf.graph();
    $rdf.parse(rdfContent, store, baseURI, 'application/rdf+xml');
    return store;
}

function extractURIs(store: any): { classes: string[], properties: string[] } {
    const classes: string[] = [];
    const properties: string[] = [];

    const classPredicate = $rdf.sym('http://www.w3.org/2000/01/rdf-schema#Class');
    const propertyPredicate = $rdf.sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#Property');

    store.each(undefined, classPredicate).forEach((classNode: any) => {
        classes.push(classNode.value);
    });

    store.each(undefined, propertyPredicate).forEach((propertyNode: any) => {
        properties.push(propertyNode.value);
    });

    return { classes, properties };
}

async function fetchAndExtractURIs(uri: string) {
    try {
        const rdfContent = await fetchRdfData(uri);
        const store = await parseRdfData(rdfContent, uri);
        const { classes, properties } = extractURIs(store);
        return { classes, properties };
    } catch (error) {
        console.error('Error fetching and extracting URIs:', error);
        throw error;
    }
}

function suggestURIs(uris: string[], searchTerm: string): string[] {
    return uris.filter(uri => uri.includes(searchTerm));
}

export async function findSuggestionsForSearchTerm(searchTerm: string) {
    const endpointUrl = 'https://dbpedia.org/sparql';

    console.log("try suggest url")
    try {
        const results = await fetchAndQueryRdf(endpointUrl, searchTerm);
        return results
    } catch (error) {
        throw error;
    }
}




async function performSparqlQuery(endpointUrl: string, searchTerm: string) {
    const query = `
    SELECT DISTINCT ?subject
    WHERE {
      ?subject a ?type .
      FILTER (
        regex(str(?subject), "${searchTerm}", "i") &&
        (?type = <http://www.w3.org/2002/07/owl#Class> || ?type = <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property>)
      )
    }
    ORDER BY STRLEN(REPLACE(STR(?subject), "${searchTerm}", ""))
    LIMIT 20
  `;


    const url = `${endpointUrl}?query=${encodeURIComponent(query)}&format=json`;

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/sparql-results+json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.bindings.map((binding: any) => { return binding.subject.value });
}

async function fetchAndQueryRdf(endpointUrl: string, searchTerm: string) {
    try {
        const results = await performSparqlQuery(endpointUrl, searchTerm);
        return results;
    } catch (error) {
        console.error('Error fetching and querying RDF data:', error);
        throw error;
    }
}


const rdfService  = new RdfService();

export function useRdfService () : RdfService{
    return rdfService;
}
