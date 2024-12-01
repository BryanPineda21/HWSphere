import React,{useState} from "react";
import { InstantSearch, Hits, Stats } from "react-instantsearch";
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import NextUiSearch from "./customSearchBox";


// Bryan NOTES: remember to remove the API key before pushing to GitHub, turn into an environment variable
const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: 'iBGxcv7eINoJ1RtPfOuETcvzH3dInn8j', // Use your Search API Key
    nodes: [
      {
        host: 'hkjezcyq5xd1al3wp-1.a1.typesense.net', // Your Typesense Cloud host
        port: '443',
        protocol: 'https',
      },
    ],
  },
  additionalSearchParameters: {
    query_by: 'title,description', // Specify the fields to search by
  },
});


const searchClient = typesenseInstantsearchAdapter.searchClient;

const Hit = ({ hit }) => (
  <div className="bg-white border border-gray-500 rounded-lg shadow-md p-4 transition-transform duration-200 hover:-translate-y-1">
  <h3 className="text-lg font-semibold text-gray-800 mb-2">{hit.title}</h3>
  </div>
);

const DiscoverPage = () =>{


  
    return(

        <div className="DiscoverPage">
          

        <h1 className="home-h1 flex justify-center text-center text-5xl pt-16">Discover Shared Projects</h1>
 


          <InstantSearch indexName="projects" 
          searchClient={searchClient}  
          future={{
            preserveSharedStateOnUnmount: true
          }}
          className="max-w-full sm:max-w-full md:max-w-full  lg:max-w-full h-full">
              
                <NextUiSearch />
                <Stats/>
                <div className="p-4 pl-40 pr-40">
                <Hits 
                  hitComponent={Hit}
                  classNames={{
                    root: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
                    list: "contents",
                  }}
                   />
                 </div>
                </InstantSearch>
            
      




        </div>
    )


 }


 export default DiscoverPage;

