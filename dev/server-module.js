import { mainDbConnection } from "./db.js";
import "dotenv/config";
import { WatchlistScraper } from "imdb-watchlist-scraper";
import redisClient from "./redis.js";
import objectHash from "object-hash";
const TITLETYPES = {
  movie: ["movie", "tvMovie", "tvSpecial"],
  tvSeries: ["tvMiniSeries", "tvSeries"],
};

const infoDbName = process.env.MYSQL_INFO_DB_NAME;

async function retrieveMethod({ tconst, res }) {
  try {
    const result = await mainDbConnection("title as t")
      .select(
        "t.tconst",
        "t.primaryTitle",
        "t.startYear",
        "t.averageRating",
        "tf.titleType_str"
      )
      .join("titleType_ref as tf", "t.titleType", "tf.titleType_id")
      .where("t.tconst", tconst)
      .join(
        function () {
          this.select("tg.tconst")
            .from("title_genres as tg")
            .join("genres_ref as gf", "tg.genres", "gf.genres_id")
            .where("tg.tconst", tconst)
            .groupBy("tg.tconst")
            .select(
              mainDbConnection.raw(
                'GROUP_CONCAT(gf.genres_str SEPARATOR ", ") as genres'
              )
            )
            .as("tg");
        },
        "t.tconst",
        "tg.tconst"
      )
      .select("tg.genres");

    if (result) {
      res.json(result[0]);
    }
  } catch (error) {
    console.error(error);
  }
}

async function scrapeImdbAndSendToSQL({ imdbUserId, res }) {
  if (imdbUserId !== undefined) {
    try {
      const userData = await mainDbConnection(`${infoDbName}.username_ref`)
        .select("imdbUserId", "imdbUsername", "syncState", "lastSyncTime")
        .where("imdbUserId", imdbUserId);
      const userDataObj = userData[0];
      // if there is already an ongoing scraping request deny this one
      if (!!userDataObj && userDataObj.syncState === 1) {
        res.sendStatus(429);
        return;
      }

      await mainDbConnection(`${infoDbName}.username_ref`)
        .insert({
          imdbUserId: imdbUserId,
          syncState: 1,
        })
        .onConflict("imdbUserId")
        .merge();

      const imdbScraper = new WatchlistScraper({
        userId: imdbUserId,
        timeoutInMs: 180000,
      });

      // throws error on empty obj, timeout or private watchlist
      const imdbScrapeObj = await imdbScraper.watchlistGrabIds();

      const arrOfInsertObj = imdbScrapeObj.idArr.map((id) => {
        return {
          imdbUserId: imdbUserId,
          tconst: id,
        };
      });

      await mainDbConnection(`${infoDbName}.user_seen_content`)
        .insert(arrOfInsertObj)
        .onConflict()
        .ignore();

      const watchlistSeenCount = await getSeenIdCount(imdbUserId);

      const lastSyncTime = new Date();
      await mainDbConnection(`${infoDbName}.username_ref`)
        .insert({
          imdbUserId: imdbUserId,
          syncState: 2,
          imdbUsername: imdbScrapeObj.username,
          lastSyncTime: lastSyncTime,
        })
        .onConflict("imdbUserId")
        .merge();

      res.json({
        syncState: 2,
        lastSyncTime: lastSyncTime,
        imdbUsername: imdbScrapeObj.username,
        watchlistSeenCount: watchlistSeenCount,
      });
    } catch (error) {
      await mainDbConnection(`${infoDbName}.username_ref`)
        .insert({
          imdbUserId: imdbUserId,
          syncState: 0,
        })
        .onConflict("imdbUserId")
        .merge();
      console.error(error);
      res.json({ syncState: 0, errorMessage: error.name });
    }
  }
}

async function getSeenIdCount(imdbUserId) {
  const idCount = await mainDbConnection(`${infoDbName}.user_seen_content`)
    .count("imdbUserId AS count")
    .where("imdbUserId", imdbUserId);
  return idCount[0].count;
}

