import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

function queryErrHandler(error: unknown) {
  if (error instanceof AxiosError) {
    // const errMsg = error.message ? error.message : 'Error connecting to server';
    // Inesrt logic here for error handling
  }
}

export function generateQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 5 * (60 * 1000), // 5 mins, it depends
        refetchInterval: 6 * (60 * 1000), // 6 mins
      },
      mutations: {
        onError: queryErrHandler,
      },
    },
  }); // soon, will edit the global config
}

export const queryClient = generateQueryClient();
