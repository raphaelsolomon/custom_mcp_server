import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";
import fetch from "cross-fetch";

export const createApolloClient = (
  uri: string,
  headers: Record<string, string> = {}
) => {
  return new ApolloClient({
    link: new HttpLink({ uri, fetch, headers }),
    cache: new InMemoryCache(),
  });
};