async function getUserImdbInfo({ imdbUserId }) {
  const userData = await mainDbConnection(`${infoDbName}.username_ref`)
    .select("imdbUserId", "imdbUsername", "syncState", "lastSyncTime")
    .where("imdbUserId", imdbUserId);
  const userDataObj = userData[0];

  const watchlistSeenCount = await getSeenIdCount(imdbUserId);
  if (!!watchlistSeenCount && !!userDataObj) {
    userDataObj["watchlistSeenCount"] = watchlistSeenCount;
  }

  return userDataObj;
}
async function submitMethod({ userInput, res }) {
  res.set("Cache-Control", "public, max-age=18000");
  const userInputHash = objectHash(userInput);
  const cachedData = await redisClient.get(userInputHash);
  if (redisClient.isOpen && cachedData) {
    res.json(JSON.parse(cachedData));
    return;
  }
  // form filters
  const contentTypes = userInput["content-types"];
  const minRating = userInput["minrating"];
  let genres = userInput["genres"];

  // Already suggested IDs
  const alreadySuggestedIdArr = userInput["seenIds"];

  // settings
  let minVotes = userInput.settings.minvotes;
  const yearRange = userInput.settings.yearrange;
  const imdbUserId = userInput.settings.imdbUserId;

  // convert contentType strings to IDs by querying SQL ref table
  let titleTypes = [];
  if (contentTypes) {
    for (const contentType of contentTypes) {
      titleTypes = titleTypes.concat(TITLETYPES[contentType]);
    }
    titleTypes = await strArrToIDArr({
      strArray: titleTypes,
      refTable: "titleType_ref",
    });
  }

  // Genres obj has "isRecommend" for each genre - 0 = false, 1 = true
  // also converts genre strings to IDs by querying SQL ref table
  let recommendGenres = [];
  let dontRecommendGenres = [];
  if (typeof genres !== "undefined") {
    for (const genre of genres) {
      const isRecommend = parseInt(genre["isRecommend"]);
      const genreName = genre["genreName"];
      if (!!isRecommend) {
        recommendGenres.push(genreName);
      } else {
        dontRecommendGenres.push(genreName);
      }
    }
    let genresArrOfArr = [recommendGenres, dontRecommendGenres];
    for (let i = 0; i < genresArrOfArr.length; i++) {
      const genreArr = genresArrOfArr[i];
      if (Array.isArray(genreArr) && genreArr.length) {
        genresArrOfArr[i] = await strArrToIDArr({
          strArray: genreArr,
          refTable: "genres_ref",
        });
      }
    }
    recommendGenres = genresArrOfArr[0];
    dontRecommendGenres = genresArrOfArr[1];
  }

  try {
    const output = await mainDbConnection("title")
      .select("title.tconst")
      .modify((query) => {
        if (Array.isArray(recommendGenres) && recommendGenres.length) {
          query.innerJoin(
            mainDbConnection("title_genres")
              .select("tconst", "genres")
              .whereIn("title_genres.genres", recommendGenres)
              .as("matched_genres"),
            "title.tconst",
            "matched_genres.tconst"
          );
        }
      })
      .modify((query) => {
        if (Array.isArray(dontRecommendGenres) && dontRecommendGenres.length) {
          query.whereNotExists(
            mainDbConnection("title_genres")
              .select("tconst", "genres")
              .whereIn("title_genres.genres", dontRecommendGenres)
              .whereRaw("title.tconst = title_genres.tconst")
          );
        }
      })
      .modify((query) => {
        if (
          Array.isArray(titleTypes) &&
          titleTypes.length &&
          titleTypes.length !== 5
        ) {
          query.whereIn("title.titleType", titleTypes);
        }
      })
      .modify((query) => {
        if (!!minRating && minRating > 0) {
          query.andWhere("title.averageRating", ">=", minRating[0]);
        }
      })
      .modify((query) => {
        if (
          Array.isArray(alreadySuggestedIdArr) &&
          alreadySuggestedIdArr.length
        ) {
          query.whereNotIn("title.tconst", alreadySuggestedIdArr);
        }
      })
      .modify((query) => {
        if (imdbUserId !== undefined) {
          query.whereNotIn(
            "title.tconst",
            mainDbConnection(`${infoDbName}.user_seen_content`)
              .select("tconst")
              .where("imdbUserId", imdbUserId)
          );
        }
      })
      .modify((query) => {
        if (
          Array.isArray(yearRange) &&
          yearRange.length &&
          (yearRange[0] !== 1894 || yearRange[1] !== new Date().getFullYear())
        ) {
          query.andWhereBetween("title.startYear", yearRange);
        }
      })
      .modify((query) => {
        if (!!minVotes) {
          minVotes = Math.floor(minVotes);
          query.andWhere("title.numVotes", ">=", minVotes);
        } else if (minVotes !== 0) {
          query.andWhere("title.numVotes", ">=", 5000);
        }
      });
    if (Array.isArray(output) && output.length) {
      const outputArr = output.map(({ tconst }) => tconst);
      if (redisClient.isOpen) {
        await redisClient.set(userInputHash, JSON.stringify(outputArr), {
          EX: 1200,
        });
      }
      res.json(outputArr);
    } else {
      res.status(404).end();
      return;
    }
  } catch (error) {
    console.error(error);
  }
}

function getDataFromTmdbApi({ tconstObj }) {
  const tconst = tconstObj["tconst"];
  const url = `https://api.themoviedb.org/3/find/${tconst}?external_source=imdb_id`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: process.env.TMDB_API_KEY,
    },
  };
  const response = fetch(url, options)
    .then((res) => res.json())
    .catch((err) => console.error("error:" + err));
  return response;
}

async function strArrToIDArr({ strArray, refTable }) {
  try {
    const output = await mainDbConnection(refTable).select("*");
    let convertObj = {};
    for (const obj of output) {
      const values = Object.values(obj);
      convertObj[values[1]] = values[0];
    }
    strArray = strArray.map((str) => convertObj[str]);
    return strArray;
  } catch (error) {
    console.error(error);
  }
}

function ifStringToArray(variable) {
  if (!variable || Array.isArray(variable)) {
    return variable;
  }
  return [variable];
}

export {
  submitMethod,
  retrieveMethod,
  getDataFromTmdbApi,
  scrapeImdbAndSendToSQL,
  getUserImdbInfo,
};
