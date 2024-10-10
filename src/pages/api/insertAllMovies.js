import supabase from '../../lib/supabaseClient'
const TMDB_API_KEY = process.env.TMDB_API_KEY

// Fetch movie IDs from a specific category
const fetchMoviesFromCategory = async (category, page) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${category}?api_key=${TMDB_API_KEY}&page=${page}`
  )
  const data = await response.json()
  return data.results.map(movie => ({ tmdb_id: movie.id }))
}

const deleteMoviesFromDB = async (categoryId, limit) => {
  const { data: existingMovies, error: fetchError } = await supabase
    .from('movie_categories')
    .select('tmdb_id')
    .eq('category_id', categoryId)

  if (fetchError) {
    console.error('Error fetching existing movies:', fetchError)
    throw fetchError
  }

  if (existingMovies.length >= limit) {
    const moviesToDelete = existingMovies
      .slice(0, existingMovies.length - limit + 1)
      .map(movie => movie.tmdb_id)

    const { error: deleteError } = await supabase
      .from('movies')
      .delete()
      .in('tmdb_id', moviesToDelete)

    if (deleteError) {
      console.error('Error deleting movies:', deleteError)
      throw deleteError
    }
  }
}

// Fetch detailed movie data for a given movie ID
const fetchMovieDetails = async tmdbId => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.TMDB_API_KEY}`
  )
  const data = await response.json()
  return data
}

const handleMovieCollection = async belongs_to_collection => {
  if (!belongs_to_collection) {
    return null
  }

  try {
    const collection = belongs_to_collection

    // Check if the collection already exists in the database
    const { data: existingCollection, error: collectionFetchError } =
      await supabase
        .from('collections')
        .select('id')
        .eq('tmdb_id', collection.id)
        .single()

    if (collectionFetchError) {
      console.error('Error fetching collection:', collectionFetchError)
      throw collectionFetchError
    }

    if (existingCollection) {
      // Return the ID of the existing collection
      return existingCollection.id
    } else {
      // Insert the new collection into the collections table
      const { data: newCollection, error: collectionInsertError } =
        await supabase
          .from('collections')
          .insert({
            tmdb_id: collection.id,
            name: collection.name,
            poster_path: collection.poster_path,
            backdrop_path: collection.backdrop_path
          })
          .select('id') // Return the ID of the inserted collection
          .single()

      if (collectionInsertError) {
        console.error('Error inserting collection:', collectionInsertError)
        throw collectionInsertError
      }

      // Return the newly inserted collection ID
      return newCollection.id
    }
  } catch (error) {
    console.error('Error handling movie collection:', error)
    throw error
  }
}

const handleMovieGenres = async movieGenres => {
  try {
    for (const genre of movieGenres) {
      // Check if the genre already exists in the database
      const { data: existingGenre, error: genreFetchError } = await supabase
        .from('genres')
        .select('id')
        .eq('tmdb_id', genre.id)
        .single()

      if (genreFetchError) {
        console.error('Error fetching genre:', genreFetchError)
        throw genreFetchError
      }

      let genreId
      if (existingGenre) {
        genreId = existingGenre.id
      } else {
        // Insert the new genre into the genres table
        const { data: newGenre, error: genreInsertError } = await supabase
          .from('genres')
          .insert({
            tmdb_id: genre.id,
            name: genre.name
          })
          .select('id')
          .single()

        if (genreInsertError) {
          console.error('Error inserting genre:', genreInsertError)
          throw genreInsertError
        }
        genreId = newGenre.id
      }

      // Insert into movie_genres relationship table
      const { error: movieGenreInsertError } = await supabase
        .from('movie_genres')
        .insert({
          movie_id: movieDetails.id, // The TMDB movie ID
          genre_id: genreId
        })

      if (movieGenreInsertError) {
        console.error('Error inserting movie_genres:', movieGenreInsertError)
        throw movieGenreInsertError
      }
    }
  } catch (error) {
    console.error('Error handling movie genres:', error)
    throw error
  }
}

// Rate-limiting function (40 requests per second)
const rateLimit = async (requests, limit = 40) => {
  const batches = []

  for (let i = 0; i < requests.length; i += limit) {
    batches.push(requests.slice(i, i + limit))
  }

  for (const batch of batches) {
    await Promise.all(batch.map(request => request()))
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

// Insert movies into DB after fetching details
const insertMoviesIntoDB = async (movies, categoryId) => {
  const fetchMovieDetailTasks = movies.map(movie => async () => {
    try {
      // Fetch movie details before inserting
      const movieDetails = await fetchMovieDetails(movie.tmdb_id)

      // Handle movie collection logic
      const collectionId = await handleMovieCollection(
        movieDetails.belongs_to_collection
      )

      // Handle inserting genres and movie_genres relationship
      await handleMovieGenres(movieDetails.genres, movieDetails.id)

      // Insert movie details into the database
      const { error: insertError } = await supabase.from('movies').insert({
        tmdb_id: movieDetails.id,
        title: movieDetails.title,
        overview: movieDetails.overview,
        release_date: movieDetails.release_date,
        runtime: movieDetails.runtime,
        popularity: movieDetails.popularity,
        vote_average: movieDetails.vote_average,
        vote_count: movieDetails.vote_count,
        poster_path: movieDetails.poster_path,
        backdrop_path: movieDetails.backdrop_path,
        homepage: movieDetails.homepage,
        imdb_id: movieDetails.imdb_id,
        tagline: movieDetails.tagline,
        status: movieDetails.status,
        category_id: categoryId
      })

      // If the movie belongs to a collection, insert the movie_collection relationship
      if (collectionId) {
        const { error: insertMovieCollectionError } = await supabase
          .from('movie_collections')
          .insert({
            movie_id: movieDetails.id, // The TMDB movie ID
            collection_id: collectionId // The ID of the collection from the database
          })

        if (insertMovieCollectionError) {
          console.error(
            'Error inserting movie_collection:',
            insertMovieCollectionError
          )
          throw insertMovieCollectionError
        }
      }

      if (insertError) {
        console.error('Error inserting movie:', insertError)
        throw insertError
      }
    } catch (error) {
      console.error('Error fetching movie details or inserting movie:', error)
    }
  })

  // Apply rate limiting for movie details fetching (40 requests per second)
  await rateLimit(fetchMovieDetailTasks, 40)
}

const fetchCategoriesFromDB = async () => {
  const { data, error } = await supabase.from('categories').select('id, name')

  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }

  return data
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async function handler(req, res) {
  try {
    await fetchAndInsertGenres()
    const categories = await fetchCategoriesFromDB()
    const totalRequests = 10
    const movieLimitPerCategory = 10000

    for (const { id, name } of categories) {
      let allMovies = []

      for (let i = 1; i <= totalRequests; i++) {
        const movies = await fetchMoviesFromCategory(name, i)
        allMovies = allMovies.concat(movies)
        await delay(1000)
      }

      // Insert movies into DB after fetching details
      await deleteMoviesFromDB(id, movieLimitPerCategory)
      await insertMoviesIntoDB(allMovies, id)
    }

    res
      .status(200)
      .json({ message: 'Movies and genres fetched and inserted successfully!' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      error: 'An error occurred while fetching and inserting movies and genres.'
    })
  }
}
