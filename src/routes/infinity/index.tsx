import { $, component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { QueryClient } from '@tanstack/query-core';
import {
	useInfiniteQuery,
	useIsFetching
} from '~/qwik-query';
import { queryClientState } from '~/qwik-query/utils';

export const queryFuntion = $(async (): Promise<Array<any>> => {
	const response = await fetch('https://jsonplaceholder.typicode.com/users', {
		method: 'GET',
	});
	return response.json();
});

const queryKey = ['post'];

export const useRouteLoader = routeLoader$(async () => {
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey,
		queryFn: $(async (): Promise<Array<any>> => {
			const response = await fetch(
				'https://jsonplaceholder.typicode.com/users',
				{
					method: 'GET',
				}
			);
			return response.json();
		}),
	});
	return queryClientState(queryClient);
});

export default component$(() => {
	const queryStore = useInfiniteQuery(
		{
			queryKey,
			queryFn: queryFuntion,
			getPreviousPageParam: $((firstPage, pages) => {
				console.log('getPreviousPageParam', { firstPage: firstPage.nextCursor, pages, length: pages.length });
				return pages.length > 1
			}),
			getNextPageParam: $((lastPage, pages) => {
				console.log('getNextPageParam', { lastPage, pages, length: pages.length });
				if (pages.length < 3) {
					return pages.length;
				}
				return undefined;
			}),
		},
		useRouteLoader().value
	);
	const isFetchingSig = useIsFetching();
	return (
		<div>
			<button
				disabled={!queryStore.result.hasPreviousPage}
				onClick$={() => {
					console.log('refetch', queryStore);
					queryStore.result.fetchPreviousPage()
				}}
			>
				{'<---'}
			</button>
			<button
				disabled={!queryStore.result.hasNextPage}
				onClick$={() => {
					console.log('refetch', queryStore);
					queryStore.result.fetchNextPage()
				}}
			>
				{'--->'}
			</button>
			<br></br>
			isFetch: {isFetchingSig.value}
			<br></br>
			hasNextPage: {queryStore.result.hasNextPage ? 'true' : 'false'} <br></br>
			Status: {queryStore.result.status} <br></br>
			Lenght: {queryStore.result.data?.pages?.length} <br></br>
		</div>
	);
});
