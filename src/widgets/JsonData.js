import { ref, get, getDatabase } from 'firebase/database';
import firebase from 'firebase/app';
import 'firebase/database';
import { db } from '../Config';

//Frank's Middle
export async function getAllData() {
  try {
    const dbRef = ref(db);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const jsonString = JSON.stringify(data);
      // console.log(jsonString);
      return jsonString;
    } else {
      console.log("No data available");
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

//function to get the data of a match a team played in the case of missing data
export async function getData(path) {
  try {
    const dbRef = ref(db, path);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const jsonString = JSON.stringify(data);
      return jsonString;
    } else {
      console.log("No data available");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

