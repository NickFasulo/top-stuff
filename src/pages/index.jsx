import React from 'react'
import Head from 'next/head'
import { Wrap, Box } from '@chakra-ui/react'
import { useInfiniteQuery } from 'react-query'
import MovieCard from '../components/MovieCard'
import CustomSpinner from '../components/CustomSpinner'
import InfiniteScroll from 'react-infinite-scroll-component'

export default function Home() {
  const { data, status, fetchNextPage, hasNextPage } = useInfiniteQuery(
    'infiniteMovies',
    async ({ pageParam = 1 }) =>
      await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}&page=${pageParam}`
      ).then(result => result.json()),
    {
      getNextPageParam: (lastPage, pages) => {
        if (pages.length <= 10) {
          return pages.length + 1
        }
      }
    }
  )

  return (
    <>
      <Head>
        <title>Top Stuff</title>
        <meta name='description' content='Top Stuff' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Box height='100vh'>
        {status !== 'success' ? (
          <CustomSpinner />
        ) : (
          <InfiniteScroll
            dataLength={data?.pages.length * 20}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={<h2 style={{ textAlign: 'center' }}>Loading...</h2>}
          >
            <Wrap justify='center'>
              {data?.pages.map((page, i) => (
                <React.Fragment key={i}>
                  {page.results.map((movie, i) => (
                    <MovieCard key={i + 1} movie={movie} />
                  ))}
                </React.Fragment>
              ))}
            </Wrap>
          </InfiniteScroll>
        )}
      </Box>
    </>
  )
}
