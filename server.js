import { ApolloServer ,gql } from 'apollo-server';
import fetch from 'node-fetch';
 
let tweets = [
    {
        id: "1",
        text: "first one",
        userId: "1",
    },
    {
        id: "2",
        text: "second one",
        userId: "2",
    },
    {
        id: "3",
        text: "third one",
        userId: "3",
    }
]

let users = [
    {
        userId: "1",
        username: "juik",
        firstName: "kim",
        lastName: "juik",
    },
    {
        userId: "2",
        username: "songi",
        firstName: "park",
        lastName: "songi",
    },
    {
        userId: "3",
        username: "eron",
        firstName: "mask",
        lastName: "eron",
    }
]

const typeDefs = gql`
    type User {
        userId: ID!
        username: String!
        firstName: String!
        lastName: String!
        """
        fullName 은 조합된 데이터 입니다.
        """
        fullName: String!
    }    

"""
type Tweet 는 테스트 입니다.
"""
    type Tweet {
        id: ID!
        text: String!
        author: User!
    }

    type PageInfo {
        totalCount:Int! 
        tweets: [Tweet]
    }

    type Query {
        allTweets: PageInfo!
        tweet(id: ID!): Tweet
        allUsers: [User]
        findTweetByText(text: String!): [Tweet]
        allMovies: [Movie!]!
        movie(id: ID!): Movie
    }

    type Mutation {
        postTweet(text: String!, userId: ID!): Tweet!
        deleteTweet(id: ID!): Boolean
    }

    type Movie {
        id: ID!
        url: String
        imdb_code: String
        title: String
        title_english: String
        title_long: String
        slug: String
        year: Int
        rating: Float
        runtime: Int
        genres: [String]
        summary: String
        description_full: String
        synopsis: String
        yt_trailer_code: String
        language: String
        mpa_rating: String
        background_image: String
        background_image_original: String
        small_cover_image: String
        medium_cover_image: String
        large_cover_image: String
    }
`;

const resolvers = {
    Query: {
        allTweets(){
            return {
                totalCount: tweets.length,
                tweets: tweets
            }
        },
        tweet(__, {id}){
            console.log("tweet called! id : ", id);
            return tweets.find(tweet => tweet.id === id);
        },
        findTweetByText(__, {text}){
            const findTweets = tweets.filter(tweet => tweet.text.includes(text));
            if(findTweets){
                return findTweets;
            }
            return [];
        },
        allUsers() {
            return users;
        },
        allMovies(){
            return fetch("https://yts.mx/api/v2/list_movies.json")
            .then(res => res.json())
            .then(json => json.data.movies);
        },
        movie(root, {id}){
            console.log("movie called! id : ", id,root);
            return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
            .then(res => res.json())
            .then(json => json.data.movie);
        }
    },
    Mutation: {
        postTweet(__, {text, userId}){
            const newTweet = {
                id: tweets.length + 1,
                text,
                userId: userId
            }
            tweets.push(newTweet);
            return newTweet;
        },
        deleteTweet(__, {id}){
            const tweet = tweets.find(tweet => tweet.id === id);
            if(!tweet) {
                return false;
            }
            tweets = tweets.filter(tweet => tweet.id !== id);
            return true;
        }
    },
    Tweet: {
        author(root){
            console.log("root:",root);
            return users.find(user => user.userId === root.userId)
        }
    },
    User: {
        fullName({firstName, lastName}){
            
            return `${firstName} ${lastName}`
        }
    }
}

const server = new ApolloServer({typeDefs, resolvers});
server.listen().then(({ url }) => {
    console.log(`Server is running at ${url}`);
});
